import ebiGlobal from 'ebi-framework/css/ebi-global.css';
import styles from '../index.scss';
import fonts from 'EBI-Icon-fonts/fonts.css';

import React from 'react';
import {connect} from "react-redux";

import * as actions from 'actions/actionTypes';
import * as actionCreators from 'actions/actions';


class Hit extends React.Component {
  render() {
    return (
      <li className={styles.result}>
        <div className={styles['text-search-result']}>
          <h4>
            <a href={`https://rnacentral.org/rna/${ this.props.entry.rnacentral_id }`}>{ this.props.entry.description }</a>
          </h4>
          <small>{ this.props.entry.rnacentral_id }</small>
          <ul className={`${ebiGlobal.menu} ${ebiGlobal.small}`}>
            <li>{this.props.entry.target_length} nucleotides</li>
            <li></li>
          </ul>
          <small>
            <a onClick={ this.props.onToggleAlignmentsCollapsed }>
              { this.props.alignmentsCollapsed ? <span><i className={`${fonts.icon} ${fonts['icon-functional']}`} data-icon="9" /> show alignments</span> : <span><i className={`${fonts.icon} ${fonts['icon-functional']}`} data-icon="8"/> hide alignments</span> }
            </a>
          </small>
          <div className={`${ebiGlobal.callout} ${styles.alignment} ${this.props.alignmentsCollapsed ? styles['alignment-collapsed'] : ''}`}>
            <table className={ `${ebiGlobal['responsive-table']} ${styles['alignment-table']}` }>
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