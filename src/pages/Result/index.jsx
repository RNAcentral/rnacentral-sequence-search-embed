import React from 'react';

import Facets from 'pages/Result/components/Facets.jsx';
import Hit from 'pages/Result/components/Hit.jsx';

import 'pages/Result/index.scss';
import routes from 'services/routes.jsx';


class Result extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: "loading",
      sequence: "",
      entries: [],
      facets: [],
      hitCount: 0,
      start: 0,
      size: 20,
      ordering: "e_value",
      selectedFacets: {},  // e.g. { facetId1: [facetValue1.value, facetValue2.value], facetId2: [facetValue3.value] }
      alignmentsCollapsed: true,
      textSearchError: false
    };

    this.onToggleAlignmentsCollapsed = this.onToggleAlignmentsCollapsed.bind(this);
    this.load = this.load.bind(this);
    this.onReload = this.onReload.bind(this);
    this.onSort = this.onSort.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.toggleFacet = this.toggleFacet.bind(this);
    this.fetchSearchResultsExceptionHandler = this.fetchSearchResultsExceptionHandler.bind(this);
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

    Object.keys(this.state.selectedFacets).map(facetId => {
      let facetText, facetClauses = [];
      this.state.selectedFacets[facetId].map(facetValueValue => facetClauses.push(`${facetId}:"${facetValueValue}"`));
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
    this.load(this.props.match.params.resultId, query, 0, 20, this.state.ordering, true, false);
  }

  /**
   * Collapses/displays alignments in search results
   */
  onToggleAlignmentsCollapsed() {
    $('.alignment').toggleClass('alignment-collapsed');
    this.setState({ alignmentsCollapsed: !this.state.alignmentsCollapsed });
  }

  /**
   * Checks that the page was scrolled down to the bottom.
   * Load more entries, if available then.
   *
   * Mostly stolen from: https://alligator.io/react/react-infinite-scroll/
   * Cross-browser compatibility: https://codingrepo.com/javascript/2015/10/10/javascript-infinite-scroll-with-cross-browser/
   */
  onScroll() {
    let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
    let scrollPosition = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;

    // Checks that the page has scrolled to the bottom
    if (windowHeight + scrollPosition + 10 >= document.documentElement.offsetHeight) {
      if (this.state.status === "success" && this.state.entries.length < this.state.hitCount) {
        this.setState(
          (state, props) => (state.start === this.state.start ? { start: this.state.start + this.state.size, status: "loading" } : { status: "loading" }),
          () => {
            let query = this.buildQuery();
            this.load(this.props.match.params.resultId, query, this.state.start, this.state.size, this.state.ordering, false, false);
          }
        );
      }
    }
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
          this.fetchSearchResults(this.props.match.params.resultId, this.buildQuery(), 0, this.state.size, ordering)
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
        this.fetchSearchResults(this.props.match.params.resultId, this.buildQuery(), 0, this.state.size, ordering)
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

  /**
   * Is called when user tries to reload the facets data after an error.
   */
  onReload() {
    this.load(this.props.match.params.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
  }

  /**
   * Is called when user selects a different sorting order.
   */
  onSort(event) {
    let ordering = event.target.value;
    this.setState({ ordering: ordering }, () => {
      this.load(this.props.match.params.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);
    });
  }

  componentDidMount() {
    this.load(this.props.match.params.resultId, this.buildQuery(), 0, this.state.size, this.state.ordering, true, true);

    // When user scrolls down to the bottom of the component, load more entries, if available.
    window.onscroll = this.onScroll;
  }

  render() {
    return (
      <div className="row">
        {
          this.state.status === "partial_success" && (
            <div className="callout alert">
              <h3>Search against some databases failed.</h3>
              <p>Search results might be incomplete, you might want to retry running the search.</p>
            </div>
          )
        }
        { (this.state.status === "success" || this.state.status === "partial_success" ) &&
          [
            <h1 key={`success-header`}>Sequence:</h1>,
            <pre key={`success-pre`} className="callout sequence">
              { this.state.sequence }
            </pre>
          ]
        }
        {
          this.state.status === "does_not_exist" && (
            <div className="callout alert">
              <h3>Job with id='{ this.props.match.params.resultId }' does not exist.</h3>
            </div>
          )
        }
        {
          this.state.status === "error" && (
            <div className="callout alert">
              <h3>Server got itself into a trouble.</h3>
              <a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.
            </div>
          )
        }
        {
          (this.state.status === "loading" || this.state.status === "success" || this.state.status === "partial_success") && [
            <h1 key={`results-header`} className="margin-top-large margin-bottom-large">Results: { this.state.status === "loading" ? <i className="icon icon-functional spin" data-icon="s"/> : <small>{ this.state.hitCount } total</small> }</h1>,
            <div key={`results-div`} className="small-12 medium-10 medium-push-2 columns">
              <section>
                { this.state.entries.map((entry, index) => (
                <ul key={`${entry}_${index}`}><Hit entry={entry} alignmentsCollapsed={this.state.alignmentsCollapsed} onToggleAlignmentsCollapsed={ this.onToggleAlignmentsCollapsed } /></ul>
                )) }
              </section>
            </div>,
            <Facets key={`results-facets`} facets={ this.state.facets } selectedFacets={ this.state.selectedFacets } toggleFacet={ this.toggleFacet } onReload={ this.onReload } ordering={ this.state.ordering } onSort={ this.onSort } textSearchError={ this.state.textSearchError } />
          ]
        }
      </div>
    )
  }
}

export default Result;
