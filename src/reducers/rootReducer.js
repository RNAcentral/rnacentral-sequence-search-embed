import routes from "../services/routes.jsx";
import {
  TOGGLE_ALIGNMENTS_COLLAPSED,
  RELOAD_RESULTS,
  SCROLL_RESULTS,
  SORT_RESULTS,
  SUBMIT_JOB,
  FETCH_RESULTS,
  FETCH_RNACENTRAL_DATABASES
} from "../actions/actionTypes";
import initialState from "../store/initialState";


let onSubmit = function (event) {
  event.preventDefault();

  // if sequence is not given - ignore submit
  if (this.state.sequence) {
    fetch(routes.submitJob(), {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: this.state.sequence,
        databases: Object.keys(this.state.selectedDatabases).filter(key => this.state.selectedDatabases[key])
      })
    })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw response;
      }
    })
    .then(data => this.setState({jobId: data.job_id}))
    .catch(error => this.setState({status: error, submissionError: response.statusText}));
  }
};


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
    case FETCH_RESULTS:
      if (!action.status) {
        ; // do nothing, all the logic is in action creator
      } else if (action.status === 'success') {
        let data = action.data;

        Object.assign({}, newState, {
          status: data.sequenceSearchStatus === "success" ? "success" : "partial_success",
          sequence: data.sequence,
          entries: [...data.entries],
          facets: [...data.facets],
          hitCount: data.hitCount,
          start: start,
          size: size,
          ordering: ordering,
          selectedFacets: selectedFacets,
          textSearchError: data.textSearchError
        });

      } else if (action.status === 'error') {
        Object.assign({}, newState, {
          status: data.sequenceSearchStatus === "error",
          sequence: data.sequence,
          entries: [...data.entries],
          facets: [...data.facets],
          hitCount: data.hitCount,
          start: start,
          size: size,
          ordering: ordering,
          selectedFacets: selectedFacets,
          textSearchError: data.textSearchError
        });
      }

      return newState;

    case TOGGLE_ALIGNMENTS_COLLAPSED:
      $('.alignment').toggleClass('alignment-collapsed');
      Object.assign({}, newState, {
        alignmentCollapsed: !state.alignmentsCollapsed
      });
      return newState;

    case TOGGLE_FACET:
      return newState;


    // submission form
    case SUBMIT_JOB:
      return newState;

    case TEXTAREA_CHANGE:
      return newState;

    case TOGGLE_DATABASE_CHECKBOX:
      return newState;

    case SELECT_ALL_DATABASES:
      let selectedDatabases = {};
      state.rnacentralDatabases.map(db => { selectedDatabases[db] = true; });

      Object.assign({}, newState, {
        selectedDatabases: selectedDatabases
      });

      return newState;

    case DESELECT_ALL_DATABASES:
      let selectedDatabases = {};
      this.state.rnacentralDatabases.map(db => { selectedDatabases[db] = false; });

      Object.assign({}, newState, {
        selectedDatabases: selectedDatabases
      });

      return newState;

    case TOGGLE_DATABASES_COLLAPSED:
      return newState;

    case EXAMPLE_SEQUENCE:
      Object.assign({}, newState, {
        sequence: action.sequence,
      });
      return newState;

    case CLEAR_SEQUENCE:
      Object.assign({}, newState, {
        sequence: ""
      });
      return newState;

    case FILE_UPLOAD:
      return newState;

    case FETCH_RNACENTRAL_DATABASES:
      if (!action.status) {
        ; // do nothing, all the logic is in action creator
      } else if (action.status === 'success') {
        let data = action.data;

        let rnacentralDatabases = data.map(database => database.id);

        let selectedDatabases = {};
        data.map(database => { selectedDatabases[database.id] = false });

        let rnacentralDatabaseLabels = {};
        data.map(database => { rnacentralDatabaseLabels[database.id] =  database.label });

        Object.assign({}, newState, {
          rnacentralDatabases: rnacentralDatabases,
          selectedDatabases: selectedDatabases,
          rnacentralDatabaseLabels: rnacentralDatabaseLabels,
          rnacentralDatabasesError: false
        });

      } else if (action.status === 'error') {
        Object.assign({}, newState, {
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