import React from 'react';
import {connect} from 'react-redux';

import Facets from 'containers/SequenceSearch/components/Results/components/Facets.jsx';
import Hit from 'containers/SequenceSearch/components/Results/components/Hit.jsx';

import 'containers/SequenceSearch/components/Results/index.scss';
import routes from 'services/routes.jsx';


class Results extends React.Component {
  constructor(props) {
    super(props);
  }

  /**
   * Returns a promise of sequences search results, passed to text search and accompanied with facets.
   * See example of server response: https://www.ebi.ac.uk/ebisearch/swagger.ebi
   *
   * @param resultId - id of this sequence search
   * @param query - lucene query string, constructed from selectedFacets
   * @param start - index of element we start with, starting from 0
   * @param size - number of entries per page
   * @param ordering - how to order entries
   * @returns {Promise<any>}
   */
  fetchSearchResults(resultId, query, start, size, ordering) {
    let request = routes.facetsSearch(resultId, query, start, size, ordering);

    this.setState({ status: "loading" });

    return fetch(request)
      .then((response) => {
        if (response.ok) { return response.json(); }
        else { throw response; }
    });
  }

  /**
   * Depending on error status code, set different page statuses.
   * @param response
   */
  fetchSearchResultsExceptionHandler(response) {
    if (response.status === 404) {
      this.setState({ status: "does_not_exist", start: 0 });
    } else if (response.status === 500) {
      this.setState({ status: "error", start: 0 });
    }
  }


  /**
   * Builds text query for sending to text search backend from this.state.selectedFacets
   * @returns {string | *}
   */
  buildQuery() {
    let outputText, outputClauses = [];

    Object.keys(this.props.selectedFacets).map(facetId => {
      let facetText, facetClauses = [];
      this.props.selectedFacets[facetId].map(facetValueValue => facetClauses.push(`${facetId}:"${facetValueValue}"`));
      facetText = facetClauses.join(" OR ");

      if (facetText !== "") outputClauses.push("(" + facetText + ")");
    });

    outputText = outputClauses.join(" AND ");
    return outputText;
  }

  /**
   * Should be invoked, when user checks/unchecks a text search facet
   * @param facetId
   * @param facetValueValue - facetValue.value
   */
  toggleFacet(facetId, facetValueValue) {
    let selectedFacets = { ...this.state.selectedFacets };

    if (!this.state.selectedFacets.hasOwnProperty(facetId)) {  // all values in clicked facet are unchecked
      selectedFacets[facetId] = [facetValueValue];
    } else {
      let index = this.state.selectedFacets[facetId].indexOf(facetValueValue);
      if (index === -1) { selectedFacets[facetId].push(facetValueValue); }  // this value is not checked, check it
      else { selectedFacets[facetId].splice(index, 1); }  // this value is checked, uncheck it
    }

    // start loading from the first page again
    let query = this.buildQuery();
    this.load(this.props.resultId, query, 0, 20, this.state.ordering, true, false);
  }

