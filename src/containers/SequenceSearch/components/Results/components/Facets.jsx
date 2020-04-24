import React from 'react';
import {connect} from "react-redux";

import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";

import { AiOutlineReload } from 'react-icons/ai';


class Facets extends React.Component {
  constructor(props) {
    super(props);

    this.renderFacet = this.renderFacet.bind(this);
  }

  onReload() {
    const state = store.getState();
    if (state.sequence) {
      store.dispatch(actionCreators.onClearResult());
      store.dispatch(actionCreators.onSubmit(state.sequence, this.props.databases));
    }
  }

  renameFacet(facet){
    if (facet==='QC warning found') {
      return 'QC warnings'
    } else if (facet==='Has GO annotation') {
      return 'GO annotations'
    } else if (facet==='Has Conserved structure') {
      return 'Conserved motifs'
    } else {
      return facet
    }
  }

  renameFacetValue(facet, facetValue){
    const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";
    if (facet==='qc_warning_found'){
      if (facetValue.label==='False') {facetValue.label = 'No warnings'}
      else if (facetValue.label==='True') {facetValue.label = 'Warnings found'}
    }
    if (facet==='has_go_annotations') {
      if (facetValue.label==='True') { facetValue.label = 'Found'; }
      else if (facetValue.label==='False') { facetValue.label = 'Not found'; }
    }
    if (facet==='has_conserved_structure') {
      if (facetValue.label === 'True') { facetValue.label = 'Found'; }
      else if (facetValue.label === 'False') { facetValue.label = 'Not found'; }
    }
    return <a className="custom-link" style={{color: linkColor}}>{facetValue.label}&nbsp;<small>({facetValue.count})</small></a>
  }

  renderFacet(facet) {
    let facetStyle = {
      color: this.props.customStyle && this.props.customStyle.facetColor ? this.props.customStyle.facetColor : "#007c82",
      fontSize: this.props.customStyle && this.props.customStyle.facetSize ? this.props.customStyle.facetSize : "20px",
    };
    return [
      <legend key={`legend-${facet.id}`}><span style={facetStyle}>{ this.renameFacet(facet.label) }</span></legend>,
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
                <label className="form-check-label mt-1" htmlFor={`checkbox-${facet.id}-${facetValue.value}`}>
                  { this.renameFacetValue(facet.id, facetValue) }
                </label>
              </div>
            </li>
          ))
        }
      </ul>
    ];
  }

  render() {
    let showFacet = this.props.hideFacet ? this.props.facets.filter(facet => !this.props.hideFacet.includes(facet.id)) : this.props.facets;
    const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";

    return (
      <div className="row">
        <section>
          <div>
            { showFacet.map(facet => this.renderFacet(facet)) }
          </div>
          {
            this.props.textSearchError &&
            <div className="alert alert-danger">
              <p>Failed to retrieve text search data.</p>
              <p><a className="custom-link" onClick={ () => this.onReload() }><AiOutlineReload style={{verticalAlign: '-1px'}} /> Reload</a></p>
            </div>
          }
          <small>
            Powered by <a className="custom-link" style={{color: linkColor}} href="http://www.ebi.ac.uk/ebisearch/" target="_blank">EBI Search</a>.
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
