import React from 'react';
import {connect} from 'react-redux';

import * as actions from "../../../../actions/actions";
import {store} from "app.jsx";


class SearchForm extends React.Component {
  showExamples(){
    const examples = this.props.examples;
    return examples.map(example =>
      <li key={example.description}>
        <a onClick={() => this.props.onExampleSequence(example.sequence)}>{example.description}</a>
        <small>{!!(example.urs) ? ` (${example.urs})` : " "}</small>
      </li>)
  }

  showExactMatch(){
    const exactMatch = this.props.exactMatch;

    if (exactMatch && exactMatch.hitCount > 0) {
      const exactMatchDescription = exactMatch.entries[0].fields.description[0];
      const exactMatchId = exactMatch.entries[0].id;
      const exactMatchUrsId = exactMatchId.split('_')[0];
      const exactMatchOther = exactMatch.hitCount > 1 ? (exactMatch.hitCount - 1) + ' other sequences' : '';

      return <div className="small-12 columns">
        <div className="callout success">
          <i className="icon icon-functional" data-icon="/" style={{fontSize: "80%", color: "#3c763d"}}> </i> Identical match on <img src={'https://rnacentral.org/static/img/logo/rnacentral-logo.png'} alt="RNAcentral logo" style={{width: "2%"}}/>: <a href={`https://rnacentral.org/rna/${exactMatchId}`} target='_blank'>{exactMatchDescription}</a>
          {exactMatchOther && ' and'}
          {exactMatchOther ? <a href={`https://rnacentral.org/search?q=${exactMatchUrsId}*`} target='_blank'> {exactMatchOther}</a> : ''}
        </div>
      </div>
    }
  }

  onSubmit(event) {
    event.preventDefault();
    const state = store.getState();

    // split the sequence for batch queries and set a limit on the number of queries
    if (state.fileUpload && state.sequence) {
      let getSequence = state.sequence.split(/(?=>)/g).slice(0, 30);
      store.dispatch(actions.onMultipleSubmit(getSequence, this.props.databases));
    } else if (state.sequence && state.sequence.match("^([0-9a-fA-F]{8})-(([0-9a-fA-F]{4}\\-){3})([0-9a-fA-F]{12})$")) {
      store.dispatch(actions.updateJobId(state.sequence));
    } else if (state.sequence && (state.sequence.length < 10 || state.sequence.length > 7000)) {
      store.dispatch(actions.invalidSequence());
    } else if (state.sequence) {
      store.dispatch(actions.onSubmit(state.sequence, this.props.databases));
    }

    state.sequence = "";
  }

  render() {
    const searchButtonColor = this.props.customStyle && this.props.customStyle.searchButtonColor ? this.props.customStyle.searchButtonColor : "";
    const clearButtonColor = this.props.customStyle && this.props.customStyle.clearButtonColor ? this.props.customStyle.clearButtonColor : "#6c757d";
    const uploadButtonColor = this.props.customStyle && this.props.customStyle.uploadButtonColor ? this.props.customStyle.uploadButtonColor : "";
    return (
      <div>
        <div className="row">
          <div className="small-12 columns">
            <small><img src={'https://rnacentral.org/static/img/logo/rnacentral-logo.png'} alt="RNAcentral logo" style={{width: "1%", verticalAlign: "text-top"}}/> Powered by <a style={{marginRight: "7px"}} target='_blank' href='https://rnacentral.org/'>RNAcentral</a>|</small>
            <small style={{marginLeft: "7px"}}>Local alignment using <a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/23842809'>nhmmer</a></small>
          </div>
        </div>
        <div className="row">
          <form onSubmit={(e) => this.onSubmit(e)}>
            <div className="small-9 columns">
              <textarea id="sequence" name="sequence" rows="7" value={this.props.sequence} onChange={(e) => this.props.onSequenceTextareaChange(e)} placeholder="Enter RNA/DNA sequence (with an optional description in FASTA format) or job ID" />
            </div>
            <div className="small-3 columns">
              <div className="row">
                <input id="submit-button" style={{background: searchButtonColor}} name="submit" type="submit" value="Search" className="button" />
              </div>
              <div className="row">
                <input id="clear-button" style={{background: clearButtonColor}} name="clear" type="submit" value="Clear" className="button" onClick={ this.props.onClearSequence } />
              </div>
              <div className="row">
                <label htmlFor="file-upload" className="custom-file-upload" style={{background: uploadButtonColor}}>Upload file</label>
                <input id="file-upload" type="file" accept=".fasta" onClick={ this.props.onClearSequence } onChange={this.props.onFileUpload} />
              </div>
              <div className="row"><small>Up to 30 queries</small></div>
            </div>
            <div className="small-12 columns" style={{marginTop: "-10px", marginBottom: "10px"}}>
              {this.props.examples ? <div id="examples"><ul>Examples: {this.showExamples()}</ul></div> : ""}
            </div>
            {
              this.props.submissionError && (
                <div className="small-12 columns">
                  <div className="callout alert">
                    <h3>Form submission failed</h3>
                    { this.props.submissionError }
                  </div>
                </div>
              )
            }
            {
              this.props.status === "invalidSequence" && (
                <div className="small-12 columns">
                  <div className="callout warning">
                    {this.props.sequence.length < 10 ? <p>The sequence cannot be shorter than 10 nucleotides</p> : <p>The sequence cannot be longer than 7000 nucleotides</p>}
                  </div>
                </div>
              )
            }
            {
              this.showExactMatch()
            }
          </form>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  status: state.status,
  infernalStatus: state.infernalStatus,
  sequence: state.sequence,
  hits: state.hits,
  entries: state.entries,
  facets: state.facets,
  hitCount: state.hitCount,
  ordering: state.ordering,
  textSearchError: state.textSearchError,
  infernalEntries: state.infernalEntries,
  fileUpload: state.fileUpload,
  exactMatch: state.exactMatch,
});

const mapDispatchToProps = (dispatch) => ({
  onSequenceTextareaChange: (event) => dispatch(actions.onSequenceTextAreaChange(event)),
  onExampleSequence: (sequence) => dispatch(actions.onExampleSequence(sequence)),
  onClearSequence: () => dispatch(actions.onClearSequence()),
  onFileUpload: (event) => dispatch(actions.onFileUpload(event))
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchForm);
