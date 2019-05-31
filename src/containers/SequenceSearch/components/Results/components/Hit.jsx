import React from 'react';
import {connect} from "react-redux";

import * as actions from 'actions/actionTypes';
import * as actionCreators from 'actions/actions';


class Hit extends React.Component {
  render() {
    return (
      <li className="result">
        <div className="text-search-result">
          <h4>
            <a href={`https://rnacentral.org/rna/${ this.props.entry.rnacentral_id }`}>{ this.props.entry.description }</a>
          </h4>
          <small className="text-muted">{ this.props.entry.rnacentral_id }</small>
          <ul className="menu small">
            <li>{this.props.entry.target_length} nucleotides</li>
            <li></li>
          </ul>
          <small>
            <a onClick={ this.props.onToggleAlignmentsCollapsed }>
              { this.props.alignmentsCollapsed ? <span><i className="icon icon-functional" data-icon="9" /> show alignments</span> : <span><i className="icon icon-functional" data-icon="8"/> hide alignments</span> }
            </a>
          </small>
          <div className={`callout alignment ${this.props.alignmentsCollapsed ? 'alignment-collapsed' : ''}`}>
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>E-value</th>
                  <th>Identity</th>
                  <th>Query coverage</th>
                  <th>Target coverage</th>
                  <th>Gaps</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{ this.props.entry.e_value }</td>
                  <td>{ `${parseFloat(this.props.entry.identity).toFixed(2)}%`}</td>
                  <td>{ `${parseFloat(this.props.entry.query_coverage).toFixed(2)}%` }</td>
                  <td>{ `${parseFloat(this.props.entry.target_coverage).toFixed(2)}%`}</td>
                  <td>{ `${parseFloat(this.props.entry.gaps).toFixed(2)}%` }</td>
                </tr>
              </tbody>
            </table>
            <p>{this.props.entry.alignment}</p>
          </div>
        </div>
      </li>
    )
  }
}

function mapStateToProps(state) {
  return {
    status: state.status,
    sequence: state.sequence,
    entries: state.entries,
    facets: state.facets,
    selectedFacets: state.selectedFacets,
    hitCount: state.hitCount,
    ordering: state.ordering,
    textSearchError: state.textSearchError
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed: () => dispatch(actionCreators.onToggleAlignmentsCollapsed())
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Hit);