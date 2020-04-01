import React, {Component} from 'react';
import {store} from "app.jsx";
import * as actionCreators from 'actions/actions';
import {connect} from "react-redux";

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

  render() {
    return (
      <div className="row" key={`filter-div`}>
        <div className="col-sm-4">
          <form onSubmit={(e) => this.onFilterSubmit(e)} onReset={(e) => this.onFilterReset(e)}>
            <div className="input-group">
              <input className="form-control" type="text" value={this.props.filter} onChange={(e) => this.props.onFilterChange(e)} placeholder="Search within results"/>
              <button type="submit" className={`btn btn-outline-secondary ${!this.props.filter && "disabled"}`}>Filter</button>
              <button type="reset" className={`btn btn-outline-secondary ${!this.props.filter && "disabled"}`}>Clear</button>
            </div>
          </form>
        </div>
        <div className="col-sm-4">
          <select className="form-select" value={this.props.sortingOrder} onChange={this.props.onSort}>
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
          <div className="input-group">
            <button className="btn btn-outline-secondary" onClick={this.props.onToggleAlignmentsCollapsed}>{this.props.alignmentsCollapsed ? 'Show alignments' : 'Hide alignments'}</button>
            <button className="btn btn-outline-secondary" onClick={this.props.onToggleDetailsCollapsed}>{this.props.detailsCollapsed ? 'Show details' : 'Hide details'}</button>
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    alignmentsCollapsed: state.alignmentsCollapsed,
    detailsCollapsed: state.detailsCollapsed,
    filter: state.filter
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