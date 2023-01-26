import React from 'react';
import {connect} from 'react-redux';
import { CSVLink } from "react-csv";

import Facets from 'containers/SequenceSearch/components/Results/components/Facets.jsx';
import Hit from 'containers/SequenceSearch/components/Results/components/Hit.jsx';
import Filter from 'containers/SequenceSearch/components/Results/components/Filter.jsx';
import R2DT from 'containers/SequenceSearch/components/Results/components/R2DT.jsx';
import Rfam from 'containers/SequenceSearch/components/Results/components/Rfam.jsx';

import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";

import { MdHelpOutline } from 'react-icons/md'


class Results extends React.Component {
  constructor(props) {
    super(props);
  }

  onSeeResults(e, r2dt) {
    if (e.target.value === '{}' || JSON.parse(e.target.value).description === "Error submitting sequence. Check your fasta file and try again later."){
      store.dispatch(actionCreators.onClearJobId());
    } else {
      store.dispatch(actionCreators.onClearResult());
      store.dispatch(actionCreators.updateJobId(JSON.parse(e.target.value).jobid, r2dt));
    }
  }

  submitToRnacentral(event) {
    event.preventDefault();
    const state = store.getState();
    state.rnacentral = true;
    if (state.sequence) {
      store.dispatch(actionCreators.onClearResult());
      store.dispatch(actionCreators.onSubmit(state.sequence, []));
    }
  }

  showSearchInProgress(){
    const state = store.getState();

    for (const item of state.searchInProgress) {
      if (item.jobId === state.jobId){
        return <div className="col-sm-12 mt-3">
          <div className="progress" style={{height: "20px"}}>
            <div className="progress-bar" role="progressbar" style={{width: `${item.finishedChunk}%`}} aria-valuenow={item.finishedChunk} aria-valuemin="0" aria-valuemax="100">
              <span style={{fontSize: "12px"}}>Searching...</span>
            </div>
          </div>
        </div>
      }
    }
  }