  /**
   * Wrapper around fetchSearchResults, that is used to request any new data
   * from the server and modify the state accordingly.
   *
   * @param resultId {string} - uuid id of a job
   * @param query {string} - Lucene query string, result of buildQuery()
   * @param start {number} - index of the first element to request (starts with 0)
   * @param size {number} - number of entries per page
   * @param ordering {string} - how to order entries
   * @param reloadEntries {boolean} - if we should load entries from scratch or append
   * @param clearFacets {boolean} - if we should clear facets
   */
  load(resultId, query, start, size, ordering, reloadEntries, clearFacets) {
    if (clearFacets) {
      this.setState({ facets: [], selectedFacets: {} }, () => {
        if (reloadEntries) {
          this.fetchSearchResults(this.props.resultId, this.buildQuery(), 0, this.state.size, ordering)
            .then(data => {
              let selectedFacets = {};
              data.facets.map((facet) => { selectedFacets[facet.id] = []; });

              this.setState({
                status: data.sequenceSearchStatus === "success" ? "success" : "partial_success",
                sequence: data.sequence,
                entries: [...data.entries],
                facets: [...data.facets],
                hitCount: data.hitCount,
                start: start,
                size: size,
                ordering: ordering,
                selectedFacets: selectedFacets,
                textSearchError: data.textSearchError
              });
            })
            .catch(this.fetchSearchResultsExceptionHandler);
        } else {
          this.fetchSearchResults(resultId, query, start, size, ordering)
            .then(data => {
              let selectedFacets = {};
              data.facets.map((facet) => { selectedFacets[facet.id] = []; });

              this.setState({
                status: data.sequenceSearchStatus === "success" ? "success" : "partial_success",
                sequence: data.sequence,
                entries: [...this.state.entries, ...data.entries],
                facets: [...data.facets],
                hitCount: data.hitCount,
                ordering: ordering,
                textSearchError: data.textSearchError,
                selectedFacets: selectedFacets
              })
            })
            .catch(this.fetchSearchResultsExceptionHandler);
        }
      });
    } else {
      if (reloadEntries) {
        this.fetchSearchResults(this.props.resultId, this.buildQuery(), 0, this.state.size, ordering)
          .then(data => {
            this.setState({
              status: data.sequenceSearchStatus === "success" ? "success" : "partial_success",
              sequence: data.sequence,
              entries: [...data.entries],
              facets: [...data.facets],
              hitCount: data.hitCount,
              start: 0,
              size: size,
              ordering: ordering,
              textSearchError: data.textSearchError,
            });
          })
          .catch(this.fetchSearchResultsExceptionHandler);
      } else {
        this.fetchSearchResults(resultId, query, start, size, ordering)
          .then(data => { this.setState({
            status: data.sequenceSearchStatus === "success" ? "success" : "partial_success",
            sequence: data.sequence,
            entries: [...this.state.entries, ...data.entries],
            facets: [...data.facets],
            hitCount: data.hitCount,
            ordering: ordering,
            textSearchError: data.textSearchError
          });
        })
        .catch(this.fetchSearchResultsExceptionHandler);
      }
    }
  }

  componentDidMount() {
    // TODO: use a constant for status
    if (this.props.status === 'submitted') {
      this.props.fetchRNAcentralDatabases();
      //     this.load(this.props.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
    }
    // TODO: re-enable scroll
  }

  render() {
    return (
      <div className="row">
        {
          this.props.status === "partial_success" && (
            <div className="callout alert">
              <h3>Search against some databases failed.</h3>
              <p>Search results might be incomplete, you might want to retry running the search.</p>
            </div>
          )
        }
        {
          this.props.status === "does_not_exist" && (
            <div className="callout alert">
              <h3>Job with id='{ this.props.resultId }' does not exist.</h3>
            </div>
          )
        }
        {
          this.props.status === "error" && (
            <div className="callout alert">
              <h3>Server got itself into a trouble.</h3>
              <a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.
            </div>
          )
        }
        {
          (this.props.status === "loading" || this.props.status === "success" || this.props.status === "partial_success") && [
            <h1 key={`results-header`} className="margin-top-large margin-bottom-large">Results: { this.props.status === "loading" ? <i className="icon icon-functional spin" data-icon="s"/> : <small>{ this.props.hitCount } total</small> }</h1>,
            <div key={`results-div`} className="small-12 medium-10 medium-push-2 columns">
              <section>
                { this.props.entries.map((entry, index) => (
                <ul key={`${entry}_${index}`}><Hit entry={entry} alignmentsCollapsed={this.props.alignmentsCollapsed} onToggleAlignmentsCollapsed={ this.onToggleAlignmentsCollapsed } /></ul>
                )) }
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
    textSearchError: state.textSearchError
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed : () => dispatch({ type: 'TOGGLE_ALIGNMENTS_COLLAPSED' }),
    onScroll : () => dispatch({ type: 'SCROLL_RESULTS' })
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results);
