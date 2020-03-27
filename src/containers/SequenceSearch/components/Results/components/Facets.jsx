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
      fontSize: this.props.customStyle && this.props.customStyle.facetSize ? this.props.customStyle.facetSize : "1.25rem",
    };
    return [
      <legend key={`legend-${facet.id}`}><span style={facetStyle}>{ facet.label }</span></legend>,
      <ul key={facet.id} className="list-unstyled facet">
        {
          facet.facetValues.map(facetValue => (
            <li className="facetValue" key={`li ${facetValue.label}`}>
              <div className="form-check">
                <input className="form-check-input" id={`checkbox-${facet.id}-${facetValue.value}`} type="checkbox"
                  defaultChecked={this.props.selectedFacets.hasOwnProperty(facet.id) && this.props.selectedFacets[facet.id].indexOf(facetValue.value) !== -1}
                  onClick={(e) => {
                    this.props.onToggleFacet(e, facet, facetValue)
                  }}/>
                <label className="form-check-label mt-1" htmlFor={`checkbox-${facet.id}-${facetValue.value}`}>{facetValue.label}&nbsp;<small>({facetValue.count})</small></label>
              </div>
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
      <div className="row">
        <section>
          <div>
            { showFacet.map(facet => this.renderFacet(facet)) }
          </div>
          {
            this.props.textSearchError &&
            <div className="alert alert-danger">
              <h3>Failed to retrieve text search data.</h3>
              <a onClick={ this.props.onReload }>&lsaquo; Reload</a>
            </div>
          }
          <small>
            Powered by <a className="text-dark custom-link" href="http://www.ebi.ac.uk/ebisearch/" target="_blank">EBI Search</a>.
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
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Facets);
