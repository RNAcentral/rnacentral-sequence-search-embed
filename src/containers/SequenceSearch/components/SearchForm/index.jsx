import React from 'react';
import {connect} from 'react-redux';

import * as actions from "../../../../actions/actions";
import {store} from "app.jsx";


class SearchForm extends React.Component {
  showDatabase(){
    const databases = this.props.databases;
    const h1Style = {
      color: this.props.customStyle && this.props.customStyle.h1Color ? this.props.customStyle.h1Color : "",
      fontSize: this.props.customStyle && this.props.customStyle.h1Size ? this.props.customStyle.h1Size : "",
    };
    if (databases.length > 1) {
      return (
          <div>
            <h1 style={h1Style}>Search in&nbsp;
              {
                databases.map(function(item, index) {
                  return <span key={`${index}`}>{ (index ? ', ' : '') + item }</span>;
                })
              }
            </h1>
          </div>
      )
    } else if (databases.length === 0) {
      return <h1 style={h1Style}>Search in RNAcentral</h1>
    } else {
      return <h1 style={h1Style}>Search in {databases}</h1>
    }
  }

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
    } else if (state.sequence) {
      store.dispatch(actions.onSubmit(state.sequence, this.props.databases));
    }

    state.sequence = "";
  }

  render() {
    const submitButtonColor = this.props.customStyle && this.props.customStyle.submitButtonColor ? this.props.customStyle.submitButtonColor : "";
    const clearButtonColor = this.props.customStyle && this.props.customStyle.clearButtonColor ? this.props.customStyle.clearButtonColor : "#6c757d";
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="hpanel">
            <div className="panel-heading">
              {this.showDatabase()}
            </div>
            <div className="panel-body">
              <form onSubmit={(e) => this.onSubmit(e)}>
                <div>
                  <fieldset>
                    {this.props.examples ? <div id="examples"><span>Examples:</span><ul>{this.showExamples()}</ul></div> : ""}
                    <textarea id="sequence" name="sequence" rows="7" value={this.props.sequence} onChange={(e) => this.props.onSequenceTextareaChange(e)} />
                    <div id="upload-file">
                      <span>Or upload a file (with ".fasta" extension):</span>
                      <input id="sequence-file" name="sequence-file" type="file" accept=".fasta" onChange={this.props.onFileUpload} />
                    </div>
                  </fieldset>
                </div>
                { this.props.submissionError && <div className="callout alert">
                  <h3>Form submission failed</h3>
                  { this.props.submissionError }
                </div>}
                <div>
                  <fieldset>
                    <div>
                      <input id="submit-button" style={{background: submitButtonColor}} name="submit" type="submit" value="Submit" className="button" />{' '}
                      <input id="clear-button" style={{background: clearButtonColor}} name="clear" type="submit" value="Clear sequence" className="button" onClick={ this.props.onClearSequence } />{' '}
                      <div id="powered-by">Powered by <a target='_blank' href='https://rnacentral.org/'>RNAcentral</a></div>
                    </div>
                  </fieldset>
                </div>
              </form>
            </div>
          </div>
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
