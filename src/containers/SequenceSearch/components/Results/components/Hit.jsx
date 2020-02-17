import React from 'react';
import {connect} from "react-redux";

import * as actionCreators from 'actions/actions';


class Hit extends React.Component {
  render() {
    const database = this.props.databases;
    const exactMatchUrsId = this.props.exactMatchUrsId.indexOf(this.props.entry.rnacentral_id) > -1 ? <i className="icon icon-functional" data-icon="/" style={{fontSize: "75%", color: "#3c763d"}}> </i> : '';
    let seqTitleStyle = {
      color: this.props.customStyle && this.props.customStyle.seqTitleColor ? this.props.customStyle.seqTitleColor : "",
      fontSize: this.props.customStyle && this.props.customStyle.seqTitleSize ? this.props.customStyle.seqTitleSize : "20px",
    };
    let seqInfoStyle = {
      color: this.props.customStyle && this.props.customStyle.seqInfoColor ? this.props.customStyle.seqInfoColor : "",
      fontSize: this.props.customStyle && this.props.customStyle.seqInfoSize ? this.props.customStyle.seqInfoSize : "14px",
    };
    return (
      <li className="result">
        <div className="text-search-result">
          <div>
            <a style={seqTitleStyle} href={database.length !== 0 && this.props.entry.fields.url && this.props.entry.fields.url.length ? this.props.entry.fields.url[0] : `https://rnacentral.org/rna/${this.props.entry.rnacentral_id}`} target='_blank'>
              {exactMatchUrsId} {this.props.entry.description}
            </a>
          </div>
          <div style={seqInfoStyle}>{ this.props.entry.rnacentral_id }</div>
          <div style={seqInfoStyle}>{this.props.entry.target_length} nucleotides</div>
          <small>
            <a onClick={ this.props.onToggleAlignmentsCollapsed }>
              { this.props.alignmentsCollapsed ? <span>&#x25B6; show alignments</span> : <span>&#x25BC; hide alignments</span> }
            </a>
          </small>
          <div className={`callout alignment ${this.props.alignmentsCollapsed ? 'alignment-collapsed' : ''}`}>
            <table className="responsive-table alignment-table">
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
    textSearchError: state.textSearchError,
    alignmentsCollapsed: state.alignmentsCollapsed
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