let server = process.env.REACT_APP_BRANCH === 'dev' ? 'http://51.179.208.74:8002' : 'https://search.rnacentral.org';
let ebiDevOrProd = process.env.REACT_APP_BRANCH === 'dev' ? 'wwwdev' : 'www';

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
  searchEndpoint:      (query) => `https://${ebiDevOrProd}.ebi.ac.uk/ebisearch/ws/rest/rnacentral?query=${query}&fields=description,url&format=json&sort=boost:descending`,
  rnacentralUrs:       (urs) => `https://test.rnacentral.org/api/v1/rna/${urs}`,
};
