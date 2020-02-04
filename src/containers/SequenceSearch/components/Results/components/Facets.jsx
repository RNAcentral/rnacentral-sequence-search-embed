import React from 'react';
import {connect} from "react-redux";

import * as actionCreators from 'actions/actions';


class Facets extends React.Component {
  constructor(props) {
    super(props);

    this.renderFacet = this.renderFacet.bind(this);
  }

  renderFacet(facet) {
    let facetStyle = {
      color: this.props.customStyle && this.props.customStyle.facetColor ? this.props.customStyle.facetColor : "#007c82",
      fontSize: this.props.customStyle && this.props.customStyle.facetSize ? this.props.customStyle.facetSize : "",
    };
    return [
      <legend key={`legend-${facet.id}`}><h5 style={facetStyle}>{ facet.label }</h5></legend>,
      <ul key={facet.id} className="vertical menu facet">
        {
          facet.facetValues.map(facetValue => (
            <li key={`li ${facetValue.label}`}>
              <span className="facetValue">
                <input id={`checkbox-${facet.id}-${facetValue.value}`} type="checkbox"
                  checked={this.props.selectedFacets.hasOwnProperty(facet.id) && this.props.selectedFacets[facet.id].indexOf(facetValue.value) !== -1}
                  onChange={(e) => {
                    e.preventDefault();
                    this.props.onToggleFacet(e, facet, facetValue)
                  }}/>
                <label htmlFor={`checkbox-${facet.id}-${facetValue.value}`}>{facetValue.label}&nbsp;<small>({facetValue.count})</small></label>
              </span>
            </li>
          ))
        }
        <br/>
      </ul>
    ];
  }

  render() {
    let showFacet = this.props.hideFacet ? this.props.facets.filter(facet => !this.props.hideFacet.includes(facet.id)) : this.props.facets;

    return (
      <div>
        <label>Sort by:
          <select value={this.props.sortingOrder} onChange={this.props.onSort}>
            <option value="e_value">E-value (min to max) - default</option>
            <option value="-e_value">E-value (max to min)</option>
            <option value="identity">Identity (max to min)</option>
            <option value="-identity">Identity: (min to max)</option>
            <option value="query_coverage">Query coverage: (max to min)</option>
            <option value="-query_coverage">Query coverage: (min to max)</option>
            <option value="target_coverage">Target coverage: (max to min)</option>
            <option value="-target_coverage">Target coverage: (min to max)</option>
          </select>
        </label>
        <section>
          <div>
            { showFacet.map(facet => this.renderFacet(facet)) }
          </div>
          {
            this.props.textSearchError &&
            <div className="callout alert">
              <h3>Failed to retrieve text search data.</h3>
              <a onClick={ this.props.onReload }>&lsaquo; Reload</a>
            </div>
          }
          <small>
            Powered by <a href="http://www.ebi.ac.uk/ebisearch/" target="_blank">EBI Search</a>.
          </small>
        </section>
      </div>
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
    onToggleFacet: (event, facet, facetValue) => dispatch(actionCreators.onToggleFacet(event, facet, facetValue)),
    onReload: () => dispatch(actionCreators.onReload()),
    onSort: (event) => dispatch(actionCreators.onSort(event))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Facets);
