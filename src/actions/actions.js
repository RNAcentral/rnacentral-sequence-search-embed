import * as types from './actionTypes';
import routes from 'services/routes.jsx';
import {store} from 'app.jsx';
import md5 from 'md5';


/**
 * Builds text query for sending to text search backend from this.state.selectedFacets
 * @returns {string | *}
 */
let buildQuery = function (selectedFacets) {
  let state = store.getState();
  let outputText, outputClauses = [];

  Object.keys(selectedFacets).map(facetId => {
    let facetText, facetClauses = [];
    selectedFacets[facetId].map(facetValueValue => facetClauses.push(`${facetId}:"${facetValueValue}"`));
    facetText = facetClauses.join(" OR ");

    if (facetText !== "") outputClauses.push("(" + facetText + ")");
  });

  if (state.filter) {
    outputClauses.push("(" + state.filter + ")")
  }

  outputText = outputClauses.join(" AND ");
  return outputText;
};

export function updateStatus() {
  return {type: types.UPDATE_STATUS, data: "loading"}
}

export function onSubmit(sequence, databases, r2dt= false) {
  // Format sequence for Job Dispatcher - needs FASTA format
  let fastaSequence = sequence;
  if (!/^>/.test(sequence)) {
    fastaSequence = ">query\n" + sequence;
  }

  // Build the form data for Job Dispatcher
  // Format: email=rnacentral%40ebi.ac.uk&database=rfam-0&sequence=<fasta>
  const formData = new URLSearchParams();
  formData.append('email', 'rnacentral@ebi.ac.uk');
  formData.append('database', databases[0] || 'rfam-0'); // Use first database or default
  formData.append('sequence', fastaSequence);

  console.log('[DEBUG] onSubmit - submitting job to Job Dispatcher');
  console.log('[DEBUG] onSubmit - URL:', routes.jdSubmitJob());
  console.log('[DEBUG] onSubmit - sequence:', fastaSequence);
  console.log('[DEBUG] onSubmit - database:', databases[0] || 'rfam-0');

  return function(dispatch) {
    fetch(routes.jdSubmitJob(), {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData.toString()
    })
    .then(function (response) {
      console.log('[DEBUG] onSubmit - response status:', response.status);
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(jobId => {
        console.log('[DEBUG] onSubmit - received job ID:', jobId);
        // Job Dispatcher returns plain text job ID
        dispatch({type: types.SUBMIT_JOB, status: 'success', data: { job_id: jobId.trim() }});
        dispatch(fetchStatus(jobId.trim(), r2dt));
        // Infernal search is not available with Job Dispatcher - skip it
        // dispatch(fetchInfernalStatus(jobId.trim()));
    })
    .catch(async (error) => {
      console.error('[DEBUG] onSubmit - error:', error);
      // Try to get more details from the error response
      if (error.text) {
        const errorText = await error.text();
        console.error('[DEBUG] onSubmit - error response body:', errorText);
      }
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
      body: `email=rnacentral%40gmail.com&sequence=${query}`
    })
    .then(function (response) {
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then(data => {
        dispatch({type: types.SUBMIT_R2DT_JOB, status: 'success', data: data});
        dispatch(fetchR2DTStatus(data, true));
    })
    .catch(error => dispatch({type: types.SUBMIT_R2DT_JOB, status: 'error', response: error}));
  }
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

export function onSubmitUrs(urs, database, r2dt) {
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
        dispatch(onSubmit(data.sequence, database, r2dt));
      }
    })
    .catch(error => {dispatch({type: types.SUBMIT_URS, status: 'error', response: error})});
  }
}

export function updateSequence(sequence) {
  return {type: types.UPDATE_SEQUENCE, data: sequence}
}

export function updateJobId(jobId, r2dt= false) {
  return function(dispatch) {
    dispatch({type: types.UPDATE_JOB_ID, data: jobId});
    dispatch(fetchStatus(jobId, r2dt));
    // Infernal search is not available with Job Dispatcher - skip it
    // dispatch(fetchInfernalStatus(jobId));
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

export function fetchStatus(jobId, r2dt= false) {
  let state = store.getState();

  console.log('[DEBUG] fetchStatus - checking status for job:', jobId);
  console.log('[DEBUG] fetchStatus - URL:', routes.jdJobStatus(jobId));

  return function(dispatch) {
    fetch(routes.jdJobStatus(jobId), {
      method: 'GET',
      headers: {
        'Accept': 'text/plain'
      }
    })
    .then(function(response) {
      console.log('[DEBUG] fetchStatus - response status:', response.status);
      if (response.ok) { return response.text() }
      else { throw response }
    })
    .then((statusText) => {
      const status = statusText.trim();
      console.log('[DEBUG] fetchStatus - job status:', status);

      // Handle r2dt if enabled (submit r2dt job when nhmmer is running)
      if (r2dt && !state.r2dt_id) {
        // For Job Dispatcher, we don't have the query in the status response
        // We'll need to handle r2dt submission differently or skip for now
        console.log('[DEBUG] fetchStatus - r2dt enabled but Job Dispatcher does not return query in status');
      }

      // Job Dispatcher status values: QUEUED, RUNNING, FINISHED, FAILURE, NOT_FOUND, ERROR
      if (status === 'RUNNING' || status === 'QUEUED') {
        console.log('[DEBUG] fetchStatus - job still in progress, will check again');

        // Update the search progress (simplified for Job Dispatcher)
        let currentState = store.getState();
        let newSearchInProgress = [...currentState.searchInProgress];
        let foundJobId = newSearchInProgress.find(el => el.jobId === jobId);
        if (foundJobId){
          // Increment progress slightly for UX feedback
          foundJobId['finishedChunk'] = Math.min(foundJobId['finishedChunk'] + 5, 90);
        } else {
          newSearchInProgress.push({jobId: jobId, finishedChunk: 10});
        }
        dispatch({type: types.SEARCH_PROGRESS, data: newSearchInProgress });

        // Wait a little bit and check it again
        let statusTimeout = setTimeout(() => store.dispatch(fetchStatus(jobId, r2dt)), 2000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (status === 'FINISHED') {
        console.log('[DEBUG] fetchStatus - job FINISHED, fetching results');
        dispatch(fetchResults(jobId));
      } else if (status === 'ERROR' || status === 'FAILURE' || status === 'NOT_FOUND') {
        console.error('[DEBUG] fetchStatus - job failed with status:', status);
        dispatch(failedFetchResults({ status: 500 }));
      }
    })
    .catch(error => {
      console.error('[DEBUG] fetchStatus - error:', error);
      if (store.getState().hasOwnProperty('statusTimeout')) {
        clearTimeout(store.getState().statusTimeout); // clear status timeout
      }
      dispatch(failedFetchResults(error))
    });
  }
}

export function fetchR2DTStatus(jobId, saveR2DTId = false) {
  let state = store.getState();

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
      if (data === 'RUNNING' || data === 'QUEUED') {
        let statusTimeout = setTimeout(() => store.dispatch(fetchR2DTStatus(jobId, saveR2DTId)), 2000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (data === 'FINISHED') {
        // Wait another second to change the status. This will allow the SVG resultType to work correctly.
        let statusTimeout = setTimeout(() => dispatch({type: types.FETCH_R2DT_STATUS, status: 'FINISHED'}), 1000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
        dispatch(fetchR2DTThumbnail(jobId));
        if (saveR2DTId) { dispatch(onSaveR2DTId(state.jobId, jobId)) }
      } else if (data === 'NOT_FOUND') {
        dispatch({type: types.FETCH_R2DT_STATUS, status: 'NOT_FOUND'})
      } else if (data === 'FAILURE') {
        dispatch({type: types.FETCH_R2DT_STATUS, status: 'FAILURE'})
      } else if (data === 'ERROR') {
        dispatch({type: types.FETCH_R2DT_STATUS, status: 'ERROR'})
      }
    })
    .catch(error => {
      if (store.getState().hasOwnProperty('statusTimeout')) {
        clearTimeout(store.getState().statusTimeout); // clear status timeout
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
  let state = store.getState();
  const extraQuery = buildQuery(state.selectedFacets);

  console.log('[DEBUG] fetchResults - fetching results for job:', jobId);
  console.log('[DEBUG] fetchResults - Job Dispatcher URL:', routes.jdJobResult(jobId));

  return function(dispatch) {
    // Step 1: Fetch results from Job Dispatcher
    fetch(routes.jdJobResult(jobId), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      console.log('[DEBUG] fetchResults - Job Dispatcher response status:', response.status);
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then(jsonArray => {
      console.log('[DEBUG] fetchResults - received', jsonArray.length, 'results from Job Dispatcher');

      // Transform Job Dispatcher results to the format expected by the app
      const jdData = parseJobDispatcherJsonResults(jsonArray, jobId);

      // Step 2: Build query with RNAcentral IDs to fetch facets from EBI Search
      if (jdData.entries.length > 0) {
        // Build an OR query with all RNAcentral IDs (limit to first 100 for URL length)
        const idsToQuery = jdData.entries.slice(0, 100).map(e => e.rnacentral_id);
        const idsQuery = idsToQuery.map(id => `entry_type:Sequence AND id:"${id}"`).join(' OR ');

        console.log('[DEBUG] fetchResults - fetching facets from EBI Search for', idsToQuery.length, 'IDs');
        console.log('[DEBUG] fetchResults - EBI Search URL:', routes.ebiSearchByIds(idsQuery, extraQuery, 0, 20));

        return fetch(routes.ebiSearchByIds(idsQuery, extraQuery, 0, 20), {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        .then(response => {
          if (response.ok) { return response.json() }
          else {
            console.warn('[DEBUG] fetchResults - EBI Search failed, returning results without facets');
            return null;
          }
        })
        .then(ebiData => {
          if (ebiData && ebiData.facets) {
            console.log('[DEBUG] fetchResults - received facets from EBI Search:', ebiData.facets.length);
            jdData.facets = parseFacets(ebiData.facets);
            jdData.hitCount = ebiData.hitCount || jdData.entries.length;
          }
          return jdData;
        })
        .catch(err => {
          console.warn('[DEBUG] fetchResults - EBI Search error, returning results without facets:', err);
          return jdData;
        });
      }
      return jdData;
    })
    .then(data => {
      console.log('[DEBUG] fetchResults - final data:', data);
      dispatch({type: types.FETCH_RESULTS, status: 'success', data: data});
      dispatch(dataForDownload());
    })
    .catch(error => {
      console.error('[DEBUG] fetchResults - error:', error);
      dispatch(failedFetchResults(error));
    });
  }
}

// Parse facets from EBI Search response
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

// Helper function to parse Job Dispatcher JSON results into the app's expected format
function parseJobDispatcherJsonResults(jsonData, jobId) {
  console.log('[DEBUG] parseJobDispatcherJsonResults - parsing JSON data');

  // Job Dispatcher returns an array directly with all the fields we need
  const hitArray = Array.isArray(jsonData) ? jsonData : (jsonData.hits || jsonData.results || []);

  console.log('[DEBUG] parseJobDispatcherJsonResults - processing hits:', hitArray.length);

  const entries = hitArray.map((hit, index) => ({
    id: hit.result_id || index,
    rnacentral_id: hit.rnacentral_id,
    description: hit.description || '',
    score: parseFloat(hit.score || 0),
    bias: parseFloat(hit.bias || 0),
    e_value: parseFloat(hit.e_value || 0),
    identity: parseFloat(hit.identity || 0),
    query_coverage: parseFloat(hit.query_coverage || 0),
    target_coverage: parseFloat(hit.target_coverage || 0),
    alignment: hit.alignment || '',
    alignment_length: parseInt(hit.alignment_length || 0),
    target_length: parseInt(hit.target_length || 0),
    query_length: parseInt(hit.query_length || 0),
    gaps: parseFloat(hit.gaps || 0),
    gap_count: parseInt(hit.gap_count || 0),
    match_count: parseInt(hit.match_count || 0),
    nts_count1: parseInt(hit.nts_count1 || 0),
    nts_count2: parseInt(hit.nts_count2 || 0),
    alignment_start: parseFloat(hit.alignment_start || 0),
    alignment_stop: parseFloat(hit.alignment_stop || 0),
  }));

  console.log('[DEBUG] parseJobDispatcherJsonResults - processed entries:', entries.length);

  return {
    job_id: jobId,
    entries: entries,
    hitCount: entries.length,
    facets: [], // Facets would need to come from EBI Search - TODO
    textSearchError: false
  };
}

// Helper function to parse EBI Search results into the app's expected format
function parseEbiSearchResults(ebiData, jobId) {
  console.log('[DEBUG] parseEbiSearchResults - parsing EBI Search response');

  const entries = [];

  if (ebiData.entries) {
    ebiData.entries.forEach((entry, index) => {
      const fields = entry.fields || {};
      entries.push({
        id: index,
        rnacentral_id: entry.id,
        description: Array.isArray(fields.description) ? fields.description[0] : (fields.description || ''),
        score: parseFloat(entry.score || 0),
        e_value: parseFloat(fields.e_value?.[0] || fields.evalue?.[0] || 0),
        identity: parseFloat(fields.identity?.[0] || 0),
        query_coverage: parseFloat(fields.query_coverage?.[0] || 0),
        target_coverage: parseFloat(fields.target_coverage?.[0] || 0),
        alignment: fields.alignment?.[0] || '',
        alignment_length: parseInt(fields.alignment_length?.[0] || 0),
        target_length: parseInt(fields.target_length?.[0] || 0),
        nts_count1: parseInt(fields.nts_count1?.[0] || 0),
        nts_count2: parseInt(fields.nts_count2?.[0] || 0),
        gaps: parseInt(fields.gaps?.[0] || 0),
      });
    });
  }

  console.log('[DEBUG] parseEbiSearchResults - parsed entries:', entries.length);

  // Parse facets
  const facets = [];
  if (ebiData.facets) {
    ebiData.facets.forEach(facet => {
      const facetValues = [];
      if (facet.facetValues) {
        facet.facetValues.forEach(fv => {
          facetValues.push({
            label: fv.label,
            value: fv.value,
            count: fv.count
          });
        });
      }
      facets.push({
        id: facet.id,
        label: facet.label,
        facetValues: facetValues
      });
    });
  }

  console.log('[DEBUG] parseEbiSearchResults - parsed facets:', facets.length);

  return {
    job_id: jobId,
    entries: entries,
    hitCount: ebiData.hitCount || entries.length,
    facets: facets,
    textSearchError: false
  };
}

// Helper function to parse Job Dispatcher XML results into the app's expected format
function parseJobDispatcherResults(xmlDoc, jobId) {
  console.log('[DEBUG] parseJobDispatcherResults - parsing XML document');

  const entries = [];
  const hits = xmlDoc.querySelectorAll('hit');
  console.log('[DEBUG] parseJobDispatcherResults - found hits:', hits.length);

  hits.forEach((hit, index) => {
    const entry = {
      id: index,
      rnacentral_id: hit.getAttribute('id') || hit.querySelector('id')?.textContent || `hit_${index}`,
      description: hit.querySelector('description')?.textContent || hit.getAttribute('description') || '',
      score: parseFloat(hit.querySelector('score')?.textContent || hit.getAttribute('score') || 0),
      e_value: parseFloat(hit.querySelector('evalue')?.textContent || hit.querySelector('e_value')?.textContent || hit.getAttribute('evalue') || 0),
      identity: parseFloat(hit.querySelector('identity')?.textContent || hit.getAttribute('identity') || 0),
      query_coverage: parseFloat(hit.querySelector('query_coverage')?.textContent || hit.getAttribute('query_coverage') || 0),
      target_coverage: parseFloat(hit.querySelector('target_coverage')?.textContent || hit.getAttribute('target_coverage') || 0),
      alignment: hit.querySelector('alignment')?.textContent || '',
      alignment_length: parseInt(hit.querySelector('alignment_length')?.textContent || hit.getAttribute('alignment_length') || 0),
      target_length: parseInt(hit.querySelector('target_length')?.textContent || hit.getAttribute('target_length') || 0),
      nts_count1: parseInt(hit.querySelector('nts_count1')?.textContent || 0),
      nts_count2: parseInt(hit.querySelector('nts_count2')?.textContent || 0),
      gaps: parseInt(hit.querySelector('gaps')?.textContent || hit.getAttribute('gaps') || 0),
    };
    entries.push(entry);
  });

  // Filter out entries without rnacentral_id
  const filteredEntries = entries.filter(entry => entry.rnacentral_id && !entry.rnacentral_id.startsWith('hit_'));
  console.log('[DEBUG] parseJobDispatcherResults - filtered entries:', filteredEntries.length);

  return {
    job_id: jobId,
    entries: filteredEntries,
    hitCount: filteredEntries.length,
    facets: [],
    textSearchError: false
  };
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
  console.error('[DEBUG] failedFetchResults - response:', response);
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
  const extraQuery = buildQuery(state.selectedFacets);

  console.log('[DEBUG] onFilterResult - fetching filtered results');

  return function(dispatch) {
    // First get all results from Job Dispatcher
    fetch(routes.jdJobResult(state.jobId), {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    })
    .then(response => response.ok ? response.json() : Promise.reject(response))
    .then(jsonArray => {
      const jdData = parseJobDispatcherJsonResults(jsonArray, state.jobId);

      // Then query EBI Search with facet filters
      if (jdData.entries.length > 0) {
        const idsToQuery = jdData.entries.slice(0, 100).map(e => e.rnacentral_id);
        const idsQuery = idsToQuery.map(id => `entry_type:Sequence AND id:"${id}"`).join(' OR ');

        return fetch(routes.ebiSearchByIds(idsQuery, extraQuery, 0, state.size), {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        })
        .then(response => response.ok ? response.json() : null)
        .then(ebiData => {
          if (ebiData) {
            jdData.facets = parseFacets(ebiData.facets);
            // Filter entries based on EBI Search results if there's a filter
            if (extraQuery && ebiData.entries) {
              const matchingIds = new Set(ebiData.entries.map(e => e.id));
              jdData.entries = jdData.entries.filter(e => matchingIds.has(e.rnacentral_id));
              jdData.hitCount = jdData.entries.length;
            }
          }
          return jdData;
        })
        .catch(() => jdData);
      }
      return jdData;
    })
    .then(data => {
      dispatch({type: types.FETCH_RESULTS, status: 'success', data: data})
      dispatch(dataForDownload());
    })
    .catch(error => {dispatch({type: types.FETCH_RESULTS, status: 'error'})});
  }
}

export function onToggleFacet(event, facet, facetValue) {
  return function (dispatch) {
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

    const extraQuery = buildQuery(selectedFacets);
    console.log('[DEBUG] onToggleFacet - fetching with updated facets, query:', extraQuery);

    // First get all results from Job Dispatcher
    return fetch(routes.jdJobResult(state.jobId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      .then(response => response.ok ? response.json() : Promise.reject(response))
      .then(jsonArray => {
        const jdData = parseJobDispatcherJsonResults(jsonArray, state.jobId);

        // Then query EBI Search with facet filters
        if (jdData.entries.length > 0) {
          const idsToQuery = jdData.entries.slice(0, 100).map(e => e.rnacentral_id);
          const idsQuery = idsToQuery.map(id => `entry_type:Sequence AND id:"${id}"`).join(' OR ');

          return fetch(routes.ebiSearchByIds(idsQuery, extraQuery, 0, state.size), {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
          })
          .then(response => response.ok ? response.json() : null)
          .then(ebiData => {
            if (ebiData) {
              jdData.facets = parseFacets(ebiData.facets);
              // Filter entries based on EBI Search results if there's a filter
              if (extraQuery && ebiData.entries) {
                const matchingIds = new Set(ebiData.entries.map(e => e.id));
                jdData.entries = jdData.entries.filter(e => matchingIds.has(e.rnacentral_id));
                jdData.hitCount = jdData.entries.length;
              }
            }
            return jdData;
          })
          .catch(() => jdData);
        }
        return jdData;
      })
      .then(data => {
        dispatch({
          type: types.TOGGLE_FACET,
          id: facet.id,
          value: facetValue.value,
          data: data,
          status: 'success',
          selectedFacets: selectedFacets
        })
        dispatch(dataForDownload());
      })
      .catch((response) => dispatch({ type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 }));
  }
}

export function onReload() {
  return {type: types.RELOAD}
}

export function onLoadMore(event) {
  let state = store.getState();

  return function(dispatch) {
    dispatch({type: types.LOAD_MORE});

    console.log('[DEBUG] onLoadMore - loading more results');

    // Job Dispatcher returns all results at once, so we just re-fetch
    // Client-side pagination would need to be implemented
    return fetch(routes.jdJobResult(state.jobId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(jsonArray => {
        const data = parseJobDispatcherJsonResults(jsonArray, state.jobId);
        dispatch({type: types.LOAD_MORE, data: data})
      })
      .catch(response => dispatch({ type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 }))
  }
}

export function onSort(event) {
  let ordering = event.target.value;
  let state = store.getState();

  console.log('[DEBUG] onSort - sorting by:', ordering);

  return function(dispatch) {
    dispatch({type: types.SORT_RESULTS});

    // Re-fetch and sort client-side
    return fetch(routes.jdJobResult(state.jobId), {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      })
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(jsonArray => {
        const data = parseJobDispatcherJsonResults(jsonArray, state.jobId);
        dispatch({type: types.SORT_RESULTS, data: data, ordering: ordering});
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
  let iterations = 1;

  if (state.hitCount>100 && state.hitCount<=200) {
    iterations = 2
  } else if (state.hitCount>200 && state.hitCount<=300) {
    iterations = 3
  } else if (state.hitCount>300 && state.hitCount<=400) {
    iterations = 4
  } else if (state.hitCount>400 && state.hitCount<=500) {
    iterations = 5
  } else if (state.hitCount>500 && state.hitCount<=600) {
    iterations = 6
  } else if (state.hitCount>600 && state.hitCount<=700) {
    iterations = 7
  } else if (state.hitCount>700 && state.hitCount<=800) {
    iterations = 8
  } else if (state.hitCount>800 && state.hitCount<=900) {
    iterations = 9
  } else if (state.hitCount>900) {
    iterations = 10
  }

  console.log('[DEBUG] dataForDownload - fetching all results for download');

  return async function(dispatch) {
    dispatch({type: types.DOWNLOAD, status: "clear"})

    // Job Dispatcher returns all results at once
    await fetch(routes.jdJobResult(state.jobId), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then((jsonArray) => {
      const data = parseJobDispatcherJsonResults(jsonArray, state.jobId);
      dispatch({type: types.DOWNLOAD, status: "success", data: data.entries})
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