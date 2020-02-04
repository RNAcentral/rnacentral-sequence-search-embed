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

  onSubmit(event) {
    event.preventDefault();
    const state = store.getState();

    // split the sequence only for batch queries
    if (state.fileUpload && state.sequence) {
      let getSequence = state.sequence.split(/(?=>)/g);
      store.dispatch(actions.onMultipleSubmit(getSequence, this.props.databases));
    } else if (state.sequence && state.sequence.match("^([0-9a-fA-F]{8})-(([0-9a-fA-F]{4}\\-){3})([0-9a-fA-F]{12})$")) {
      store.dispatch(actions.updateJobId(state.sequence));
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
            <small>Powered by <a style={{marginRight: "7px"}} target='_blank' href='https://rnacentral.org/'>RNAcentral</a>|</small>
            <small style={{marginLeft: "7px"}}>Local alignment using <a target='_blank' href='https://www.ncbi.nlm.nih.gov/pubmed/23842809'>nhmmer</a></small>
          </div>
        </div>
        <div className="row">
          <form onSubmit={(e) => this.onSubmit(e)}>
            <div className="small-10 columns">
              <textarea id="sequence" name="sequence" rows="7" value={this.props.sequence} onChange={(e) => this.props.onSequenceTextareaChange(e)} placeholder="Enter RNA/DNA sequence (with an optional description in FASTA format) or job ID" />
            </div>
            <div className="small-2 columns">
              <div className="row">
                <input id="submit-button" style={{background: searchButtonColor}} name="submit" type="submit" value="Search" className="button" />
              </div>
              <div className="row">
                <input id="clear-button" style={{background: clearButtonColor}} name="clear" type="submit" value="Clear" className="button" onClick={ this.props.onClearSequence } />
              </div>
              <div className="row">
                <label htmlFor="file-upload" className="custom-file-upload" style={{background: uploadButtonColor}}>Upload file</label>
                <input id="file-upload" type="file" accept=".fasta" onChange={this.props.onFileUpload} />
              </div>
            </div>
            <div className="small-12 columns" style={{marginTop: "-10px", marginBottom: "10px"}}>
              {this.props.examples ? <div id="examples"><ul>Examples: {this.showExamples()}</ul></div> : ""}
            </div>
            {
              this.props.submissionError && <div className="small-12 columns callout alert">
              <h3>Form submission failed</h3>
              { this.props.submissionError }
              </div>
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
  entries: state.entries,
  facets: state.facets,
  hitCount: state.hitCount,
  ordering: state.ordering,
  textSearchError: state.textSearchError,
  infernalEntries: state.infernalEntries,
  fileUpload: state.fileUpload,
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
