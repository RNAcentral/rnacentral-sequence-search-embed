let branch = process.env.REACT_APP_BRANCH;
let isDevBranch = branch === 'dev' || branch === 'migrate-to-job-dispatcher';
//let server = process.env.REACT_APP_SERVER || (isDevBranch ? 'https://sequence-search-test.rnacentral.org' : 'https://sequence-search.rnacentral.org');
let server = 'https://sequence-search-test.rnacentral.org'
let ebiDevOrProd = isDevBranch ? 'wwwdev' : 'www';
let r2dtServer =  `https://${ebiDevOrProd}.ebi.ac.uk/Tools/services/rest/r2dt`;

// Infernal cmscan endpoint for Rfam classification
let infernalServer = `https://${ebiDevOrProd}.ebi.ac.uk/Tools/services/rest/infernal_cmscan`;

module.exports = {
  // Legacy endpoints (kept for backwards compatibility)
  rnacentralDatabases: () => `${server}/api/rnacentral-databases`,
  jobsStatuses:        () => `${server}/api/jobs-statuses`,
  consumersStatuses:   () => `${server}/api/consumers-statuses`,
  infernalJobStatus:   (jobId) => `${server}/api/infernal-status/${jobId}`,
  infernalJobResult:   (resultId) => `${server}/api/infernal-result/${resultId}`,

  // Infernal cmscan Job Dispatcher endpoints
  infernalSubmitJob:   () => `${infernalServer}/run`,
  infernalJdJobStatus: (jobId) => `${infernalServer}/status/${jobId}`,
  infernalJdJobResult: (jobId) => `${infernalServer}/result/${jobId}/out`,
  infernalJdJobTblout: (jobId) => `${infernalServer}/result/${jobId}/tblout`,

  // EBI Search for exact match lookup
  searchEndpoint:      (query) => `https://${ebiDevOrProd}.ebi.ac.uk/ebisearch/ws/rest/rnacentral?query=${query}&fields=description,url&format=json&sort=boost:descending`,
  rnacentralUrs:       (urs) => `https://rnacentral.org/api/v1/rna/${urs}`,
  saveR2DTId:          (jobId) => `${server}/api/r2dt/${jobId}`,

  // R2DT endpoints
  submitR2DTJob:       () => `${r2dtServer}/run`,
  r2dtJobStatus:       (jobId) => `${r2dtServer}/status/${jobId}`,
  r2dtThumbnail:       (jobId) => `${r2dtServer}/result/${jobId}/thumbnail`,

  // Proxy API endpoints - handles Job Dispatcher + EBI Search on backend
  proxySubmitJob:      () => `${server}/api/submit-job`,
  proxyJobStatus:      (jobId) => `${server}/api/job-status/${jobId}`,
  proxyJobResults:     (jobId) => `${server}/api/job-results/${jobId}`,
  proxyFilterResults:  (jobId) => `${server}/api/job-results/${jobId}/filter`,
  proxyDatabases:      () => `${server}/api/databases`,
};