  render() {
    let h3Style = {
      color: this.props.customStyle && this.props.customStyle.h3Color ? this.props.customStyle.h3Color : "#007c82",
      fontSize: this.props.customStyle && this.props.customStyle.h3Size ? this.props.customStyle.h3Size : "28px",
    };
    const loadMoreButtonColor = this.props.customStyle && this.props.customStyle.loadMoreButtonColor ? this.props.customStyle.loadMoreButtonColor : "";
    const similarSeqText = this.props.customStyle && this.props.customStyle.similarSeqText ? this.props.customStyle.similarSeqText : "Similar sequences";
    const fixCss = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "1.5rem" : "";
    const fixCssBtn = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "38px" : "";
    const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";
    const showRfamFirst = !!(this.props.customStyle && this.props.customStyle.showRfamAlignment);

    // exact match URS ids
    const exactMatch = this.props.exactMatch;
    let exactMatchUrsId = [];
    if (exactMatch && exactMatch.hitCount > 0) {
      const exactMatchIds = Object.entries(exactMatch).map(([key, value]) => {
          value && value.length && value.map(item => exactMatchUrsId.push(item.id))
        })
    }

    // batch queries
    const sequences = this.props.jobList;
    const sequenceError = sequences.filter(sequence => sequence.description === "Error submitting sequence. Check your fasta file and try again later.")
    const r2dt = !!this.props.r2dt;  // true if exists, otherwise false
    const headers = [
      { label: "Job ID", key: "jobid" },
      { label: "Description", key: "description" },
      { label: "Sequence", key: "sequence" }
    ];
    const csvData = this.props.jobList.map(item => (
      { jobid: item.jobid, description: item.description, sequence: item.sequence }
    ));

    return (
      <div className="rna">
        {
          this.props.jobList && this.props.jobList.length > 0 && (
            <div className="row" key={`select-id-div`}>
              <div className="col-sm-9">
                <div className="form-group">
                  <div className={`alert ${sequenceError.length > 0 ? 'alert-warning' : 'alert-success'}`}>
                    <label htmlFor="selectJobId">
                      { sequenceError.length > 0 ?
                          <span>{sequences.length} sequences were submitted, but {sequenceError.length} failed. </span>
                        : <span>{sequences.length} sequences were submitted. </span>
                      }
                      <CSVLink data={csvData} headers={headers} filename={"RNAcentral jobs.csv"}>
                        <span>Download the Ids</span>
                      </CSVLink>
                      <span> for future reference.</span>
                    </label>
                  </div>
                  <select className="form-select mb-3" style={{fontSize: fixCss}} id="selectJobId" onChange={(e) => this.onSeeResults(e, r2dt)}>
                    <option key={'no-job-selected'} value={JSON.stringify({})}>Select an Id to check the results</option>
                    {this.props.jobList.map((item, index) => <option key={`${index}_${item.jobid}`} value={JSON.stringify(item)}>{item.description}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )
        }
        {
          this.props.jobId && this.props.status === "partial_success" && (
            <div className="row" key={`partial-success-div`}>
              <div className="col-sm-9">
                <div className="alert alert-warning">
                  <p><strong>Search against some databases failed</strong></p>
                  <span>This usually happens when the nhmmer is unable to complete the search within a 5 minute time limit.</span>
                </div>
              </div>
            </div>
          )
        }
        {
          this.props.jobId && this.props.status === "does_not_exist" && (
            <div className="row" key={`does-not-exist-div`}>
              <div className="col-sm-9">
                <div className="alert alert-danger">
                  <p><strong>Job not found</strong></p>
                  <span>The results might have expired. If you think this is an error, please let us know by raising an issue on <a href="https://github.com/RNAcentral/rnacentral-sequence-search-embed/issues" target="_blank">GitHub</a>.</span>
                </div>
              </div>
            </div>
          )
        }
        {
          this.props.jobId && this.props.status === "error" && (
            <div className="row" key={`error-div`}>
              <div className="col-sm-9">
                <div className="alert alert-danger">
                  <p><strong>There was an error</strong></p>
                  <span>Let us know if the problem persists by raising an issue on <a href="https://github.com/RNAcentral/rnacentral-sequence-search-embed/issues" target="_blank">GitHub</a>.</span>
                </div>
              </div>
            </div>
          )
        }
        {
          showRfamFirst && this.props.jobId && this.props.status !== "does_not_exist" && this.props.rfam && <Rfam customStyle={this.props.customStyle} />
        }
        {
          showRfamFirst && this.props.jobId && this.props.status !== "does_not_exist" && this.props.r2dt && <R2DT customStyle={this.props.customStyle} />
        }
        {
          !showRfamFirst && this.props.jobId && this.props.status !== "does_not_exist" && this.props.r2dt && <R2DT customStyle={this.props.customStyle} />
        }
        {
          !showRfamFirst && this.props.jobId && this.props.status !== "does_not_exist" && this.props.rfam && <Rfam customStyle={this.props.customStyle} />
        }
        {
          this.props.jobId && (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <div className="row" key={`results-div`}>
              <div className="col-sm-12 mt-3 mb-3">
                <span style={h3Style}>{similarSeqText} </span>{ this.props.status === "loading" ? <div className={`spinner-border ${fixCss ? '' : 'spinner-border-sm'} mb-1`} role="status" /> : <span style={h3Style}><small className="text-muted" style={{fontSize: "65%"}}>{ this.props.hitCount }</small>{ this.props.hits > 1000 ? <small className="text-muted" style={{fontSize: "65%"}}> of { this.props.hits } <a className="text-muted" style={{verticalAlign: "10%"}} href="https://rnacentral.org/help/sequence-search#number" target="_blank"> <MdHelpOutline /></a></small> : ''}</span> }
              </div>
              { this.props.databases.length === 0 ? this.showSearchInProgress() : '' }
              <div>
                {
                  this.props.entries && this.props.entries.length || this.props.filter ? <Filter databases={this.props.databases} customStyle={ this.props.customStyle }/> : ""
                }
                {
                  this.props.entries && this.props.entries.length ? <div className="row mt-3">
                    <div className="col-sm-3">
                      <Facets
                         facets={ this.props.facets }
                         selectedFacets={ this.props.selectedFacets }
                         toggleFacet={ this.toggleFacet }
                         ordering={ this.props.ordering }
                         textSearchError={ this.props.textSearchError }
                         hideFacet={ this.props.hideFacet}
                         customStyle={ this.props.customStyle }
                         databases={this.props.databases}
                      />
                    </div>
                    <div className="col-sm-9">
                      <section>
                        { this.props.entries.map((entry, index) => (
                        <ul className="list-unstyled" key={`${entry}_${index}`}>
                          <Hit
                              entry={entry}
                              customStyle={this.props.customStyle}
                              customUrl={this.props.customUrl}
                              databases={this.props.databases}
                              exactMatchUrsId={exactMatchUrsId}
                          />
                        </ul>
                        )) }
                        {this.props.status === "loading" ? <div className="spinner-border" role="status" /> : (this.props.status === "success" || this.props.status === "partial_success") && (this.props.entries.length < this.props.hitCount) && (<button className="btn btn-secondary" onClick={this.props.onLoadMore} style={{background: loadMoreButtonColor, borderColor: loadMoreButtonColor, fontSize: fixCss, height: fixCssBtn}}>Load more</button>)}
                      </section>
                    </div>
                  </div> : this.props.status === "loading" ? '' : this.props.filter ? <div className="mt-3">No results. Try a different search or press the Clear button to view all results.</div> : this.props.rnacentral || this.props.databases.length === 0 ? <div className="mt-1">No results at <img src={'https://rnacentral.org/static/img/logo/rnacentral-logo.png'} alt="RNAcentral logo" style={{width: "1%", verticalAlign: "sub"}}/> RNAcentral.</div> : <div className="mt-1">The query sequence did not match any {this.props.databases} sequences. You can <a className="custom-link" style={{color: linkColor}} href="#" onClick={this.submitToRnacentral}>try to search against RNAcentral</a>.</div>
                }
              </div>
            </div>
          ]
        }
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    status: state.status,
    sequence: state.sequence,
    hits: state.hits,
    entries: state.entries,
    facets: state.facets,
    selectedFacets: state.selectedFacets,
    hitCount: state.hitCount,
    ordering: state.ordering,
    filter: state.filter,
    textSearchError: state.textSearchError,
    alignmentsCollapsed: state.alignmentsCollapsed,
    detailsCollapsed: state.detailsCollapsed,
    jobId: state.jobId,
    jobList: state.jobList,
    exactMatch: state.exactMatch,
    rnacentral: state.rnacentral,
    searchInProgress: state.searchInProgress,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLoadMore: (event) => dispatch(actionCreators.onLoadMore(event)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
