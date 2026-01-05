import * as types from './actionTypes';
import routes from 'services/routes.jsx';
import {store} from 'app.jsx';
import md5 from 'md5';


export function updateStatus() {
  return {type: types.UPDATE_STATUS, data: "loading"}
}

export function onSubmit(sequence, databases, r2dt = false, rfam = false) {
  // Format sequence for R2DT/Infernal - needs FASTA format
  let fastaSequence = sequence;
  if (!/^>/.test(sequence)) {
    fastaSequence = ">query\n" + sequence;
  }

  return function(dispatch) {
    // Submit to our proxy API which handles parallel submission to all databases
    fetch(routes.proxySubmitJob(), {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sequence: sequence,
        databases: databases && databases.length > 0 ? databases : null
      })
    })
    .then(function (response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then(data => {
        // Proxy API returns JSON with job_id
        dispatch({type: types.SUBMIT_JOB, status: 'success', data: { job_id: data.job_id }});
        dispatch(fetchStatus(data.job_id));

        // Submit R2DT job directly with the sequence we have
        if (r2dt) {
          dispatch(r2dtSubmit(fastaSequence));
        }

        // Submit Infernal cmscan job for Rfam classification
        if (rfam) {
          dispatch(infernalSubmit(fastaSequence));
        }
    })
    .catch(async (error) => {
      if (error.statusText === undefined) {
        dispatch({type: types.SUBMIT_JOB, status: 'error', response: "The sequence search is temporarily unreachable. Please try again later."})
      } else {
        dispatch({type: types.SUBMIT_JOB, status: 'error', response: error.statusText})
      }
    });
  }
}

export function r2dtSubmit(sequence) {
  let query = "";
  if (/^>/.test(sequence)) { query = sequence }
  else { query = ">description\n" + sequence }

  return function(dispatch) {
    fetch(routes.submitR2DTJob(), {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `email=rnacentral%40gmail.com&sequence=${encodeURIComponent(query)}`
    })
    .then(function (response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(data => {
        dispatch({type: types.SUBMIT_R2DT_JOB, status: 'success', data: data});
        dispatch(fetchR2DTStatus(data, true));
    })
    .catch(error => {
        dispatch({type: types.SUBMIT_R2DT_JOB, status: 'error', response: error});
    });
  }
}

export function infernalSubmit(sequence) {
  let query = "";
  if (/^>/.test(sequence)) { query = sequence }
  else { query = ">query\n" + sequence }

  // Build form data for Infernal cmscan
  const formData = new URLSearchParams();
  formData.append('email', 'rnacentral@ebi.ac.uk');
  formData.append('sequence', query);
  formData.append('thresholdmodel', 'cut_ga');

  return function(dispatch) {
    fetch(routes.infernalSubmitJob(), {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })
    .then(function (response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(jobId => {
        dispatch({type: types.SUBMIT_INFERNAL_JOB, status: 'success', data: jobId.trim()});
        dispatch(fetchInfernalJdStatus(jobId.trim()));
    })
    .catch(async (error) => {
        dispatch({type: types.SUBMIT_INFERNAL_JOB, status: 'error', response: error});
    });
  }
}

export function fetchInfernalJdStatus(jobId) {
  return function(dispatch) {
    fetch(routes.infernalJdJobStatus(jobId), {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(status => {
      const statusText = status.trim();
      if (statusText === 'RUNNING' || statusText === 'PENDING' || statusText === 'QUEUED') {
        let statusTimeout = setTimeout(() => store.dispatch(fetchInfernalJdStatus(jobId)), 2000);
        dispatch({type: types.SET_INFERNAL_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (statusText === 'FINISHED') {
        dispatch(fetchInfernalJdResults(jobId));
      } else if (statusText === 'NOT_FOUND') {
        dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'does_not_exist'});
      } else if (statusText === 'FAILURE' || statusText === 'ERROR') {
        dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'error'});
      }
    })
    .catch(error => {
      dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'error'});
    });
  }
}

export function fetchInfernalJdResults(jobId) {
  return function(dispatch) {
    // Try to fetch tblout format first (easier to parse)
    fetch(routes.infernalJdJobTblout(jobId), {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(tbloutData => {
      // Parse the tblout format
      const parsedResults = parseInfernalTblout(tbloutData);

      if (parsedResults.length > 0) {
        // Now fetch the full output to get alignments
        return fetch(routes.infernalJdJobResult(jobId), {
          method: 'GET',
          headers: { 'Accept': 'text/plain' }
        })
        .then(response => response.ok ? response.text() : '')
        .then(outData => {
          // Parse alignments from the out file and merge with tblout results
          const alignments = parseInfernalAlignments(outData);

          // Merge alignments into results - try both target_name and accession_rfam as keys
          parsedResults.forEach(result => {
            if (alignments[result.target_name]) {
              result.alignment = alignments[result.target_name];
            } else if (alignments[result.accession_rfam]) {
              result.alignment = alignments[result.accession_rfam];
            }
          });

          dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'success', data: parsedResults});
        });
      } else {
        dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'success', data: parsedResults});
      }
    })
    .catch(error => {
      // Fallback to parsing the out file directly
      fetch(routes.infernalJdJobResult(jobId), {
        method: 'GET',
        headers: { 'Accept': 'text/plain' }
      })
      .then(response => response.ok ? response.text() : '')
      .then(outData => {
        const parsedResults = parseInfernalOutput(outData);
        dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'success', data: parsedResults});
      })
      .catch(err => {
        dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'error'});
      });
    });
  }
}

