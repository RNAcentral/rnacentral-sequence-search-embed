import React from 'react';
import {connect} from 'react-redux';

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
    if (e.target.value === 'Select a job ID'){
      store.dispatch(actionCreators.onClearJobId());
    } else {
      store.dispatch(actionCreators.updateJobId(e.target.value));
    }
  }

  render() {
    let h3Style = {
      color: this.props.customStyle && this.props.customStyle.h3Color ? this.props.customStyle.h3Color : "#666",
      fontSize: this.props.customStyle && this.props.customStyle.h3Size ? this.props.customStyle.h3Size : "",
      fontWeight: "300",
    };
    return (
      <div className="row">
        {
          this.props.jobList && this.props.jobList.length !== 0 && (
            <div className="small-12 columns">
              <select onChange={this.onSeeResults}>
                <option key={'no-job-selected'}>Select a job ID</option>
                {this.props.jobList.map((job) => <option key={job}>{job}</option>)}
              </select>
            </div>
          )
        }
        {
          this.props.status === "partial_success" && (
            <div className="small-12 columns callout alert">
              <h3>Search against some databases failed.</h3>
              <p>Search results might be incomplete, you might want to retry running the search.</p>
            </div>
          )
        }
        {
          this.props.status === "does_not_exist" && (
            <div className="small-12 columns callout alert">
              <h3>Job with id='{ this.props.jobId }' does not exist.</h3>
            </div>
          )
        }
        {
          this.props.status === "error" && (
            <div className="small-12 columns callout alert">
              <h3>There was an error.</h3>
              <a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.
            </div>
          )
        }
        {
          this.props.jobId && this.props.rfam && (
            (this.props.infernalStatus === "loading" || this.props.infernalStatus === "success") && [
              <div className="small-12 columns" key={`infernal-div`}>
                <h3 style={h3Style}>Rfam classification: { this.props.infernalStatus === "loading" ? <i className="animated infinite flash">...</i> : '' }</h3>
                <table className="responsive-table">
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
                  { this.props.infernalEntries.length ? this.props.infernalEntries.map((entry, index) => (
                    <tr key={`${index}`}>
                      <td><a href={`https://rfam.org/family/${entry.target_name}`} target="_blank">{entry.description}</a></td>
                      <td><a href={`https://rfam.org/family/${entry.accession_rfam}`} target="_blank">{entry.accession_rfam}</a></td>
                      <td>{entry.seq_from}</td>
                      <td>{entry.seq_to}</td>
                      <td>{entry.score}</td>
                      <td>{entry.e_value}</td>
                      <td>{entry.strand}</td>
                    </tr>
                  )) : <tr key={"noResults"}><td colSpan="7" style={{textAlign: 'center'}}>The query sequence did not match any Rfam families.</td></tr> }
                  </tbody>
                </table>
              </div>
            ]
          )
        }
        {
          this.props.jobId && (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <div className="small-12 columns" key={`results-div`}>
              <h3 style={h3Style}>Similar sequences: { this.props.status === "loading" ? <i className="animated infinite flash">...</i> : <small>{ this.props.hitCount }</small> }</h3>
              <div className="small-3 columns">
                { this.props.entries ?
                  <Facets
                      facets={ this.props.facets }
                      selectedFacets={ this.props.selectedFacets }
                      toggleFacet={ this.toggleFacet }
                      ordering={ this.props.ordering }
                      textSearchError={ this.props.textSearchError }
                      hideFacet={ this.props.hideFacet}
                      customStyle={ this.props.customStyle }
                  /> : ''}
              </div>
              <div className="small-9 columns">
                <section>
                  { this.props.entries.map((entry, index) => (
                  <ul key={`${entry}_${index}`}><Hit entry={entry} alignmentsCollapsed={this.props.alignmentsCollapsed} onToggleAlignmentsCollapsed={ this.onToggleAlignmentsCollapsed } customStyle={ this.props.customStyle }/></ul>
                  )) }
                  {(this.props.status === "success" || this.props.status === "partial_success") && (this.props.entries.length < this.props.hitCount) && (<a className="button small" onClick={this.props.onLoadMore} target="_blank">Load more</a>)}
                </section>
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
    entries: state.entries,
    facets: state.facets,
    selectedFacets: state.selectedFacets,
    hitCount: state.hitCount,
    ordering: state.ordering,
    textSearchError: state.textSearchError,
    jobId: state.jobId,
    jobList: state.jobList,
    infernalEntries: state.infernalEntries,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed : () => dispatch({ type: 'TOGGLE_ALIGNMENTS_COLLAPSED' }),
    onLoadMore : (event) => dispatch(actionCreators.onLoadMore(event))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
