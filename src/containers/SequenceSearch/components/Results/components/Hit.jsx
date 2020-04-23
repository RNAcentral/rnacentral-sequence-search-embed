import React from 'react';
import {connect} from "react-redux";

import * as actionCreators from 'actions/actions';
import images from 'images/expert-db-logos/index'

import { FaCheckCircle } from 'react-icons/fa';


class Hit extends React.Component {
  render() {
    const expertDb = this.props.entry.fields && this.props.entry.fields.expert_db ? this.props.entry.fields.expert_db : [];
    const newExpertDb = expertDb.map((item) => {
      return item.toLowerCase();
    });
    const showExpertDb = images.filter(({src, title}) => newExpertDb.includes(title));
    const database = this.props.databases;
    const exactMatchUrsId = this.props.exactMatchUrsId.indexOf(this.props.entry.rnacentral_id) > -1 ? <FaCheckCircle style={{color: '#3c763d', verticalAlign: '-1px'}}/> : '';
    let seqTitleStyle = {
      color: this.props.customStyle && this.props.customStyle.seqTitleColor ? this.props.customStyle.seqTitleColor : "",
      fontSize: this.props.customStyle && this.props.customStyle.seqTitleSize ? this.props.customStyle.seqTitleSize : "20px",
    };
    let seqInfoStyle = {
      color: this.props.customStyle && this.props.customStyle.seqInfoColor ? this.props.customStyle.seqInfoColor : "",
      fontSize: this.props.customStyle && this.props.customStyle.seqInfoSize ? this.props.customStyle.seqInfoSize : "",
    };
    return (
      <li>
        {exactMatchUrsId} <a className="custom-link" style={seqTitleStyle} href={database.length !== 0 && this.props.entry.fields && this.props.entry.fields.url && this.props.entry.fields.url.length ? this.props.entry.fields.url[0] : `https://rnacentral.org/rna/${this.props.entry.rnacentral_id}`} target='_blank'>
          {this.props.entry.description}
        </a>
        {database.length === 0 && <div className="text-muted mt-2" style={seqInfoStyle}>{ this.props.entry.rnacentral_id } {showExpertDb.map((db, index) => <img key={index} className="ml-2 desaturate" src={db.src} style={{height: "16px"}} />)}</div>}
        {database.length === 0 ? '' : <div className="text-muted mt-2" style={seqInfoStyle}>{this.props.entry.target_length} nucleotides</div>}
        <div className={this.props.detailsCollapsed ? 'detail-collapsed' : 'mt-1'}>
          <span className="detail">E-value: { this.props.entry.e_value }</span>
          <span className="detail">Identity: { `${parseFloat(this.props.entry.identity).toFixed(2)}%`}</span>
          <span className="detail">Query coverage: { `${parseFloat(this.props.entry.query_coverage).toFixed(2)}%` }</span>
          <span className="detail">Target coverage: { `${parseFloat(this.props.entry.target_coverage).toFixed(2)}%`}</span>
          <span className="detail">Gaps: { `${parseFloat(this.props.entry.gaps).toFixed(2)}%` }</span>
        </div>
        <div className={`alignment ${this.props.alignmentsCollapsed ? 'alignment-collapsed' : ''}`}>
          <p>{this.props.entry.alignment}</p>
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
    alignmentsCollapsed: state.alignmentsCollapsed,
    detailsCollapsed: state.detailsCollapsed
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed: () => dispatch(actionCreators.onToggleAlignmentsCollapsed()),
    onToggleDetailsCollapsed: () => dispatch(actionCreators.onToggleDetailsCollapsed()),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Hit);