// Parse Infernal cmscan tblout (tabular) format
function parseInfernalTblout(output) {
  const results = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Skip empty lines and comments
    if (!line.trim() || line.startsWith('#')) continue;

    // Normalize whitespace and split
    const parts = line.replace(/\s+/g, ' ').trim().split(' ');

    // tblout format columns:
    // 0: target_name (e.g., "U3")
    // 1: accession_rfam (e.g., "RF00012")
    // 2: query_name
    // 3: accession_seq
    // 4: mdl
    // 5: mdl_from
    // 6: mdl_to
    // 7: seq_from
    // 8: seq_to
    // 9: strand
    // 10: trunc
    // 11: pipeline_pass
    // 12: gc
    // 13: bias
    // 14: score
    // 15: e_value
    // 16: inc (! = included above GA threshold, ? = below threshold)
    // 17+: description

    if (parts.length >= 17) {
      const inc = parts[16];

      // Only include results that pass the gathering threshold (inc = '!')
      // '?' means the hit is below the gathering threshold cutoff
      if (inc !== '!') {
        continue;
      }

      results.push({
        target_name: parts[0],
        accession_rfam: parts[1],
        description: parts.slice(17).join(' ') || parts[0], // Use description if available, else target_name
        seq_from: parseInt(parts[7], 10),
        seq_to: parseInt(parts[8], 10),
        strand: parts[9],
        score: parseFloat(parts[14]),
        e_value: parts[15],
        alignment: '' // Will be filled from out file
      });
    }
  }

  // Filter overlapping hits - keep only the best scoring hit for each region
  // Two hits overlap if their sequence ranges intersect
  const filteredResults = [];
  const sortedResults = results.sort((a, b) => b.score - a.score); // Sort by score descending

  for (const hit of sortedResults) {
    // Check if this hit overlaps with any already accepted hit
    const overlaps = filteredResults.some(accepted => {
      // Check if on same strand and regions overlap
      if (accepted.strand !== hit.strand) return false;

      const aStart = Math.min(accepted.seq_from, accepted.seq_to);
      const aEnd = Math.max(accepted.seq_from, accepted.seq_to);
      const bStart = Math.min(hit.seq_from, hit.seq_to);
      const bEnd = Math.max(hit.seq_from, hit.seq_to);

      // Check for overlap (ranges intersect if one starts before the other ends)
      return aStart <= bEnd && bStart <= aEnd;
    });

    if (!overlaps) {
      filteredResults.push(hit);
    }
  }

  return filteredResults;
}

