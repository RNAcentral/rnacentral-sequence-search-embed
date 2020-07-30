import React from 'react';
import {connect} from 'react-redux';

import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";
import Admin from "containers/SequenceSearch/components/SearchForm/components/Admin.jsx";

import { FaSearch, FaCheckCircle } from 'react-icons/fa';
import { FiTrash2 } from 'react-icons/fi';
import { MdFileUpload } from 'react-icons/md';


class SearchForm extends React.Component {
  showExamples(linkColor){
    const examples = this.props.examples;
    return examples.map(example =>
      <li key={example.description}>
        <a className="custom-link" style={{color: linkColor}} onClick={() => this.exampleSequence(example.sequence)}>{example.description}</a>
        <small>{!!(example.urs) ? ` (${example.urs})` : " "}</small>
      </li>)
  }

  exampleSequence(sequence) {
    store.dispatch(actionCreators.onExampleSequence(sequence));
    store.dispatch(actionCreators.onSubmit(sequence, this.props.databases));
  }

  showExactMatch(linkColor){
    const exactMatch = this.props.exactMatch;
    const database = this.props.databases;

    if (exactMatch && exactMatch.hitCount > 0) {
      const exactMatchBackgroundColor = this.props.customStyle && this.props.customStyle.exactMatchBackgroundColor ? this.props.customStyle.exactMatchBackgroundColor : "";
      const exactMatchDescription = exactMatch.entries[0].fields.description[0];
      const exactMatchId = exactMatch.entries[0].id;
      const exactMatchUrl = exactMatch.entries[0].fields.url[0];
      const exactMatchUrsId = exactMatchId.split('_')[0];
      const remainingExactMatch = exactMatch.hitCount > 1 ? (exactMatch.hitCount - 1) : null;
      const exactMatchOther = remainingExactMatch && remainingExactMatch > 1 ? remainingExactMatch + ' other sequences' : remainingExactMatch && remainingExactMatch === 1 ? remainingExactMatch + ' other sequence' : '';

      return <div className="row">
        <div className="col-sm-9">
          <div className="alert alert-success" style={{backgroundColor: exactMatchBackgroundColor, borderColor: exactMatchBackgroundColor}}>
            {
              database.length === 0 ? <div>
                <FaCheckCircle style={{verticalAlign: "-10%", marginLeft: "-5px"}} /> Identical match: <a className="custom-link" style={{color: linkColor}} href={`https://rnacentral.org/rna/${exactMatchId}`} target='_blank'>{exactMatchDescription}</a>
                {exactMatchOther && ' and '}
                {exactMatchOther ? <a className="custom-link" style={{color: linkColor}} href={`https://rnacentral.org/search?q=${exactMatchUrsId}*`} target='_blank'>{exactMatchOther}</a> : ''}
              </div> : <div>
                <FaCheckCircle style={{verticalAlign: "-10%", marginLeft: "-5px"}} /> Identical match: <a className="custom-link" style={{color: linkColor}} href={exactMatchUrl} target='_blank'>{exactMatchDescription}</a>
              </div>
            }
          </div>
        </div>
      </div>
    }
  }

  onSubmit(event) {
    event.preventDefault();
    const state = store.getState();

    // split the sequence for batch queries and set a limit on the number of queries
    if (state.fileUpload && state.sequence) {
      let getSequence = state.sequence.split(/(?=>)/g).slice(0, 50);
      state.sequence = "";
      store.dispatch(actionCreators.onMultipleSubmit(getSequence, this.props.databases));
    } else if (state.sequence && state.sequence.match("^([0-9a-fA-F]{8})-(([0-9a-fA-F]{4}\\-){3})([0-9a-fA-F]{12})$")) {
      store.dispatch(actionCreators.updateJobId(state.sequence));
    } else if (state.sequence && state.sequence.match("^URS[A-Fa-f0-9]{10}$")) {
      store.dispatch(actionCreators.onSubmitUrs(state.sequence, this.props.databases));
    } else if (state.sequence && (state.sequence.length < 10 || state.sequence.length > 7000)) {
      store.dispatch(actionCreators.invalidSequence());
    } else if (state.sequence) {
      store.dispatch(actionCreators.onSubmit(state.sequence, this.props.databases));
    }

    state.sequence = "";
  }

