import React, {Component} from 'react';
import {store} from "app.jsx";
import * as actionCreators from 'actions/actions';
import {connect} from "react-redux";
import ReactGA from 'react-ga';

class Filter extends Component {
  onFilterSubmit(event) {
    event.preventDefault();
    const state = store.getState();
    if (state.filter) {
      store.dispatch(actionCreators.onFilterResult());
    }
  }

  onFilterReset(event) {
    event.preventDefault();
    const state = store.getState();
    if (state.sequence) {
      store.dispatch(actionCreators.onClearResult());
      store.dispatch(actionCreators.onSubmit(state.sequence, this.props.databases));
    }
  }

  filterClickTrack(value){
    const trackingID = this.props.customStyle && this.props.customStyle.trackingID ? this.props.customStyle.trackingID : "";
    trackingID ? ReactGA.initialize(trackingID) : '';
    trackingID ? ReactGA.event({ category: 'filter', action: 'click', label: value }) : '';
  }

  onDownload() {
    let data = "Query: " + this.props.sequence + "\n" + "\n" +
      "Total of hits: " + this.props.downloadEntries.length + "\n" + "\n" +
      "Annotation for each hit  (and alignments):" + "\n" + "\n" +
      this.props.downloadEntries.map((entry, index) => (
        ">> " + entry.rnacentral_id + " " + entry.description + "\n" +
        "E-value: " + entry.e_value.toExponential() + "\t" +
        "Identity: " +  `${parseFloat(entry.identity).toFixed(2)}%` + "\t" +
        "Query coverage: " + `${parseFloat(entry.query_coverage).toFixed(2)}%` + "\t" +
        "Gaps: " + `${parseFloat(entry.gaps).toFixed(2)}%` + "\n" + "\n" +
        "Alignment: " + "\n" + entry.alignment + "\n" + "\n" + "\n"
      ))
    data = data.replace(/,>>/g, '>>')
    let file = new Blob([data], {type: 'text/plain'});
    let link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = this.props.jobId + '.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  render() {
    const fixCss = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "1.5rem" : "";

    return (
      <div className="row" key={`filter-div`}>
        <div className="col-sm-4">
          <form onSubmit={(e) => this.onFilterSubmit(e)} onReset={(e) => this.onFilterReset(e)}>
            <div className="input-group">
              <input className="form-control" style={{fontSize: fixCss}} type="text" value={this.props.filter} onChange={(e) => this.props.onFilterChange(e)} placeholder="Text search within results"/>
              <button type="submit" onClick={() => this.filterClickTrack('filter')} className={`btn btn-outline-secondary ${!this.props.filter && "disabled"}`} style={{fontSize: fixCss}}>Filter</button>
              <button type="reset" onClick={() => this.filterClickTrack('clear')} className={`btn btn-outline-secondary ${!this.props.filter && "disabled"}`} style={{fontSize: fixCss}}>Clear</button>
            </div>
          </form>
        </div>
        <div className="col-sm-4">
          <select className="form-select" style={{fontSize: fixCss}} value={this.props.sortingOrder} onChange={this.props.onSort}>
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
        <div className="col-sm-4">
          <button className="btn btn-outline-secondary mr-1" style={{fontSize: fixCss}} onClick={this.props.onToggleAlignmentsCollapsed}>{this.props.alignmentsCollapsed ? 'See alignments' : 'Hide alignments'}</button>
          <button className="btn btn-outline-secondary mr-1" style={{fontSize: fixCss}} onClick={this.props.onToggleDetailsCollapsed}>{this.props.detailsCollapsed ? 'See details' : 'Hide details'}</button>
          <button className="btn btn-outline-secondary" style={{fontSize: fixCss}} onClick={() => this.onDownload()} disabled={this.props.downloadStatus === "error" ? "disabled" : ""}>Download</button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    alignmentsCollapsed: state.alignmentsCollapsed,
    detailsCollapsed: state.detailsCollapsed,
    filter: state.filter,
    jobId: state.jobId,
    sequence: state.sequence,
    downloadStatus: state.downloadStatus,
    downloadEntries: state.downloadEntries,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed: () => dispatch({ type: 'TOGGLE_ALIGNMENTS_COLLAPSED' }),
    onToggleDetailsCollapsed: () => dispatch({ type: 'TOGGLE_DETAILS_COLLAPSED' }),
    onSort: (event) => dispatch(actionCreators.onSort(event)),
    onFilterChange: (event) => dispatch(actionCreators.onFilterChange(event)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filter);