module.exports = {
  rnacentralDatabases: () => `/api/rnacentral-databases`,
  submitJob:           () => `/api/submit-job`,
  jobStatus:           (jobId) => `/api/job-status/${jobId}`,
  jobsStatuses:        () => `/api/jobs-statuses`,
  jobResult:           (resultId) => `/api/job-result/${resultId}`,
  facets:              (resultId) => `/api/facets/${resultId}`,
  facetsSearch:        (resultId, query, start, size, ordering) => `/api/facets-search/${resultId}?query=${query}&start=${start}&size=${size}&ordering=${ordering}`,
  consumersStatuses:     () => `/api/consumers-statuses`
  // ebiSearch:           (jobId, query, fields, facetcount, facetfields, size, start) =>
  //   `http://wp-p3s-f8:9050/ebisearch/ws/rest/rnacentral/seqtoolresults` +
  //   `?query=${query}` +
  //   `&format=json&fields=${fields}` +
  //   `&facetcount=${facetcount}` +
  //   `&facetfields=${facetfields}` +
  //   `&size=${size}` +
  //   `&start=${start}`,
};
