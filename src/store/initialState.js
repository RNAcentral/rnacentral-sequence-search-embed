let statusChoices = {
  notSubmitted: "notSubmitted",
  submitted: "submitted",
  loading: "loading",
  error: "error"
};

let initialState = {
  jobId: null,
  jobList: [],
  submissionError: null,
  sequence: "",
  hits: null,
  fileUpload: false,
  exactMatch: null,
  rnacentral: false,

  // nhmmer search
  status: statusChoices.notSubmitted,
  entries: [],
  facets: [],
  hitCount: 0,
  start: 0,
  size: 20,
  ordering: "e_value",
  selectedFacets: {},  // e.g. { facetId1: [facetValue1.value, facetValue2.value], facetId2: [facetValue3.value] }
  alignmentsCollapsed: false,
  detailsCollapsed: true,
  textSearchError: false,
  filter: "",

  // cmscan search
  infernalStatus: statusChoices.notSubmitted,
  infernalEntries: [],
  infernalAlignmentsCollapsed: true,
};

export default initialState;
