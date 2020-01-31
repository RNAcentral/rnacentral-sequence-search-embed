let statusChoices = {
  notSubmitted: "notSubmitted",
  submitted: "submitted",
  loading: "loading",
  error: "error"
};

let initialState = {
  status: statusChoices.notSubmitted,
  jobId: null,
  jobList: [],
  submissionError: null,

  entries: [],
  facets: [],
  hitCount: 0,
  start: 0,
  size: 20,
  ordering: "e_value",
  selectedFacets: {},  // e.g. { facetId1: [facetValue1.value, facetValue2.value], facetId2: [facetValue3.value] }
  alignmentsCollapsed: true,
  textSearchError: false,
  sequence: "",

  infernal_status: statusChoices.notSubmitted,
  infernal_entries: [],
};

export default initialState;
