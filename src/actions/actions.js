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

export function onSubmit(sequence, databases) {
  let url = window.location.href;

  return function(dispatch) {
    fetch(routes.submitJob(), {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: sequence,
        databases: databases,
        url: url,
        priority: 'high'
      })
    })
    .then(function (response) {
      if (response.ok) { return response.json() }
      else { throw response }
    })
    .then(data => {
        dispatch({type: types.SUBMIT_JOB, status: 'success', data: data});
        dispatch(fetchStatus(data.job_id));
        dispatch(fetchInfernalStatus(data.job_id));
    })
    .catch(error => dispatch({type: types.SUBMIT_JOB, status: 'error', response: error}));
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
          jobIds.push("Error submitting sequence. Check your fasta file and try again later.");
        }
      })
      .then(data => {
        jobIds.push(data.job_id);
        if (jobIds.length === sequence.length) {
          dispatch({type: types.BATCH_SEARCH, data: false});
          dispatch({type: types.SUBMIT_MULTIPLE_JOB, status: 'success', data: jobIds});
        }
      })
      .catch(error => dispatch({type: types.SUBMIT_MULTIPLE_JOB, status: 'error', response: error}));
    }
  }
}

export function onSubmitUrs(urs, database) {
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
        dispatch(onSubmit(data.sequence, database))
      }
    })
    .catch(error => {dispatch({type: types.SUBMIT_URS, status: 'error', response: error})});
  }
}

export function updateJobId(jobId) {
  return function(dispatch) {
    dispatch({type: types.UPDATE_JOB_ID, data: jobId});
    dispatch(fetchStatus(jobId));
    dispatch(fetchInfernalStatus(jobId));
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
    fetch(routes.jobStatus(jobId), {
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
      if (data.status === 'started' || data.status === 'pending' || data.status === 'running') {
        // Given jobChunks from jobStatus route, estimates the search progress.
        let finishedChunk = 0;
        data.chunks.map(item => {
          if (item.status === 'success' || item.status === 'timeout' || item.status === 'error'){
            finishedChunk = finishedChunk + 1
          }
        });

        // Update the search progress
        let state = store.getState();
        let newSearchInProgress = [...state.searchInProgress];
        let foundJobId = newSearchInProgress.find(el => el.jobId === data.job_id);
        if (foundJobId){
          foundJobId['finishedChunk'] = finishedChunk * 100 / data.chunks.length;
        } else {
          newSearchInProgress.push({jobId: data.job_id, finishedChunk: finishedChunk * 100 / data.chunks.length});
        }
        dispatch({type: types.SEARCH_PROGRESS, data: newSearchInProgress });

        // Wait a little bit and check it again
        let statusTimeout = setTimeout(() => store.dispatch(fetchStatus(jobId)), 2000);
        dispatch({type: types.SET_STATUS_TIMEOUT, timeout: statusTimeout});
      } else if (data.status === 'success' || data.status === 'partial_success') {
        dispatch(fetchResults(jobId));
      }
    })
    .catch(error => {
      if (store.getState().hasOwnProperty('statusTimeout')) {
        clearTimeout(store.getState().statusTimeout); // clear status timeout
      }
      dispatch({type: types.FETCH_STATUS, status: 'error'})
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
      dispatch({type: types.FETCH_STATUS, infernalStatus: 'error'})
    });
  }
}

export function fetchResults(jobId) {
  let state = store.getState();

  return function(dispatch) {
    fetch(routes.facetsSearch(jobId, buildQuery(state.selectedFacets), 0, 20, 'e_value'), {
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
    .then(data => {
      dispatch({type: types.FETCH_RESULTS, status: 'success', data: data});
      dispatch(dataForDownload());
    })
    .catch(error => dispatch({type: types.FETCH_RESULTS, status: 'error'}));
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
    .catch(error => dispatch({type: types.FETCH_INFERNAL_RESULTS, infernalStatus: 'error'}));
  }
}

export function failedFetchResults(response) {
  if (response.status === 404) {
    return { type: types.FAILED_FETCH_RESULTS, status: "does_not_exist", start: 0 };
  } else if (response.status === 500) {
    return { type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 };
  }
}

export function onFilterResult() {
  let state = store.getState();

  return function(dispatch) {
    fetch(routes.facetsSearch(state.jobId, buildQuery(state.selectedFacets), 0, state.size, state.ordering), {
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

    // start loading from the first page again
    return fetch(routes.facetsSearch(state.jobId, buildQuery(selectedFacets), 0, state.size, state.ordering))
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
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

    let size = state.entries.length + state.size < state.hitCount ? state.size: state.hitCount - state.entries.length;

    return fetch(routes.facetsSearch(state.jobId, buildQuery(state.selectedFacets), state.start, size, state.ordering))
      .then(response => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(data => dispatch({type: types.LOAD_MORE, data: data}))
      .catch(response => dispatch({ type: types.FAILED_FETCH_RESULTS, status: "error", start: 0 }))
  }
}

export function onSort(event) {
  let ordering = event.target.value;
  let state = store.getState();

  return function(dispatch) {
    dispatch({type: types.SORT_RESULTS});

    return fetch(routes.facetsSearch(state.jobId, buildQuery(state.selectedFacets), 0, state.size, ordering))
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
      })
      .then(data => {
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
  let selectedFacets = {...state.selectedFacets};
  let iterations = 1;

  if (state.hitCount>200 && state.hitCount<=400) {
    iterations = 2
  } else if (state.hitCount>400 && state.hitCount<=600) {
    iterations = 3
  } else if (state.hitCount>600 && state.hitCount<=800) {
    iterations = 4
  } else if (state.hitCount>800) {
    iterations = 5
  }

  return async function(dispatch) {
    dispatch({type: types.DOWNLOAD, status: "clear"})
    let start = 0;
    for (let i=0; i<iterations; i++) {
      await fetch(routes.facetsSearch(state.jobId, buildQuery(selectedFacets), start, 200, state.ordering), {
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
        if (i===iterations-1) {
          dispatch({type: types.DOWNLOAD, status: "success", data: data.entries})
        } else {
          dispatch({type: types.DOWNLOAD, status: "loading", data: data.entries})
        }
      })
      .catch(response => dispatch({ type: types.DOWNLOAD, status: "error" }));
      start+=200;
    }
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
