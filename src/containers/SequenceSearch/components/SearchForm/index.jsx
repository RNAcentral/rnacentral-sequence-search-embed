import React from 'react';
import {connect} from 'react-redux';

import * as actions from "../../../../actions/actions";
import {store} from "app.jsx";


class SearchForm extends React.Component {
  showDatabase(){
    const databases = this.props.databases;
    if (databases.length > 1) {
      return (
          <div>
            <h1>Search an RNA sequence in&nbsp;
              {
                databases.map(function(item, index) {
                  return <span key={`${index}`}>{ (index ? ', ' : '') + item }</span>;
                })
              }
            </h1>
          </div>
      )
    } else if (databases.length === 0) {
      return <h1>Search an RNA sequence in RNA databases</h1>
    } else {
      return <h1>Search an RNA sequence in {databases}</h1>
    }
  }

  showExamples(){
    const examples = this.props.examples;
    return examples.map(example =>
      <div key={example.urs} style={{marginLeft: '10px'}}>
        <label>
          - <a onClick={() => this.props.onExampleSequence(example.sequence)}>{example.description}</a>
          <small> ({example.urs})</small>
        </label>
      </div>)
  }

  render() {
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
                    <div>Examples:</div>
                    {this.showExamples()}
                    <textarea id="sequence" name="sequence" rows="7" value={this.props.sequence} onChange={(e) => this.props.onSequenceTextareaChange(e)} />
                    <p>
                      Or upload a file (with ".fasta" extension):
                      <input id="sequence-file" name="sequence-file" type="file" accept=".fasta" onChange={this.props.onFileUpload} />
                    </p>
                  </fieldset>
                </div>
                { this.props.submissionError && <div className="callout alert">
                  <h3>Form submission failed</h3>
                  { this.props.submissionError }
                </div>}
                <div>
                  <fieldset>
                    <div id="jd_submitButtonPanel">
                      <input name="submit" type="submit" value="Submit" className="button" />{' '}
                      <input name="clear" type="submit" value="Clear sequence" className="button" style={{background: '#6c757d'}} onClick={ this.props.onClearSequence } />
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

  onSubmit(event) {
    event.preventDefault();

    const state = store.getState();
    if (state.sequence) {
      store.dispatch(actions.onSubmit(state.sequence, this.props.databases));
    }
  }
}

const mapStateToProps = (state) => ({
  status: state.status,
  sequence: state.sequence,
  entries: state.entries,
  facets: state.facets,
  hitCount: state.hitCount,
  ordering: state.ordering,
  textSearchError: state.textSearchError
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
