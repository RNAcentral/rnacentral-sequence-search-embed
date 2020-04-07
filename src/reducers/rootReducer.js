import * as actions from "../actions/actionTypes";
import initialState from "../store/initialState";


const rootReducer = function (state = initialState, action) {
  let newState;

  switch (action.type) {
    // results
    case actions.FETCH_RESULTS:
      if (!action.status) {
        return Object.assign({}, state, {}); // do nothing, all the logic is in action creator
      } else if (action.status === 'success') {
        return Object.assign({}, state, {
          status: action.data.sequenceSearchStatus === "success" ? "success" : "partial_success",
          sequence: action.data.sequence,
          hits: action.data.hits,
          entries: [...action.data.entries],
          facets: [...action.data.facets],
          hitCount: action.data.hitCount,
          start: action.data.entries.length,
          size: 20,
          ordering: 'e_value',
          selectedFacets: {},
          textSearchError: action.data.textSearchError
        });

      } else if (action.status === 'error') {
        return Object.assign({}, state, { status: 'error' });
      } else {
        console.log('Default');
        return Object.assign({}, state, {});
      }

    case actions.FETCH_INFERNAL_RESULTS:
      if (!action.infernalStatus) {
        return Object.assign({}, state, {}); // do nothing, all the logic is in action creator
      } else if (action.infernalStatus === 'success') {
        return Object.assign({}, state, {
          infernalStatus: "success",
          infernalEntries: [...action.data],
        });

      } else if (action.infernalStatus === 'error') {
        return Object.assign({}, state, { status: 'error' });
      } else {
        return Object.assign({}, state, {});
      }

    case actions.FAILED_FETCH_RESULTS:
      if ('does not exist') {
        return Object.assign({}, state, {status: "does_not_exist", start: 0});
      } else if ('error') {
        return Object.assign({}, state, {status: "error", start: 0});
      } else {
        return Object.assign({}, state, {});
      }

    case actions.TOGGLE_FACET:
      if (!action.status) {
        return Object.assign({}, state, {status: "loading"});
      } else { // success
        return Object.assign({}, state, {
          status: action.data.sequenceSearchStatus === "success" ? "success" : "partial_success",
          sequence: action.data.sequence,
          hits: action.data.hits,
          entries: [...action.data.entries],
          facets: [...action.data.facets],
          hitCount: action.data.hitCount,
          start: action.data.entries.length,
          size: 20,
          textSearchError: action.data.textSearchError,
          selectedFacets: action.selectedFacets
        });
      }

    case actions.SORT_RESULTS:
      if (!action.data) {
        return Object.assign({}, state, {status: "loading"});
      } else {
        // let selectedFacets = {};
        // action.data.facets.map((facet) => { selectedFacets[facet.id] = []; });

        return Object.assign({}, state, {
          status: action.data.sequenceSearchStatus === "success" ? "success" : "partial_success",
          sequence: action.data.sequence,
          hits: action.data.hits,
          entries: [...action.data.entries],
          facets: [...action.data.facets],
          hitCount: action.data.hitCount,
          start: action.data.entries.length,
          size: 20,
          ordering: action.data.ordering,
          selectedFacets: state.selectedFacets,
          textSearchError: action.data.textSearchError
        });
      }

    case actions.LOAD_MORE:
      if (!action.data) {
        return Object.assign({}, state, {status: "loading"});
      } else {
        return Object.assign({}, state, {
          status: action.data.sequenceSearchStatus === "success" ? "success" : "partial_success",
          sequence: action.data.sequence,
          hits: action.data.hits,
          entries: [...state.entries, ...action.data.entries],
          facets: [...action.data.facets],
          hitCount: action.data.hitCount,
          start: state.entries.length + action.data.entries.length,
          size: 20,
          ordering: action.data.ordering,
          textSearchError: action.data.textSearchError
        });
      }

    case actions.TOGGLE_ALIGNMENTS_COLLAPSED:
      return Object.assign({}, state, {
        alignmentsCollapsed: !state.alignmentsCollapsed
      });

    case actions.TOGGLE_INFERNAL_ALIGNMENTS_COLLAPSED:
      return Object.assign({}, state, {
        infernalAlignmentsCollapsed: !state.infernalAlignmentsCollapsed
      });

    case actions.TOGGLE_DETAILS_COLLAPSED:
      return Object.assign({}, state, {
        detailsCollapsed: !state.detailsCollapsed
      });

    // submission form
    case actions.SUBMIT_JOB:
      switch (action.status) {
        case 'success':
          return Object.assign({}, state, {
            jobId: action.data.job_id,
            status: "loading",
            infernalStatus: "loading",
            submissionError: ""
          });
        case 'error':
          return Object.assign({}, state, {status: "error", submissionError: action.response.statusText});
        default:
          return newState;
      }

    case actions.SUBMIT_MULTIPLE_JOB:
      switch (action.status) {
        case 'success':
          return Object.assign({}, state, {
            jobList: action.data,
            submissionError: ""
          });
        case 'error':
          return Object.assign({}, state, {status: "error", submissionError: action.response.statusText});
        default:
          return newState;
      }

    case actions.SUBMIT_URS:
      return Object.assign({}, state, {status: "error", submissionError: action.response.statusText});

    case actions.UPDATE_JOB_ID:
      return Object.assign({}, state, {jobId: action.data, rnacentral: false});

    case actions.CLEAR_JOB_ID:
      return Object.assign({}, state, {jobId: null, sequence: ""});

    case actions.CLEAR_RESULT:
      return Object.assign({}, state, {
        jobId: null,
        sequence: "",
        hits: null,
        status: "loading",
        entries: [],
        facets: [],
        hitCount: 0,
        start: 0,
        size: 20,
        ordering: "e_value",
        selectedFacets: {},
        alignmentsCollapsed: false,
        detailsCollapsed: true,
        textSearchError: false,
        infernalStatus: "loading",
        infernalEntries: [],
        infernalAlignmentsCollapsed: true,
        exactMatch: null,
        filter: "",
      });

    case actions.INVALID_SEQUENCE:
      return Object.assign({}, state, {status: "invalidSequence"});

    case actions.FETCH_STATUS:
      if (action.status === 'error') {
        return Object.assign({}, state, {status: "error"});
      } else {
        return Object.assign({}, state, {status: action.status})
      }

    case actions.SET_STATUS_TIMEOUT:
      return Object.assign({}, state, {statusTimeout: action.statusTimeout});

    case actions.EXACT_MATCH:
      if (!action.data) {
        return Object.assign({}, state, {});
      } else {
        return Object.assign({}, state, {exactMatch: action.data});
      }

    case actions.FILTER_CHANGE:
      return Object.assign({}, state, {filter: action.data});

    case actions.TEXTAREA_CHANGE:
      return Object.assign({}, state, {
        jobId: null,
        sequence: action.sequence,
        hits: null,
        status: "notSubmitted",
        entries: [],
        facets: [],
        hitCount: 0,
        start: 0,
        size: 20,
        ordering: "e_value",
        selectedFacets: {},
        filter: "",
        alignmentsCollapsed: false,
        detailsCollapsed: true,
        textSearchError: false,
        infernalStatus: "notSubmitted",
        infernalEntries: [],
        infernalAlignmentsCollapsed: true,
        fileUpload: false,
        rnacentral: false,
        submissionError: null,
      });

    case actions.EXAMPLE_SEQUENCE:
      return Object.assign({}, state, {
        jobId: null,
        sequence: action.sequence,
        hits: null,
        status: "notSubmitted",
        entries: [],
        facets: [],
        hitCount: 0,
        start: 0,
        size: 20,
        ordering: "e_value",
        selectedFacets: {},
        filter: "",
        alignmentsCollapsed: false,
        detailsCollapsed: true,
        textSearchError: false,
        infernalStatus: "notSubmitted",
        infernalEntries: [],
        infernalAlignmentsCollapsed: true,
        fileUpload: false,
        rnacentral: false,
        submissionError: null,
      });

    case actions.CLEAR_SEQUENCE:
      return Object.assign({}, state, {
        jobId: null,
        jobList: [],
        sequence: "",
        hits: null,
        status: "notSubmitted",
        entries: [],
        facets: [],
        hitCount: 0,
        start: 0,
        size: 20,
        ordering: "e_value",
        selectedFacets: {},
        filter: "",
        alignmentsCollapsed: false,
        detailsCollapsed: true,
        textSearchError: false,
        infernalStatus: "notSubmitted",
        infernalEntries: [],
        infernalAlignmentsCollapsed: true,
        fileUpload: false,
        exactMatch: null,
        rnacentral: false,
        submissionError: null,
      });

    case actions.FILE_UPLOAD:
      if (!action.sequence) {
        return Object.assign({}, state, {});
      } else {
        return Object.assign({}, state, {sequence: action.sequence, fileUpload: true});
      }

    default:
      return state;
  }
};

export default rootReducer;