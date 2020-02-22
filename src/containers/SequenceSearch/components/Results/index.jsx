import React from 'react';
import {connect} from 'react-redux';
import { CSVLink } from "react-csv";

import Facets from 'containers/SequenceSearch/components/Results/components/Facets.jsx';
import Hit from 'containers/SequenceSearch/components/Results/components/Hit.jsx';

import 'containers/SequenceSearch/components/Results/index.scss';
import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";


class Results extends React.Component {
  constructor(props) {
    super(props);
  }

  onSeeResults(e) {
    if (e.target.value === 'Select an Id to check the results'){
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

  onFilterSubmit(event) {
    event.preventDefault();
    const state = store.getState();
    if (state.filter) {
      store.dispatch(actionCreators.onFilterResult());
    }
  }

  render() {
    let h3Style = {
      color: this.props.customStyle && this.props.customStyle.h3Color ? this.props.customStyle.h3Color : "#666",
      fontSize: this.props.customStyle && this.props.customStyle.h3Size ? this.props.customStyle.h3Size : "",
      fontWeight: "300",
    };

    // exact match URS ids
    const exactMatch = this.props.exactMatch;
    let exactMatchUrsId = [];
    if (exactMatch && exactMatch.hitCount > 0) {
      const exactMatchIds = Object.entries(exactMatch).map(([key, value]) => {
          value && value.length && value.map(item => exactMatchUrsId.push(item.id))
        })
    }

    return (
      <div>
        {
          this.props.jobList && this.props.jobList.length > 0 && (
            <div key={`select-id-div`}>
              <div className="row">
                <div className="small-9 columns">
                  <small>{this.props.jobList.length} sequences were submitted. </small>
                  <CSVLink data={Object.entries(this.props.jobList)} filename={"job-ids.csv"}>
                    <small>Download the Ids</small>
                  </CSVLink>
                  <small> for future reference.</small>
                </div>
              </div>
              <div className="row">
                <div className="small-9 columns">
                  <select onChange={this.onSeeResults}>
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
              <div className="small-12 columns">
                <div className="callout warning">
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
              <div className="small-12 columns">
                <div className="callout alert">
                  <h4>Job with id='{ this.props.jobId }' does not exist.</h4>
                </div>
              </div>
            </div>
          )
        }
        {
          this.props.jobId && this.props.status === "error" && (
            <div className="row" key={`error-div`}>
              <div className="small-12 columns">
                <div className="callout alert">
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
              <div className="small-12 columns">
                <h3 style={h3Style}>Rfam classification: { this.props.infernalStatus === "loading" ? <i className="animated infinite flash">...</i> : this.props.infernalEntries && this.props.infernalEntries.length ? <small>{this.props.infernalEntries.length}</small> : <small>0</small> }</h3>
                { this.props.infernalStatus === "loading" ? <i className="animated infinite flash">...</i> : this.props.infernalStatus === "success" && this.props.infernalEntries.length ? [
                  <table className="table-scroll" key={`infernal-table`}>
                    <thead>
                      <tr>
                        <th>Family</th>
                        <th>Accession</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Bit score</th>
                        <th>E-value</th>
                        <th>Strand</th>
                      </tr>
                    </thead>
                    <tbody>
                    {this.props.infernalEntries.map((entry, index) => (
                      <tr key={`${index}`}>
                        <td><a href={`https://rfam.org/family/${entry.target_name}`} target="_blank">{entry.description}</a></td>
                        <td><a href={`https://rfam.org/family/${entry.accession_rfam}`} target="_blank">{entry.accession_rfam}</a></td>
                        <td>{entry.seq_from}</td>
                        <td>{entry.seq_to}</td>
                        <td>{entry.score}</td>
                        <td>{entry.e_value}</td>
                        <td>{entry.strand}</td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                ] : <p>The query sequence did not match any <img src={'https://rnacentral.org/static/img/expert-db-logos/rfam.png'} alt="Rfam logo" style={{width: "6%", verticalAlign: "sub"}}/> families.</p>}
              </div>
            </div>
          )
        }
        {
          this.props.jobId && (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <div className="row" key={`results-div`}>
              <div className="small-12 columns">
                <h3 style={h3Style}>Similar sequences: { this.props.status === "loading" ? <i className="animated infinite flash">...</i> : <small>{ this.props.hitCount }</small> } { this.props.hits > 1000 ? <small>of { this.props.hits } <a href="https://rnacentral.org/help/sequence-search" style={{borderBottomStyle: "none"}} target="_blank"><i className="icon icon-generic icon-help" style={{fontSize: "70%"}}></i></a></small> : "" }</h3>
                {
                  this.props.entries && this.props.entries.length ? <div>
                     <div className="row">
                       <div className="small-12 medium-4 columns">
                         <form className="input-group" onSubmit={(e) => this.onFilterSubmit(e)}>
                           <input className="input-group-field" type="text" value={this.props.filter} onChange={(e) => this.props.onFilterChange(e)} placeholder="Search within results"/>
                           <div className="input-group-button">
                             <button className={`hollow button secondary ${!this.props.filter && "disabled"}`} type="submit">Filter</button>
                           </div>
                           <div className="input-group-button">
                             <button className={`hollow button secondary ${!this.props.filter && "disabled"}`} onClick={this.props.onClearFilter}>Clear</button>
                           </div>
                         </form>
                       </div>
                       <div className="small-12 medium-4 columns">
                         <select value={this.props.sortingOrder} onChange={this.props.onSort}>
                           <option value="e_value">Sort by E-value (min to max) - default</option>
                           <option value="-e_value">Sort by E-value (max to min)</option>
                           <option value="identity">Sort by Identity (max to min)</option>
                           <option value="-identity">Sort by Identity: (min to max)</option>
                           <option value="query_coverage">Sort by Query coverage: (max to min)</option>
                           <option value="-query_coverage">Sort by Query coverage: (min to max)</option>
                           <option value="target_coverage">Sort by Target coverage: (max to min)</option>
                           <option value="-target_coverage">Sort by Target coverage: (min to max)</option>
                         </select>
                       </div>
                       <div className="small-12 medium-4 columns">
                         <div className="button-group">
                           <button className="hollow button secondary" onClick={this.props.onToggleAlignmentsCollapsed}>{this.props.alignmentsCollapsed ? 'Show alignments' : 'Hide alignments'}</button>
                           <button className="hollow button secondary" onClick={this.props.onToggleDetailsCollapsed}>{this.props.detailsCollapsed ? 'Show details' : 'Hide details'}</button>
                         </div>
                       </div>
                     </div>
                     <div className="small-3 columns">
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
                    <div className="small-9 columns">
                      <section>
                        { this.props.entries.map((entry, index) => (
                        <ul key={`${entry}_${index}`}><Hit entry={entry} customStyle={this.props.customStyle} databases={this.props.databases} exactMatchUrsId={exactMatchUrsId}/></ul>
                        )) }
                        <div className="small-12 columns">
                          {this.props.status === "loading" ? <i className="animated infinite flash">...</i> : (this.props.status === "success" || this.props.status === "partial_success") && (this.props.entries.length < this.props.hitCount) && (<a className="button small" onClick={this.props.onLoadMore} target="_blank">Load more</a>)}
                        </div>
                      </section>
                    </div>
                  </div> : this.props.status === "loading" ? <i className="animated infinite flash">...</i> : this.props.rnacentral ? <div>No results at <img src={'https://rnacentral.org/static/img/logo/rnacentral-logo.png'} alt="RNAcentral logo" style={{width: "2%", verticalAlign: "sub"}}/> RNAcentral.</div> : <div>The query sequence did not match any {this.props.databases} sequences. You can <a href="#" onClick={this.submitToRnacentral}>try to search against RNAcentral</a>.</div>
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
    exactMatch: state.exactMatch,
    rnacentral: state.rnacentral,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed: () => dispatch({ type: 'TOGGLE_ALIGNMENTS_COLLAPSED' }),
    onToggleDetailsCollapsed: () => dispatch({ type: 'TOGGLE_DETAILS_COLLAPSED' }),
    onLoadMore: (event) => dispatch(actionCreators.onLoadMore(event)),
    onSort: (event) => dispatch(actionCreators.onSort(event)),
    onFilterChange: (event) => dispatch(actionCreators.onFilterChange(event)),
    onClearFilter: () => dispatch(actionCreators.onClearFilter())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
