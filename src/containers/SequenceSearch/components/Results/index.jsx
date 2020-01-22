import React from 'react';
import {connect} from 'react-redux';

import Facets from 'containers/SequenceSearch/components/Results/components/Facets.jsx';
import Hit from 'containers/SequenceSearch/components/Results/components/Hit.jsx';

import 'containers/SequenceSearch/components/Results/index.scss';
import * as actionCreators from 'actions/actions';


class Results extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className="row">
        {
          this.props.status === "partial_success" && (
            <div className="callout alert">
              <h3>Search against some databases failed.</h3>
              <p>Search results might be incomplete, you might want to retry running the search.</p>
            </div>
          )
        }
        {
          this.props.status === "does_not_exist" && (
            <div className="callout alert">
              <h3>Job with id='{ this.props.jobId }' does not exist.</h3>
            </div>
          )
        }
        {
          this.props.status === "error" && (
            <div className="callout alert">
              <h3>There was an error.</h3>
              <a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.
            </div>
          )
        }
        {
          this.props.rfam && (
            (this.props.infernal_status === "loading" || this.props.infernal_status === "success") && [
              <h2 className="custom-h2" key={`infernal-header`}>Rfam classification: { this.props.infernal_status === "loading" ? <i className="animated infinite flash">...</i> : '' }</h2>,
              <div key={`infernal-div`}>
                <table id="infernal-table">
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
                  { this.props.infernal_entries.length ? this.props.infernal_entries.map((entry, index) => (
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
          (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <h2 className="custom-h2" key={`results-header`}>Similar sequences: { this.props.status === "loading" ? <i className="animated infinite flash">...</i> : <small>{ this.props.hitCount }</small> }</h2>,
            <div key={`results-div`} className="small-12 medium-10 medium-push-2 columns">
              <section>
                { this.props.entries.map((entry, index) => (
                <ul key={`${entry}_${index}`}><Hit entry={entry} alignmentsCollapsed={this.props.alignmentsCollapsed} onToggleAlignmentsCollapsed={ this.onToggleAlignmentsCollapsed } /></ul>
                )) }
                {(this.props.status === "success" || this.props.status === "partial_success") && (this.props.entries.length < this.props.hitCount) && (<a className="button small" onClick={this.props.onLoadMore} target="_blank">Load more</a>)}
              </section>
            </div>,
            <div key={`results-facets`}>
              { this.props.entries ?
                <Facets
                    facets={ this.props.facets }
                    selectedFacets={ this.props.selectedFacets }
                    toggleFacet={ this.toggleFacet }
                    ordering={ this.props.ordering }
                    textSearchError={ this.props.textSearchError }
                /> : ''}
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
    infernal_status: state.infernal_status,
    sequence: state.sequence,
    entries: state.entries,
    facets: state.facets,
    selectedFacets: state.selectedFacets,
    hitCount: state.hitCount,
    ordering: state.ordering,
    textSearchError: state.textSearchError,
    jobId: state.jobId,
    infernal_entries: state.infernal_entries,
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