// Parse alignments from Infernal cmscan out file
function parseInfernalAlignments(output) {
  const alignments = {};
  const lines = output.split('\n');

  let currentKey = null;
  let currentAccession = null;
  let alignmentStartIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for hit header: >> U3
    // Format in out file is: >> family_name (not accession like in tblout)
    if (line.startsWith('>>')) {
      // Extract family name from header
      const parts = line.substring(2).trim().split(/\s+/);
      const familyName = parts[0]; // e.g., U3
      currentKey = familyName;
      currentAccession = familyName;
      alignmentStartIndex = -1;
      continue;
    }

    // Look for the NC (no cutoff) or alignment block start
    // The alignment block starts after lines like:
    //  (1) !  199.2  0.0  4e-49  ...
    // and contains the actual alignment with structure annotations
    if (currentAccession && line.match(/^\s+\(\d+\)\s+[!?]/)) {
      // This is the hit details line, alignment comes after
      // Skip a few lines to get to the actual alignment
      alignmentStartIndex = i + 1;
      continue;
    }

    // Capture alignment block - it typically has NC, CS lines and sequence lines
    // Look for the pattern that indicates we're in an alignment block
    if (currentAccession && alignmentStartIndex > 0 && i >= alignmentStartIndex) {
      // Alignment blocks have a specific structure:
      // - Empty line
      // - NC line (optional)
      // - CS line (consensus structure)
      // - Model sequence line
      // - Match line
      // - Query sequence line
      // - PP line (posterior probability)

      // Collect lines until we hit an empty line followed by another >> or end
      let alignmentLines = [];
      let j = alignmentStartIndex;

      // Skip any initial empty lines
      while (j < lines.length && lines[j].trim() === '') {
        j++;
      }

      // Collect alignment block lines
      while (j < lines.length) {
        const alignLine = lines[j];

        // Stop if we hit another hit header or internal stats section
        if (alignLine.startsWith('>>') || alignLine.startsWith('Internal')) {
          break;
        }

        // Stop if we hit an empty line followed by non-alignment content
        if (alignLine.trim() === '') {
          // Look ahead to see if there's more alignment or we're done
          let k = j + 1;
          while (k < lines.length && lines[k].trim() === '') {
            k++;
          }
          if (k < lines.length && (lines[k].startsWith('>>') || lines[k].startsWith('Internal') || lines[k].match(/^\s*$/))) {
            break;
          }
        }

        alignmentLines.push(alignLine);
        j++;
      }

      if (alignmentLines.length > 0) {
        alignments[currentAccession] = alignmentLines.join('\n').trim();
      }

      // Move to end of this alignment block
      alignmentStartIndex = -1;
    }
  }

  return alignments;
}

