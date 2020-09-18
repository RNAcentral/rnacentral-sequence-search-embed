import React from 'react';
import {connect} from "react-redux";

import * as actionCreators from 'actions/actions';
import info from 'expert-dbs/index'

import { FaCheckCircle } from 'react-icons/fa';


class Hit extends React.Component {
  render() {
    let seqTitleStyle = {
      color: this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7",
      fontSize: this.props.customStyle && this.props.customStyle.seqTitleSize ? this.props.customStyle.seqTitleSize : "20px",
    };
    let seqInfoStyle = {
      color: this.props.customStyle && this.props.customStyle.seqInfoColor ? this.props.customStyle.seqInfoColor : "",
      fontSize: this.props.customStyle && this.props.customStyle.seqInfoSize ? this.props.customStyle.seqInfoSize : "",
    };

    // show Expert DBs logos
    const expertDb = this.props.entry.fields && this.props.entry.fields.expert_db ? this.props.entry.fields.expert_db : [];
    const newExpertDb = expertDb.map((item) => {
      return item.toLowerCase();
    });
    const showExpertDb = info.filter(({name}) => newExpertDb.includes(name));
    const exactMatchUrsId = this.props.exactMatchUrsId.indexOf(this.props.entry.rnacentral_id) > -1 ? <FaCheckCircle style={{color: '#3c763d', verticalAlign: '-1px'}}/> : '';

    // check database used. Empty array means RNAcentral
    let database = this.props.databases.length !== 0 ? this.props.databases[0].toLowerCase() : "";
    // there isn’t always a relationship between the DB name and the url.
    if (database === "snodb") {
      database = "scottgroup";
    }
    const link = database && this.props.entry.fields && this.props.entry.fields.url && this.props.entry.fields.url.length ? this.props.entry.fields.url.filter((item) => item.includes(database)) : ''

    return (
      <li>
        {exactMatchUrsId} <a className="custom-link" style={seqTitleStyle} href={link ? link[0] : `https://rnacentral.org/rna/${this.props.entry.rnacentral_id}`} target='_blank'>
          {this.props.entry.description}
        </a>
        {database === "" ? <div className="text-muted mt-2" style={seqInfoStyle}>{ this.props.entry.rnacentral_id } {showExpertDb.map((db, index) => <img key={index} className="ml-2 desaturate" src={`https://rnacentral.org/static/img/expert-db-logos/${db.name}.png`} alt={`${db.name} logo`} style={{height: "16px"}} />)}</div>
            : <div className="text-muted mt-2" style={seqInfoStyle}>{this.props.entry.target_length} nucleotides</div>}
        <div className={this.props.detailsCollapsed ? 'detail-collapsed' : 'mt-1'}>
          <span className="detail">E-value: { this.props.entry.e_value.toExponential() }</span>
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