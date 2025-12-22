let server = process.env.REACT_APP_SERVER ? process.env.REACT_APP_SERVER : 'https://search.rnacentral.org';
let ebiDevOrProd = process.env.REACT_APP_BRANCH === 'dev' ? 'wwwdev' : 'www';
let r2dtServer =  `https://${ebiDevOrProd}.ebi.ac.uk/Tools/services/rest/r2dt`;

// Job Dispatcher endpoint for nhmmer searches
let jobDispatcherServer = 'http://test.jd.sdo.ebi.ac.uk:8180/Tools/services/rest/rnacentral_nhmmer';

// Infernal cmscan endpoint for Rfam classification
let infernalServer = `https://${ebiDevOrProd}.ebi.ac.uk/Tools/services/rest/infernal_cmscan`;

// EBI Search endpoint for facets
let ebiSearchServer = `https://${ebiDevOrProd}.ebi.ac.uk/ebisearch/ws/rest/rnacentral`;

// Facet fields to request from EBI Search
const facetFields = 'length,rna_type,TAXONOMY,expert_db,qc_warning_found,has_go_annotations,has_conserved_structure,has_genomic_coordinates,popular_species';

// Fields to request from EBI Search
const ebiSearchFields = 'description,url,active,rna_type,expert_db,has_genomic_coordinates,length';

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
  // Infernal cmscan Job Dispatcher endpoints
  infernalSubmitJob:   () => `${infernalServer}/run`,
  infernalJdJobStatus: (jobId) => `${infernalServer}/status/${jobId}`,
  infernalJdJobResult: (jobId) => `${infernalServer}/result/${jobId}/out`,
  infernalJdJobTblout: (jobId) => `${infernalServer}/result/${jobId}/tblout`,
  searchEndpoint:      (query) => `https://${ebiDevOrProd}.ebi.ac.uk/ebisearch/ws/rest/rnacentral?query=${query}&fields=description,url&format=json&sort=boost:descending`,
  rnacentralUrs:       (urs) => `https://rnacentral.org/api/v1/rna/${urs}`,
  saveR2DTId:          (jobId) => `${server}/api/r2dt/${jobId}`,
  submitR2DTJob:       () => `${r2dtServer}/run`,
  r2dtJobStatus:       (jobId) => `${r2dtServer}/status/${jobId}`,
  r2dtThumbnail:       (jobId) => `${r2dtServer}/result/${jobId}/thumbnail`,
  // Job Dispatcher endpoints
  jdSubmitJob:         () => `${jobDispatcherServer}/run`,
  jdJobStatus:         (jobId) => `${jobDispatcherServer}/status/${jobId}`,
  jdJobResult:         (jobId) => `${jobDispatcherServer}/result/${jobId}/json`,
  // EBI Search endpoint for facets (seqtoolresults)
  ebiSearchFacets:     (jobId, query, start, size) => `${ebiSearchServer}/seqtoolresults?toolid=nhmmer&jobid=${jobId}&query=${encodeURIComponent(query || 'rna')}&format=json&fields=description&facetcount=100&facetfields=${facetFields}&start=${start}&size=${size}`,
  // EBI Search endpoint for querying by RNAcentral IDs
  ebiSearchByIds:      (idsQuery, extraQuery, start, size) => `${ebiSearchServer}?query=${encodeURIComponent(idsQuery)}${extraQuery ? '%20AND%20' + encodeURIComponent(extraQuery) : ''}&format=json&fields=${ebiSearchFields}&facetcount=100&facetfields=${facetFields}&start=${start}&size=${size}`,
};
