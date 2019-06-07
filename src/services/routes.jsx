// let server = 'https://rnacentral.org/cloud-sequence-search';
// let server = 'http://193.62.55.44:8002';
let server = 'http://193.62.55.45';


module.exports = {
  rnacentralDatabases: () => `${server}/api/rnacentral-databases`,
  submitJob:           () => `${server}/api/submit-job`,
  jobStatus:           (jobId) => `${server}/api/job-status/${jobId}`,
  jobsStatuses:        () => `${server}/api/jobs-statuses`,
  jobResult:           (resultId) => `${server}/api/job-result/${resultId}`,
  facets:              (resultId) => `${server}/api/facets/${resultId}`,
  facetsSearch:        (resultId, query, start, size, ordering) => `${server}/api/facets-search/${resultId}?query=${query}&start=${start}&size=${size}&ordering=${ordering}`,
  consumersStatuses:     () => `${server}/api/consumers-statuses`
  // ebiSearch:           (jobId, query, fields, facetcount, facetfields, size, start) =>
  //   `http://wp-p3s-f8:9050/ebisearch/ws/rest/rnacentral/seqtoolresults` +
  //   `?query=${query}` +
  //   `&format=json&fields=${fields}` +
  //   `&facetcount=${facetcount}` +
  //   `&facetfields=${facetfields}` +
  //   `&size=${size}` +
  //   `&start=${start}`,
};
