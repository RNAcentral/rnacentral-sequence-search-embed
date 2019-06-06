import ebiGlobal from 'ebi-framework/css/ebi-global.css';
import componentStyles from 'containers/SequenceSearch/index.scss';
import fonts from 'EBI-Icon-fonts/fonts.css';

import React from 'react';
import {connect} from 'react-redux';

import Facets from 'containers/SequenceSearch/components/Results/components/Facets.jsx';
import Hit from 'containers/SequenceSearch/components/Results/components/Hit.jsx';

import 'containers/SequenceSearch/components/Results/index.scss';
import routes from 'services/routes.jsx';
import * as actionCreators from 'actions/actions';


class Results extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={ebiGlobal.row}>
        {
          this.props.status === "partial_success" && (
            <div className={`${ebiGlobal.callout} ${ebiGlobal.alert}`}>
              <h3>Search against some databases failed.</h3>
              <p>Search results might be incomplete, you might want to retry running the search.</p>
            </div>
          )
        }
        {
          this.props.status === "does_not_exist" && (
            <div className={`${ebiGlobal.callout} ${ebiGlobal.alert}`}>
              <h3>Job with id='{ this.props.jobId }' does not exist.</h3>
            </div>
          )
        }
        {
          this.props.status === "error" && (
            <div className={`${ebiGlobal.callout} ${ebiGlobal.alert}`}>
              <h3>Server got itself into a trouble.</h3>
              <a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.
            </div>
          )
        }
        {
          (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <h1 key={`results-header`} className={`${ebiGlobal['margin-top-large']} ${ebiGlobal['margin-bottom-large']}`}>Results: { this.props.status === "loading" ? <i className={`${fonts['icon']} ${fonts['icon-functional']} ${componentStyles.spin}`} data-icon="s"/> : <small>{ this.props.hitCount } total</small> }</h1>,
            <div key={`results-div`} className={`${ebiGlobal['small-12']} ${ebiGlobal['medium-10']} ${ebiGlobal['medium-push-2']} ${ebiGlobal['columns']}`}>
              <section>
                { this.props.entries.map((entry, index) => (
                <ul key={`${entry}_${index}`}><Hit entry={entry} alignmentsCollapsed={this.props.alignmentsCollapsed} onToggleAlignmentsCollapsed={ this.onToggleAlignmentsCollapsed } /></ul>
                )) }
                {(this.props.status === "success" || this.props.status === "partial_success") && (this.props.entries.length < this.props.hitCount) && (<a className={`${ebiGlobal.button} ${ebiGlobal.small}`} onClick={this.props.onLoadMore} target="_blank">Load more</a>)}
              </section>
            </div>,
            <Facets key={`results-facets`} facets={ this.props.facets } selectedFacets={ this.props.selectedFacets } toggleFacet={ this.toggleFacet } ordering={ this.props.ordering } textSearchError={ this.props.textSearchError } />
          ]
        }
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
    textSearchError: state.textSearchError,
    jobId: state.jobId
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed : () => dispatch({ type: 'TOGGLE_ALIGNMENTS_COLLAPSED' }),
    onLoadMore : (event) => dispatch(actionCreators.onLoadMore(event))
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