  render() {
    const searchButtonColor = this.props.customStyle && this.props.customStyle.searchButtonColor ? this.props.customStyle.searchButtonColor : "";
    const clearButtonColor = this.props.customStyle && this.props.customStyle.clearButtonColor ? this.props.customStyle.clearButtonColor : "#6c757d";
    const uploadButtonColor = this.props.customStyle && this.props.customStyle.uploadButtonColor ? this.props.customStyle.uploadButtonColor : "";
    const hideUploadButton = this.props.customStyle && this.props.customStyle.hideUploadButton && this.props.customStyle.hideUploadButton === "true" ? "none" : "initial";
    const fixCss = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "1.5rem" : "";
    const fixCssBtn = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "38px" : "";
    const hideRnacentral = this.props.customStyle && this.props.customStyle.hideRnacentral && this.props.customStyle.hideRnacentral === "true" ? "none" : "initial";
    const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";
    return (
      <div className="rna">
        { this.props.admin ? <Admin customStyle={this.props.customStyle} /> : '' }
        <div className="row">
          <div className="col-sm-9">
            <small className="text-muted" style={{display: hideRnacentral}}><img src={'https://rnacentral.org/static/img/logo/rnacentral-logo.png'} alt="RNAcentral logo" style={{width: "1%", verticalAlign: "text-top"}}/> Powered by <a className="custom-link mr-2" style={{color: linkColor}} target='_blank' href='https://rnacentral.org/'>RNAcentral</a>|</small>
            <small className="text-muted ml-2">Local alignment using <a target='_blank' className="custom-link" style={{color: linkColor}} href='https://www.ncbi.nlm.nih.gov/pubmed/23842809'>nhmmer</a></small>
          </div>
        </div>
        <form onSubmit={(e) => this.onSubmit(e)}>
          <div className="row mt-1">
            <div className="col-sm-9">
              <textarea style={{fontSize: fixCss}} className="form-control" id="sequence" name="sequence" rows="7" value={this.props.sequence} onChange={(e) => this.props.onSequenceTextareaChange(e)} placeholder="Enter RNA/DNA sequence (with an optional description in FASTA format) or job id" />
            </div>
            <div className="col-sm-3">
              <button className="btn btn-primary mb-2" style={{background: searchButtonColor, borderColor: searchButtonColor, fontSize: fixCss, height: fixCssBtn}} type="submit" disabled={!this.props.sequence ? "disabled" : ""}>
                { this.props.submitBatchSearch ? <span><span className={`spinner-border ${fixCss ? '' : 'spinner-border-sm'}`} role="status" aria-hidden="true"></span> Loading</span> : <span><span className="btn-icon"><FaSearch /></span> Search</span>}
              </button><br />
              <button className="btn btn-secondary mb-2" style={{background: clearButtonColor, borderColor: clearButtonColor, fontSize: fixCss, height: fixCssBtn}} type="submit" onClick={ this.props.onClearSequence } disabled={!this.props.sequence ? "disabled" : ""}><span className="btn-icon"><FiTrash2 /></span> Clear</button><br />
              <div style={{display: hideUploadButton}}>
                <label htmlFor="file-upload" className="custom-file-upload" style={{background: uploadButtonColor}}><MdFileUpload /> Upload file</label>
                <input id="file-upload" type="file" accept=".fasta" onClick={ this.props.onClearSequence } onChange={this.props.onFileUpload} />
                <div className="row"><small>Up to 50 queries (beta)</small></div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-9">
              {this.props.examples ? <div id="examples"><ul className="text-muted">Examples: {this.showExamples(linkColor)}</ul></div> : ""}
            </div>
          </div>
          {
            !this.props.databases && (
              <div className="row">
                <div className="col-sm-9">
                  <div className="alert alert-danger">
                    You must specify the database that will be used to search sequences
                  </div>
                </div>
              </div>
            )
          }
          {
            this.props.submissionError && (
              <div className="row">
                <div className="col-sm-9">
                  <div className="alert alert-danger">
                    { this.props.submissionError }
                  </div>
                </div>
              </div>
            )
          }
          {
            this.props.status === "invalidSequence" && (
              <div className="row">
                <div className="col-sm-9">
                  <div className="alert alert-warning">
                    {this.props.sequence.length < 10 ? "The sequence cannot be shorter than 10 nucleotides" : "The sequence cannot be longer than 7000 nucleotides"}
                  </div>
                </div>
              </div>
            )
          }
          {
            this.showExactMatch(linkColor)
          }
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  status: state.status,
  infernalStatus: state.infernalStatus,
  submitBatchSearch: state.submitBatchSearch,
  submissionError: state.submissionError,
  sequence: state.sequence,
  hits: state.hits,
  entries: state.entries,
  facets: state.facets,
  hitCount: state.hitCount,
  ordering: state.ordering,
  textSearchError: state.textSearchError,
  infernalEntries: state.infernalEntries,
  fileUpload: state.fileUpload,
  exactMatch: state.exactMatch,
});

const mapDispatchToProps = (dispatch) => ({
  onSequenceTextareaChange: (event) => dispatch(actionCreators.onSequenceTextAreaChange(event)),
  onClearSequence: () => dispatch(actionCreators.onClearSequence()),
  onFileUpload: (event) => dispatch(actionCreators.onFileUpload(event))
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchForm);
