let server = 'https://search.rnacentral.org';


module.exports = {
  rnacentralDatabases: () => `${server}/api/rnacentral-databases`,
  submitJob:           () => `${server}/api/submit-job`,
  jobStatus:           (jobId) => `${server}/api/job-status/${jobId}`,
  jobsStatuses:        () => `${server}/api/jobs-statuses`,
  jobResult:           (resultId) => `${server}/api/job-result/${resultId}`,
  facets:              (resultId) => `${server}/api/facets/${resultId}`,
  facetsSearch:        (resultId, query, start, size, ordering) => `${server}/api/facets-search/${resultId}?query=${query}&start=${start}&size=${size}&ordering=${ordering}`,
  consumersStatuses:   () => `${server}/api/consumers-statuses`,
  infernalJobStatus:   (jobId) => `${server}/api/infernal-status/${jobId}`,
  infernalJobResult:   (resultId) => `${server}/api/infernal-result/${resultId}`,
  searchEndpoint:      (query) => `https://www.ebi.ac.uk/ebisearch/ws/rest/rnacentral?query=${query}&fields=description&format=json&sort=boost:descending`,
};
