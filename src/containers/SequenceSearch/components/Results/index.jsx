import React from 'react';
import {connect} from 'react-redux';
import { CSVLink } from "react-csv";

import Facets from 'containers/SequenceSearch/components/Results/components/Facets.jsx';
import Hit from 'containers/SequenceSearch/components/Results/components/Hit.jsx';
import Filter from 'containers/SequenceSearch/components/Results/components/Filter.jsx';

import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";


class Results extends React.Component {
  constructor(props) {
    super(props);
  }

  onSeeResults(e) {
    if (e.target.value === 'Select an Id to check the results' || e.target.value === 'Invalid sequence. Check your fasta file.'){
      store.dispatch(actionCreators.onClearJobId());
    } else {
      store.dispatch(actionCreators.onClearResult());
      store.dispatch(actionCreators.updateJobId(e.target.value));
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

  render() {
    let h3Style = {
      color: this.props.customStyle && this.props.customStyle.h3Color ? this.props.customStyle.h3Color : "#007c82",
      fontSize: this.props.customStyle && this.props.customStyle.h3Size ? this.props.customStyle.h3Size : "28px",
    };
    const loadMoreButtonColor = this.props.customStyle && this.props.customStyle.loadMoreButtonColor ? this.props.customStyle.loadMoreButtonColor : "";
    const similarSeqText = this.props.customStyle && this.props.customStyle.similarSeqText ? this.props.customStyle.similarSeqText : "Similar sequences";
    const jobIdBackgroundColor = this.props.customStyle && this.props.customStyle.jobIdBackgroundColor ? this.props.customStyle.jobIdBackgroundColor : "";

    // exact match URS ids
    const exactMatch = this.props.exactMatch;
    let exactMatchUrsId = [];
    if (exactMatch && exactMatch.hitCount > 0) {
      const exactMatchIds = Object.entries(exactMatch).map(([key, value]) => {
          value && value.length && value.map(item => exactMatchUrsId.push(item.id))
        })
    }

    return (
      <div className="rna">
        {
          this.props.jobList && this.props.jobList.length > 0 && (
            <div className="row" key={`select-id-div`}>
              <div className="col-sm-9">
                <div className="form-group">
                  <label htmlFor="selectJobId">
                    <span>{this.props.jobList.length} sequences were submitted. </span>
                    <CSVLink data={Object.entries(this.props.jobList)} filename={"job-ids.csv"}>
                      <span>Download the Ids</span>
                    </CSVLink>
                    <span> for future reference.</span>
                  </label>
                  <select className="form-select mb-3" id="selectJobId" onChange={this.onSeeResults}>
                    <option key={'no-job-selected'}>Select an Id to check the results</option>
                    {this.props.jobList.map((job) => <option key={job}>{job}</option>)}
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
                  <h4>Search against some databases failed.</h4>
                  <p>This usually happens when the nhmmer is unable to complete the search within a 5 minute time limit.</p>
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
                  <h4>Job with id='{ this.props.jobId }' does not exist.</h4>
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
                  <h4>There was an error.</h4>
                  <a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.
                </div>
              </div>
            </div>
          )
        }
        {
          this.props.jobId && this.props.rfam && (
            <div className="row" key={`infernal-div`}>
              <div className="col-sm-12">
                <span className="result-title" style={h3Style}>Rfam classification </span>{ this.props.infernalStatus === "loading" ? <div className="spinner-border spinner-border-sm  mb-1" role="status" /> : '' }
                { this.props.infernalStatus === "loading" ? '' : this.props.infernalStatus === "success" && this.props.infernalEntries.length ? [
                  <div className="table-responsive mt-1">
                    <table className="table" key={`infernal-table`}>
                      <thead>
                        <tr>
                          <th>Family</th>
                          <th>Accession</th>
                          <th>Start</th>
                          <th>End</th>
                          <th>Bit score</th>
                          <th>E-value</th>
                          <th>Strand</th>
                          <th>Alignment</th>
                        </tr>
                      </thead>
                      <tbody>
                      {this.props.infernalEntries.map((entry, index) => (
                        <React.Fragment>
                          <tr key={`infernal-table-${index}`} className="noBorder">
                            <td><a className="custom-link" href={`https://rfam.org/family/${entry.target_name}`} target="_blank">{entry.description}</a></td>
                            <td><a className="custom-link" href={`https://rfam.org/family/${entry.accession_rfam}`} target="_blank">{entry.accession_rfam}</a></td>
                            <td>{entry.seq_from}</td>
                            <td>{entry.seq_to}</td>
                            <td>{entry.score}</td>
                            <td>{entry.e_value}</td>
                            <td>{entry.strand}</td>
                            <td>
                              {
                                entry.alignment ?
                                <a className="custom-link" onClick={ this.props.onToggleInfernalAlignmentsCollapsed }>
                                  { this.props.infernalAlignmentsCollapsed ? <span>&#x25B6; Show</span> : <span>&#x25BC; Hide</span> }
                                </a> : "Not available"
                              }
                            </td>
                          </tr>
                          {
                            this.props.infernalAlignmentsCollapsed ? null :
                              <tr>
                                <td colSpan={8} className="alignment-rfam">
                                  <div>{ entry.alignment + '\n' }</div>
                                </td>
                              </tr>
                          }
                        </React.Fragment>
                      ))}
                      </tbody>
                    </table>
                  </div>
                ] : <p>The query sequence did not match any <img src={'https://rnacentral.org/static/img/expert-db-logos/rfam.png'} alt="Rfam logo" style={{width: "6%", verticalAlign: "sub"}}/> families.</p>}
              </div>
            </div>
          )
        }
        {
          this.props.jobId && (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <div className="row" key={`results-div`}>
              <div className="col-sm-12 mb-1">
                <span className="result-title" style={h3Style}>{similarSeqText} </span>{ this.props.status === "loading" ? <div className="spinner-border spinner-border-sm mb-1" role="status" /> : <span className="result-title"><small>{ this.props.hitCount }</small></span> }
              </div>
              {
                this.props.entries && this.props.entries.length || this.props.filter ? <Filter databases={this.props.databases}/> : ""
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
                    />
                  </div>
                  <div className="col-sm-9">
                    <section>
                      { this.props.entries.map((entry, index) => (
                      <ul className="list-unstyled" key={`${entry}_${index}`}><Hit entry={entry} customStyle={this.props.customStyle} databases={this.props.databases} exactMatchUrsId={exactMatchUrsId}/></ul>
                      )) }
                      {this.props.status === "loading" ? <div className="spinner-border" role="status" /> : (this.props.status === "success" || this.props.status === "partial_success") && (this.props.entries.length < this.props.hitCount) && (<button className="btn btn-secondary" onClick={this.props.onLoadMore} style={{background: loadMoreButtonColor}}>Load more</button>)}
                    </section>
                  </div>
                </div> : this.props.status === "loading" ? '' : this.props.filter ? <div>No results. Try a different search or press the Clear button to view all results.</div> : this.props.rnacentral ? <div>No results at <img src={'https://rnacentral.org/static/img/logo/rnacentral-logo.png'} alt="RNAcentral logo" style={{width: "2%", verticalAlign: "sub"}}/> RNAcentral.</div> : <div>The query sequence did not match any {this.props.databases} sequences. You can <a className="custom-link" href="#" onClick={this.submitToRnacentral}>try to search against RNAcentral</a>.</div>
              }
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
    infernalStatus: state.infernalStatus,
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
    infernalEntries: state.infernalEntries,
    infernalAlignmentsCollapsed: state.infernalAlignmentsCollapsed,
    exactMatch: state.exactMatch,
    rnacentral: state.rnacentral,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onLoadMore: (event) => dispatch(actionCreators.onLoadMore(event)),
    onToggleInfernalAlignmentsCollapsed: (event) => dispatch(actionCreators.toggleInfernalAlignmentsCollapsed(event)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
