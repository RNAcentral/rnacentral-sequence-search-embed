import React from 'react';
import {connect} from 'react-redux';

import routes from 'services/routes.jsx';

import 'containers/SequenceSearch/components/SearchForm/index.scss';
import * as actions from "../../../../actions/actions";
import {store} from "app.jsx";


class SearchForm extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="hpanel">
            <div className="panel-heading">
              <h1>Search an RNA sequence in RNA databases</h1>
            </div>
            <div className="panel-body">
              <form onSubmit={(e) => this.onSubmit(e)}>
                <div>
                  <fieldset>
                    <h4>RNA sequence:</h4>
                    <p>
                      <label>
                        Examples: <a onClick={ e => this.props.onExampleSequence("CUAUACAAUCUACUGUCUUUC") }>miRNA hsa-let-7a-1</a> <small>(URS000004F5D8)</small>, <a onClick={ e => this.props.onExampleSequence("UGCCUGGCGGCCGUAGCGCGGUGGUCCCACCUGACCCCAUGCCGAACUCAGAAGUGAAACGCCGUAGCGCCGAUGGUAGUGUGGGGUCUCCCCAUGCGAGAGUAGGGAACUGCCAGGCAU") }> 5S rRNA</a> <small>(URS0000049E57)</small>, <a onClick={ e => this.props.onExampleSequence("AGACCCGGCACCCGCGCAACGGAGGAGGGGCGCUGUGCCCUCUCCCCAACGGCGGUCAGCUUGGAACGCCUGCCCGGCGCACGCCCGGGGCCGGGGAGCCGAACUCGGUGCCAGCCGCACCCGGGCGGGUUGCUGGUGCGCCCUCCCCUCGCCCCCGUCCCUGGGGUCCUUGACCCAGGCUCUUGGGGCUAGCCUAUCUUCUGAGGAGCACAAGGUCCCUGGGGGCUCAGGGAAGAGAAAUUGGAGAAAGGGGGAGGAAGCCCCCAAGAUGGAUCACCCAUUGCCUGGUUUCGCAGGAGACUGUCCGCCUUCAGUUCUCCAGCAGCUCGGGGAUCAUGGCCCACUGAACCCCCAAGCGCUUUCACCCGAACCCAAGGAGGACGACCAGGAAAGACGGGAACUCGCGUAGACACGCCCGGAAGCCCUUGUCAUGUAAAUAGCUGUCGGGGACUGGUGUAUUGUCGCCGCCCCAGCCGGCGGGACCUGGGGCGAAUCCACACCCAUUGUCUGCUGCCCAAGGGGCCUCCGGCUGGGGGGCGCGGCUGCGGAGUUCAAAAGGGGUAUGAGCAGGAGGGGUGUACUUUUAGUUCAUUAAGUUUUAAUUACAGGAGUGCUACAAGAACACAUUCUUCAGGUUUAAAAAGAUAUUAAAAUAUUACAUAAGAGACCUCCCCUCCCUGGCCCACCUCCAGCCUCUUAAAAAUUUAGUGUGUCGCCUUUUAGACACUUUCUCAAAGCUUCACUUAUUUAACAGGCACUUAAGGAGCACCUACCUGUGCCAGAAACUCUCCAAAUAUUAACUCAACCUGACACCGACUCAGUGUGGCCGAAUAUUACUCUCCCCAUUUUACAGAGCGGGCAGCUGGUCAAGGAAGUCGCUUGUUGAAAGUCACACAGUGGUGGAGCCUGUGUGCCAACCCAGGACCCUGGGGAGCUGCCUCCCCCUCUCCCACGUAGUCCUGAUUCUUUAAGUGUCCACAUAUUCCUGUAAUGCCUGGAGUUUCAGUAAUUAGCAGGGACUUAGUGUGUUCAGAGAAAAAAAAAGCUUUUAAAAAUUAUUGUUACUGUGUUUGUAACAGUUUGGAUAGAGAAGGAAAAGCUGGAAUUUGGGAAGUGAAGGUGGCCUCGGGGUAGAACUUACCUAGACCAGAGCGAAUUCAUCCUGAAGAACUCAGAGAAAGCCGGUGCAGGAAGUGGGUUCCCGCUCUCCCUGCACAGGCACAGUGAUGCUGCCAGAGCUCUCCCAGAAAGACCAGGAGGCUUGUUCUGGAGAAGUCAAGCCCAGGGAUGUGGCUCAGGCUGGUCCAAGCUCUUUGGAGGAGUCCAAGCGUGCCCAGCCCAGAGGGAGGUUCAGAGGCACUGACCGUCUUCUGUUUGGGAGGAGAAGCUCACUCUUGGAGCCACAGCCAGCACUAGGUCAGGACCCAGGCCCCGGCCCAGGAGUGGGGCAAUACCCAGCGUCUACCCCAGAUGGCACCCUGCUGUGAACUGGGCGCCCUCAGCCCCUGCCUUGAGGAAGGGGCAAUACCACCAGCGUGUCUUUUAUCAGGGAAGAUAUUGCUGCAGUUUGGCCGCUGCAACUUAAGAGAAAAGCUAAGGGGUCCCCCAGCAUCCCUUGGGGUGCCACUGCAAAUACUGGCUGGGCCUGGAGAUGACCUGGGUCCCAUUCACUUCCUAGGGUGAAGGAGGUCAUCAUUACCACCCCUGCUUUCAGCCAUUUCUUCAUUCAUUCAAUCAACAAACUGGCUGAGCUGCAACCCUGAGCCGGGGAAUUCAGCCACUCCAGACACAGCCCCUGCCCUCCGGGAAGUCUCGGGAGACCUGGCUAGUCUGGCUGGGAGAAGUCACACGUUGAUUGUCUUGGAAGUGAGAUGGCAUUUACACAAUGGAGGCUGCACUGCCAGCAGGCAAAAAUAACCAGUUAAUUCAGUGGCUUAAAGAAACCAAACCUACCCACAACGCUUGACCUCCCAUUGAUCCAUCUGCGACACCGGCAGUGGCUACCAUUUAUUGAGUGCUGAUGGUGUCACCUGGGAUUGACUUAGUGGUCUCUGGCGCUAGUUCCGAAGUUGAUUCUGUCUGGAGAGCUUAAUGCAGUGUUCAGACCUCAGGGUCCGAACCUGAGGGUCACCCAAAGAUGAGUGGGACAUAGCUGUGUGACCUCGGCUGAGUGCUUUCACCUCUCCAACCUCAGUUUCCUCUUCUGCAAAAUGGGGUGGCUUCAUGGCACCUUCACGUGGUGUGAUUGCGAGGAAUGAAGGGAUCGAUGCCUUGCAAGUAGAGGAGAAGGGGCCGGAUACAUCUUAGUUGUUAUGUUAUUUAAUCAUCUUGGCAACCCCGGGAGGGAGGAACCACUAUCAUUUUAUUUUCCAUUUUGCAGUUGAGGACAAUGAUGAUUCCAGCACAGACAGGGCCCCUGACGGGGCAGUAGGAAAGGAGAAUUGCUUUGGAAGGAGCAUAGGCUGGACUGCCAGCACUCAUAGGAGGCUUCGUGUGUGCCCAGGACUGCGAGAAUUAAAUACAGGACACCCAGUUCAGUUUGAAUUUCAGAUAAACUAUGAAUAAUGAUUAGUGUAAGUAUAUCUCAAUUUAACUGGAAAAAAAAAAAAAAAAAA") }>NKILA lncRNA</a> <small>(URS00008120E1)</small> | <a id="clearSequence" onClick={ this.props.onClearSequence }>Clear sequence</a>
                      </label>
                    </p>
                    <textarea id="sequence" name="sequence" rows="7" value={this.props.sequence} onChange={(e) => this.props.onSequenceTextareaChange(e)} />
                    <p>
                      Or upload a file:
                      <input id="sequence-file" name="sequence-file" type="file" accept=".fasta" onChange={this.onFileUpload} />
                    </p>
                  </fieldset>
                </div>
                { this.props.submissionError && <div className="callout alert">
                  <h3>Form submission failed</h3>
                  { this.props.submissionError }
                </div>}
                <div>
                  <fieldset>
                    <h4><a onClick={ this.props.onToggleDatabasesCollapsed }><small>{ this.props.databasesCollapsed ? <i className="icon icon-functional" data-icon="9" /> : <i className="icon icon-functional" data-icon="8"/> } search against specific RNA databases</small></a></h4>
                    <div id="rnacentralDatabaseCollapsible" className="databases-collapsed">
                      <ul id="rnacentralDatabases" className="facets">
                        {this.props.rnacentralDatabases.map(database =>
                          <li key={database}><span className="facet"><input id={database} type="checkbox" checked={this.props.selectedDatabases[database]} onChange={(e) => this.props.onDatabaseCheckboxToggle(e)} /><label htmlFor={database}>{ this.props.rnacentralDatabaseLabels[database] }</label></span></li>
                        )}
                      </ul>
                      <p>
                        <label>
                          <a id="selectAllDatabases" onClick={ this.props.onSelectAllDatabases }>Select all</a> | <a id="deselectAllDatabases" onClick={ this.props.onDeselectAllDatabases }>Deselect all</a>
                        </label>
                      </p>
                    </div>
                  </fieldset>
                </div>
                <div>
                  <fieldset>
                    <div id="jd_submitButtonPanel">
                      <input name="submit" type="submit" value="Submit" className="button" />
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

  componentDidMount() {
    this.props.fetchRNAcentralDatabases();
  }

  onSubmit(event) {
    event.preventDefault();

    const state = store.getState();
    if (state.sequence) {
      store.dispatch(actions.onSubmit(state.sequence, state.selectedDatabases));
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
  textSearchError: state.textSearchError,
  rnacentralDatabases: state.rnacentralDatabases,
  rnacentralDatabaseLabels: state.rnacentralDatabaseLabels,
  selectedDatabases: state.selectedDatabases,
  databasesCollapsed: state.databasesCollapsed
});

const mapDispatchToProps = (dispatch) => ({
  onSequenceTextareaChange: (event) => dispatch(actions.onSequenceTextAreaChange(event)),
  onDatabaseCheckboxToggle: (event) => dispatch(actions.onDatabaseCheckboxToggle(event)),
  onSelectAllDatabases: () => dispatch(actions.onSelectAllDatabases()),
  onDeselectAllDatabases: () => dispatch(actions.onDeselectAllDatabases()),
  onToggleDatabasesCollapsed: () => dispatch(actions.onToggleDatabasesCollapsed()),
  onExampleSequence: (sequence) => dispatch(actions.onExampleSequence(sequence)),
  onClearSequence: () => dispatch(actions.onClearSequence()),
  onFileUpload: () => dispatch(actions.onFileUpload()),
  fetchRNAcentralDatabases: actions.fetchRNAcentralDatabases
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchForm);