// Parse Infernal cmscan text output into structured data
// The output is the verbose format from cmscan, not tblout
function parseInfernalOutput(output) {
  const results = [];
  const lines = output.split('\n');

  // Track current hit being parsed
  let currentHit = null;
  let inAlignmentBlock = false;
  let alignmentLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Look for hit header: >> accession  family_name
    // Example: >> RF00012  U3
    if (line.startsWith('>>')) {
      // Save previous hit if exists
      if (currentHit && currentHit.accession_rfam) {
        if (alignmentLines.length > 0) {
          currentHit.alignment = alignmentLines.join('\n');
        }
        results.push(currentHit);
      }

      // Parse new hit header
      const headerParts = line.substring(2).trim().split(/\s+/);
      currentHit = {
        accession_rfam: headerParts[0] || '',
        target_name: headerParts[0] || '', // Use accession as target_name for link
        description: headerParts.slice(1).join(' ') || headerParts[0] || '', // Family name
        seq_from: '',
        seq_to: '',
        score: '',
        e_value: '',
        strand: '',
        alignment: ''
      };
      alignmentLines = [];
      inAlignmentBlock = false;
      continue;
    }

    // Look for hit details line with rank, E-value, score, etc.
    // Example:  (1) !   199.2   0.0   4e-49   4e-49     2   218     1   217      + cm    no    1.00 [-]
    const hitDetailsMatch = line.match(/^\s+\(\d+\)\s+[!?]\s+([\d.]+)\s+([\d.]+)\s+([\d.e+-]+)\s+([\d.e+-]+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+([+-])/);
    if (hitDetailsMatch && currentHit) {
      currentHit.score = hitDetailsMatch[1];       // bit score
      // hitDetailsMatch[2] is bias
      currentHit.e_value = hitDetailsMatch[3];     // E-value
      // hitDetailsMatch[4] is clan E-value
      // hitDetailsMatch[5] is mdl_from
      // hitDetailsMatch[6] is mdl_to
      currentHit.seq_from = hitDetailsMatch[7];    // seq from
      currentHit.seq_to = hitDetailsMatch[8];      // seq to
      currentHit.strand = hitDetailsMatch[9];      // strand (+ or -)
      continue;
    }

    // Check if we're starting an alignment section
    // Alignment blocks start with a line like:  NC and start with accession
    if (currentHit && (line.includes('CS') || line.match(/^\s+[A-Z]+\s/))) {
      // We're in or near an alignment block - skip for now
      // The actual alignment is complex multi-line format
    }

    // Capture alignment lines (lines that look like sequence alignment)
    // These typically have the query name or accession followed by sequence
    if (currentHit && line.trim().length > 0) {
      // Check for alignment format lines - they typically have coordinates
      const alignMatch = line.match(/^\s+(\S+)\s+\d+\s+([A-Za-z.-]+)\s+\d+$/);
      if (alignMatch) {
        alignmentLines.push(line);
      }
      // Also capture consensus/structure lines
      else if (line.match(/^\s+[<>.:,_~-]+\s*$/) || line.match(/^\s+[\*:. ]+\s*$/)) {
        alignmentLines.push(line);
      }
    }
  }

  // Don't forget the last hit
  if (currentHit && currentHit.accession_rfam) {
    if (alignmentLines.length > 0) {
      currentHit.alignment = alignmentLines.join('\n');
    }
    results.push(currentHit);
  }

  return results;
}

export function onMultipleSubmit(sequence, databases) {
  let jobIds = [];
  let url = window.location.href;

  return async function(dispatch) {
    dispatch({type: types.BATCH_SEARCH, data: true});
    for (let i = 0; i < sequence.length; i++) {
      let newQuery = sequence[i];
      newQuery && await fetch(routes.submitJob(), {
        method: 'POST',
        mode: 'cors',
        credentials: 'include',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: newQuery,
          databases: databases,
          url: url,
          priority: 'low'
        })
      })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          jobIds = [...jobIds, {"jobid": "", "description": "Error submitting sequence. Check your fasta file and try again later.", "sequence": ""}];
        }
      })
      .then(data => {
        let querySplit = newQuery.split("\n");
        let description = querySplit.shift();
        let seq = querySplit.join('');
        jobIds = [...jobIds, {"jobid": data.job_id, "description": description, "sequence": seq}];
        if (jobIds.length === sequence.length) {
          dispatch({type: types.BATCH_SEARCH, data: false});
          dispatch({type: types.UPDATE_STATUS, data: "submitted"});
          dispatch({type: types.SUBMIT_MULTIPLE_JOB, status: 'success', data: jobIds});
        }
      })
      .catch(error => dispatch({type: types.SUBMIT_MULTIPLE_JOB, status: 'error', response: error}));
    }
  }
}

