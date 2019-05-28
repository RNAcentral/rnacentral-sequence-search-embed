import routes from "../services/routes.jsx";
import * as actions from "../actions/actionTypes";
import * as actionCreators from "../actions/actions";
import initialState from "../store/initialState";


/**
 * Is called when user tries to reload the facets data after an error.
 */
let onReload = function () {
  this.load(this.props.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
};

/**
 * Is called when user selects a different sorting order.
 */
let onSort = function (event) {
  let ordering = event.target.value;
  this.setState({ ordering: ordering }, () => {
    this.load(this.props.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
  });
};

/**
 * Collapses/displays alignments in search results
 */
let onToggleAlignmentsCollapsed = function () {
  $('.alignment').toggleClass('alignment-collapsed');
  this.setState({ alignmentsCollapsed: !this.state.alignmentsCollapsed });
};

/**
 * Checks that the page was scrolled down to the bottom.
 * Load more entries, if available then.
 *
 * Mostly stolen from: https://alligator.io/react/react-infinite-scroll/
 * Cross-browser compatibility: https://codingrepo.com/javascript/2015/10/10/javascript-infinite-scroll-with-cross-browser/
 */
let onScroll = function () {
  let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
  let scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

  // Checks that the page has scrolled to the bottom
  if (windowHeight + scrollPosition + 10 >= document.documentElement.offsetHeight) {
    if (this.state.status === "success" && this.state.entries.length < this.state.hitCount) {
      this.setState(
        (state, props) => (state.start === this.state.start ? { start: this.state.start + this.state.size, status: "loading" } : { status: "loading" }),
        () => {
          let query = this.buildQuery();
          this.load(this.props.resultId, query, this.state.start, this.state.size, this.state.ordering, false, false);
        }
      );
    }
  }
};


//

let onSequenceTextareaChange = function (event) {
  this.setState({sequence: event.target.value.toUpperCase()});
};

let onDatabaseCheckboxToggle = function (event) {
  let selectedDatabases = { ...this.props.selectedDatabases };
  selectedDatabases[event.target.id] = !selectedDatabases[event.target.id];
  this.setState({ selectedDatabases: selectedDatabases });
};

let onSelectAllDatabases = function (event) {
  let selectedDatabases = {};
  this.state.rnacentralDatabases.map(db => { selectedDatabases[db] = true; });
  this.setState({ selectedDatabases: selectedDatabases });
};

let onDeselectAllDatabases = function (event) {
  let selectedDatabases = {};
  this.state.rnacentralDatabases.map(db => { selectedDatabases[db] = false; });
  this.setState({ selectedDatabases: selectedDatabases });
};

let onToggleDatabasesCollapsed = function (event) {
  $('#rnacentralDatabaseCollapsible').toggleClass('databases-collapsed');
  this.setState({ databasesCollapsed: !this.state.databasesCollapsed });
};

let onExampleSequence = function (sequence) {
  this.setState({sequence: sequence});
};

let onClearSequence = function (event) {
  this.setState({sequence: ""});
};

let onFileUpload = function (event) {
  // TODO: fasta parsing
  // TODO: exception handling - user closed the dialog
  // TODO: exception handling - this is not a proper fasta file

  let fileReader = new FileReader();

  fileReader.onloadend = (event) => {
    let fileContent = event.target.result;
    this.setState({sequence: fileContent});
  };

  fileReader.readAsText(event.target.files[0]);
};


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
          entries: [...action.data.entries],
          facets: [...action.data.facets],
          hitCount: action.data.hitCount,
          start: 0,
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

    case actions.TOGGLE_ALIGNMENTS_COLLAPSED:
      $('.alignment').toggleClass('alignment-collapsed');
      return Object.assign({}, state, {
        alignmentCollapsed: !state.alignmentsCollapsed
      });

    case actions.TOGGLE_FACET:
      return newState;

    // submission form
    case actions.SUBMIT_JOB:
      switch (action.status) {
        case 'success':
          return Object.assign({}, state, {
            jobId: action.data.job_id,
            status: "loading",
            submissionError: ""
          });
        case 'error':
          return Object.assign({}, state, {status: "error", submissionError: action.response.statusText});
        default:
          return newState;
      }

    case actions.FETCH_STATUS:
      if (action.status === 'error') {
        return Object.assign({}, state, {status: "error"});
      } else {
        return Object.assign({}, state, {status: action.status})
      }

    case actions.SET_STATUS_TIMEOUT:
      return Object.assign({}, state, {statusTimeout: action.statusTimeout});

    case actions.TEXTAREA_CHANGE:
      return Object.assign({}, state, { sequence: action.sequence });

    case actions.TOGGLE_DATABASE_CHECKBOX:
      let selectedDatabases = { ...state.selectedDatabases };
      selectedDatabases[action.id] = !selectedDatabases[action.id];
      return Object.assign({}, state,{ selectedDatabases: selectedDatabases });

    case actions.SELECT_ALL_DATABASES:
      return Object.assign({}, state, {
        selectedDatabases: Object.assign({}, ...state.rnacentralDatabases.map(e => ({[e]: true})))
      });

    case actions.DESELECT_ALL_DATABASES:
      return Object.assign({}, state, {
        selectedDatabases: Object.assign({}, ...state.rnacentralDatabases.map(e => ({[e]: false})))
      });

    case actions.TOGGLE_DATABASES_COLLAPSED:
      $('#rnacentralDatabaseCollapsible').toggleClass('databases-collapsed');
      return Object.assign({}, state, {
        databasesCollapsed: !state.databasesCollapsed
      });

    case actions.EXAMPLE_SEQUENCE:
      return Object.assign({}, state, {
        sequence: action.sequence,
      });

    case actions.CLEAR_SEQUENCE:
      return Object.assign({}, state, {
        sequence: ""
      });

    case actions.FILE_UPLOAD:
      return newState;

    case actions.FETCH_RNACENTRAL_DATABASES:
      if (!action.status) {
        ; // do nothing, all the logic is in action creator
      } else if (action.status === 'success') {
        let data = action.data;

        let rnacentralDatabases = data.map(database => database.id);

        let selectedDatabases = {};
        data.map(database => { selectedDatabases[database.id] = false });

        let rnacentralDatabaseLabels = {};
        data.map(database => { rnacentralDatabaseLabels[database.id] =  database.label });

        newState = Object.assign({}, state, {
          rnacentralDatabases: rnacentralDatabases,
          selectedDatabases: selectedDatabases,
          rnacentralDatabaseLabels: rnacentralDatabaseLabels,
          rnacentralDatabasesError: false
        });

      } else if (action.status === 'error') {
        newState = Object.assign({}, state, {
          rnacentralDatabases: [],
          selectedDatabases: {},
          rnacentralDatabaseLabels: {},
          rnacentralDatabasesError: true
        });
      }

      return newState;

    default:
      return state;
  }
};

export default rootReducer;