export function onSubmitUrs(urs, database, r2dt, rfam = false) {
  return function(dispatch) {
    fetch(routes.rnacentralUrs(urs))
    .then(function(response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then(data => {
      if(data.sequence.length < 10 || data.sequence.length > 7000) {
        dispatch({type: types.SUBMIT_URS, status: 'invalid', data: data.sequence});
        dispatch(invalidSequence())
      } else {
        dispatch(updateSequence(data.sequence));
        dispatch(onSubmit(data.sequence, database, r2dt, rfam));
      }
    })
    .catch(error => {dispatch({type: types.SUBMIT_URS, status: 'error', response: error})});
  }
}

export function updateSequence(sequence) {
  return {type: types.UPDATE_SEQUENCE, data: sequence}
}

export function updateJobId(jobId, r2dt = false) {
  return function(dispatch) {
    dispatch({type: types.UPDATE_JOB_ID, data: jobId});
    dispatch(fetchStatus(jobId));
  }
}

export function onClearJobId() {
  return {type: types.CLEAR_JOB_ID}
}

export function onClearResult() {
  return {type: types.CLEAR_RESULT}
}

export function invalidSequence() {
  return {type: types.INVALID_SEQUENCE}
}

export function fetchStatus(jobId) {
  return function(dispatch) {
    fetch(routes.proxyJobStatus(jobId), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then((data) => {
      const status = data.status;

      // Proxy API status values: running, finished, error, not_found
      if (status === 'running') {
        // Update the search progress using progress from the API
        let currentState = store.getState();
        let newSearchInProgress = [...currentState.searchInProgress];
        let foundJobId = newSearchInProgress.find(el => el.jobId === jobId);
        const progress = data.progress || 0;
        if (foundJobId){
          foundJobId['finishedChunk'] = Math.min(progress, 99);
        } else {
          newSearchInProgress.push({jobId: jobId, finishedChunk: progress});
        }
        dispatch({type: types.SEARCH_PROGRESS, data: newSearchInProgress });

        let statusTimeout = setTimeout(() => store.dispatch(fetchStatus(jobId)), 2000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (status === 'finished') {
        dispatch(fetchResults(jobId));
      } else if (status === 'error' || status === 'not_found') {
        dispatch(failedFetchResults({ status: 500 }));
      }
    })
    .catch(error => {
      if (store.getState().hasOwnProperty('statusTimeout')) {
        clearTimeout(store.getState().statusTimeout);
      }
      dispatch(failedFetchResults(error))
    });
  }
}

export function fetchR2DTStatus(jobId, saveR2DTId = false) {
  return function(dispatch) {
    fetch(routes.r2dtJobStatus(jobId), {
      method: 'GET',
      headers: { 'Accept': 'text/plain' }
    })
    .then(function(response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then((data) => {
      const status = data.trim();

      if (status === 'RUNNING' || status === 'QUEUED') {
        let statusTimeout = setTimeout(() => store.dispatch(fetchR2DTStatus(jobId, saveR2DTId)), 2000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (status === 'FINISHED') {
        let statusTimeout = setTimeout(() => dispatch({type: types.FETCH_R2DT_STATUS, status: 'FINISHED'}), 1000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
        dispatch(fetchR2DTThumbnail(jobId));
      } else if (status === 'NOT_FOUND') {
        dispatch({type: types.FETCH_R2DT_STATUS, status: 'NOT_FOUND'})
      } else if (status === 'FAILURE') {
        dispatch({type: types.FETCH_R2DT_STATUS, status: 'FAILURE'})
      } else if (status === 'ERROR') {
        dispatch({type: types.FETCH_R2DT_STATUS, status: 'ERROR'})
      }
    })
    .catch(error => {
      if (store.getState().hasOwnProperty('statusTimeout')) {
        clearTimeout(store.getState().statusTimeout);
      }
      dispatch({type: types.FETCH_R2DT_STATUS, status: 'error'})
    });
  }
}

export function fetchInfernalStatus(jobId) {
  return function(dispatch) {
    fetch(routes.infernalJobStatus(jobId), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then((data) => {
      if (data.status === 'started' || data.status === 'pending') {
        let statusTimeout = setTimeout(() => store.dispatch(fetchInfernalStatus(jobId)), 2000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (data.status === 'success') {
        dispatch(fetchInfernalResults(jobId));
      }
    })
    .catch(error => {
      if (store.getState().hasOwnProperty('statusTimeout')) {
        clearTimeout(store.getState().statusTimeout); // clear status timeout
      }
      dispatch(failedFetchInfernalResults(error))
    });
  }
}

export function fetchResults(jobId) {
  return async function(dispatch) {
    try {
      // Fetch results from proxy API (includes facets)
      const response = await fetch(routes.proxyJobResults(jobId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();

      // Transform proxy API response to match expected format
      const results = {
        job_id: data.job_id,
        entries: data.entries || [],
        hitCount: data.hit_count || 0,
        facets: parseFacets(data.facets || []),
        textSearchError: false,
        sequenceSearchStatus: data.status === 'finished' ? 'success' : 'error'
      };

      dispatch({type: types.FETCH_RESULTS, status: 'success', data: results});
      dispatch(dataForDownload());
    } catch (error) {
      dispatch(failedFetchResults(error));
    }
  }
}

// Parse facets from proxy API response
function parseFacets(ebiFacets) {
  if (!ebiFacets) return [];

  const facetOrder = ['rna_type', 'TAXONOMY', 'expert_db', 'qc_warning_found', 'has_go_annotations', 'has_conserved_structure', 'has_genomic_coordinates', 'popular_species', 'length'];

  const facets = ebiFacets.map(facet => ({
    id: facet.id,
    label: facet.label,
    total: facet.total,
    facetValues: (facet.facetValues || []).map(fv => ({
      label: fv.label,
      value: fv.value,
      count: fv.count
    }))
  }));

  // Sort facets according to predefined order
  facets.sort((a, b) => {
    const aIndex = facetOrder.indexOf(a.id);
    const bIndex = facetOrder.indexOf(b.id);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // Merge popular_species into TAXONOMY
  const popularSpeciesIndex = facets.findIndex(f => f.id === 'popular_species');
  const taxonomyIndex = facets.findIndex(f => f.id === 'TAXONOMY');

  if (popularSpeciesIndex !== -1 && taxonomyIndex !== -1) {
    const popularSpecies = facets[popularSpeciesIndex];
    const taxonomy = facets[taxonomyIndex];

    // Prepend popular species to taxonomy, avoiding duplicates
    const existingValues = new Set(taxonomy.facetValues.map(fv => fv.value));
    const newFacetValues = [...popularSpecies.facetValues.filter(fv => !existingValues.has(fv.value)), ...taxonomy.facetValues];
    taxonomy.facetValues = newFacetValues;

    // Remove popular_species facet
    facets.splice(popularSpeciesIndex, 1);
  }

  return facets;
}

export function fetchR2DTThumbnail(jobId) {
  return function(dispatch) {
    fetch(routes.r2dtThumbnail(jobId), {
      method: 'GET',
      headers: { 'Accept': 'text/plain' },
    })
    .then(function (response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(data => {
      if (data){
        dispatch({type: types.FETCH_R2DT_THUMBNAIL, status: 'success', thumbnail: routes.r2dtThumbnail(jobId)})
      } else {
        dispatch({type: types.FETCH_R2DT_THUMBNAIL, status: 'success', thumbnail: null})
      }
    })
    .catch(error => dispatch({type: types.FETCH_R2DT_THUMBNAIL, status: 'error'}));
  }
}

export function fetchInfernalResults(jobId) {
  return function(dispatch) {
    fetch(routes.infernalJobResult(jobId), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then(data => dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'success', data: data}))
    .catch(error => dispatch(failedFetchInfernalResults(error)));
  }
}

export function failedFetchResults(response) {
  if (response && response.status === 404) {
    return { type: types.FAILED_FETCH_RESULTS, status: "does_not_exist", start: 0 };
  } else {
    // Default to error for any other status or missing response
    return { type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 };
  }
}

export function failedFetchInfernalResults(response) {
  if (response.status === 404) {
    return { type: types.FAILED_FETCH_INFERNAL_RESULTS, status: "does_not_exist" };
  } else if (response.status === 500) {
    return { type: types.FAILED_FETCH_INFERNAL_RESULTS, status: "error" };
  }
}

export function onFilterResult() {
  let state = store.getState();

  return async function(dispatch) {
    try {
      // Use proxy API filter endpoint
      const response = await fetch(routes.proxyFilterResults(state.jobId), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selected_facets: state.selectedFacets,
          text_filter: state.filter || null
        })
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();

      // Transform proxy API response to match expected format
      const results = {
        job_id: data.job_id,
        entries: data.entries || [],
        hitCount: data.hit_count || 0,
        facets: parseFacets(data.facets || []),
        textSearchError: false
      };

      dispatch({type: types.FETCH_RESULTS, status: 'success', data: results});
      dispatch(dataForDownload());
    } catch (error) {
      dispatch({type: types.FETCH_RESULTS, status: 'error'});
    }
  }
}

export function onToggleFacet(event, facet, facetValue) {
  return async function (dispatch) {
    let state = store.getState();

    let selectedFacets = {...state.selectedFacets};

    if (!state.selectedFacets.hasOwnProperty(facet.id)) {  // all values in clicked facet are unchecked
      selectedFacets[facet.id] = [facetValue.value];
    } else {
      let index = state.selectedFacets[facet.id].indexOf(facetValue.value);
      if (index === -1) {
        selectedFacets[facet.id].push(facetValue.value);
      }  // this value is not checked, check it
      else {
        selectedFacets[facet.id].splice(index, 1); // this value is checked, uncheck it
        if (selectedFacets[facet.id].length === 0) { delete selectedFacets[facet.id]; }
      }
    }

    dispatch({type: types.TOGGLE_FACET, id: facet.id, value: facetValue.value});

    // Build text filter from the filter input
    const textFilter = state.filter || null;

    try {
      // Use proxy API filter endpoint
      const response = await fetch(routes.proxyFilterResults(state.jobId), {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          selected_facets: selectedFacets,
          text_filter: textFilter
        })
      });

      if (!response.ok) {
        throw response;
      }

      const data = await response.json();

      // Transform proxy API response to match expected format
      const results = {
        job_id: data.job_id,
        entries: data.entries || [],
        hitCount: data.hit_count || 0,
        facets: parseFacets(data.facets || []),
        textSearchError: false
      };

      dispatch({
        type: types.TOGGLE_FACET,
        id: facet.id,
        value: facetValue.value,
        data: results,
        status: 'success',
        selectedFacets: selectedFacets
      });
      dispatch(dataForDownload());
    } catch (error) {
      dispatch({ type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 });
    }
  }
}

export function onReload() {
  return {type: types.RELOAD}
}

export function onLoadMore(event) {
  let state = store.getState();

  return function(dispatch) {
    dispatch({type: types.LOAD_MORE});

    // Proxy API returns all results at once
    // Client-side pagination is handled by the component
    return fetch(routes.proxyJobResults(state.jobId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(data => {
        const results = {
          job_id: data.job_id,
          entries: data.entries || [],
          hitCount: data.hit_count || 0,
          facets: parseFacets(data.facets || []),
          textSearchError: false
        };
        dispatch({type: types.LOAD_MORE, data: results})
      })
      .catch(response => dispatch({ type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 }))
  }
}

export function onSort(event) {
  let ordering = event.target.value;
  let state = store.getState();

  return function(dispatch) {
    dispatch({type: types.SORT_RESULTS});

    // Re-fetch and sort client-side
    return fetch(routes.proxyJobResults(state.jobId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(data => {
        const results = {
          job_id: data.job_id,
          entries: data.entries || [],
          hitCount: data.hit_count || 0,
          facets: parseFacets(data.facets || []),
          textSearchError: false
        };
        dispatch({type: types.SORT_RESULTS, data: results, ordering: ordering});
        dispatch(dataForDownload());
      })
      .catch(response => dispatch({ type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 }));
  };
}

export function onToggleAlignmentsCollapsed() {
  return {type: types.TOGGLE_ALIGNMENTS_COLLAPSED}
}

export function onToggleDetailsCollapsed() {
  return {type: types.TOGGLE_DETAILS_COLLAPSED}
}

export function toggleInfernalAlignmentsCollapsed() {
  return {type: types.TOGGLE_INFERNAL_ALIGNMENTS_COLLAPSED };
}

export function onSequenceTextAreaChange(event) {
  return function(dispatch) {
    let sequence = event.target.value;
    dispatch({type: types.TEXTAREA_CHANGE, sequence: sequence});

    return fetch(routes.searchEndpoint(md5(sequence.toUpperCase().replace(/U/g, 'T'))))
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(data => dispatch({type: types.EXACT_MATCH, data: data}))
  }
}

export function onExampleSequence(sequence) {
  return function(dispatch) {
    dispatch({type: types.EXAMPLE_SEQUENCE, sequence: sequence});

    return fetch(routes.searchEndpoint(md5(sequence.toUpperCase().replace(/U/g, 'T'))))
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(data => dispatch({type: types.EXACT_MATCH, data: data}))
  }
}

export function onFilterChange(event) {
  return {type: types.FILTER_CHANGE, data: event.target.value}
}

export function onClearSequence() {
  return {type: types.CLEAR_SEQUENCE}
}

export function onFileUpload (event) {
  return function(dispatch) {
    let fileReader = new FileReader();

    fileReader.onloadend = (event) => {
      let fileContent = event.target.result;
      dispatch({type: types.FILE_UPLOAD, sequence: fileContent});
    };

    fileReader.onerror = (event) => {
      dispatch({type: types.CLEAR_SEQUENCE})
    };

    fileReader.readAsText(event.target.files[0]);
    return fileReader;
  };
}

export function dataForDownload() {
  let state = store.getState();

  return async function(dispatch) {
    dispatch({type: types.DOWNLOAD, status: "clear"})

    // Proxy API returns all results at once
    await fetch(routes.proxyJobResults(state.jobId), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then((data) => {
      dispatch({type: types.DOWNLOAD, status: "success", data: data.entries || []})
    })
    .catch(response => dispatch({ type: types.DOWNLOAD, status: "error" }));
  }
}

export function onSaveR2DTId(job_id, r2dt_id) {
  return function(dispatch) {
    fetch(routes.saveR2DTId(job_id), {
      method: 'PATCH',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        r2dt_id: r2dt_id,
      })
    })
  }
}

export function onShowAdmin() {
  return function(dispatch) {
    dispatch({type: types.SHOW_ADMIN});
    dispatch(updateAdmin());
  }
}

export function onShowLastJob() {
  return {type: types.SHOW_LAST_JOB}
}

export function updateAdmin() {
  return function(dispatch) {
    dispatch(numberOfConsumers());
    dispatch(checkAllJobs());
  }
}

export function numberOfConsumers() {
  return function(dispatch) {
    fetch(routes.consumersStatuses(), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json(); }
      else { throw response; }
    })
    .then(data => dispatch({type: types.CONSUMERS, data: data}))
  }
}

export function checkAllJobs() {
  let state = store.getState();
  return function(dispatch) {
    fetch(routes.jobsStatuses(), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json(); }
      else { throw response; }
    })
    .then(data => {
        if (state.showAdmin) {
          dispatch({type: types.JOBS_STATUSES, data: data});
          let jobsStatusesTimeout = setTimeout(() => dispatch(updateAdmin()), 2000);
          dispatch({type: types.SET_JOBS_STATUSES_TIMEOUT, timeout: jobsStatusesTimeout});
        } else if (store.getState().hasOwnProperty('jobsStatusesTimeout')) {
          clearTimeout(store.getState().jobsStatusesTimeout); // clear timeout
        }
    })
    .catch(error => {
      if (store.getState().hasOwnProperty('jobsStatusesTimeout')) {
        clearTimeout(store.getState().jobsStatusesTimeout); // clear timeout
      }
    });
  }
}