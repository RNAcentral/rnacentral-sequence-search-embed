import ebiGlobal from 'ebi-framework/css/ebi-global.css';
import fonts from 'EBI-Icon-fonts/fonts.css';
import themeLight from 'ebi-framework/css/theme-light.css';
import styles from './index.scss';
import componentStyles from 'containers/SequenceSearch/index.scss';

import React from 'react';
import {connect} from 'react-redux';

import * as actions from "../../../../actions/actions";
import {store} from "app.jsx";


class SearchForm extends React.Component {
  render() {
    return (
      <div className={ebiGlobal.row}>
        <div className={ebiGlobal['col-lg-12']}>
          <div className={ebiGlobal.hpanel}>
            <div className={ebiGlobal['panel-heading']}>
              <h1>Search an RNA sequence in RNA databases</h1>
            </div>
            <div className={ebiGlobal['panel-body']}>
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
                      <input id="sequence-file" name="sequence-file" type="file" accept=".fasta" onChange={this.props.onFileUpload} />
                    </p>
                  </fieldset>
                </div>
                { this.props.submissionError && <div className={`${ebiGlobal.callout} ${ebiGlobal.alert}`}>
                  <h3>Form submission failed</h3>
                  { this.props.submissionError }
                </div>}
                <div>
                  <fieldset>
                    <h4><a onClick={ this.props.onToggleDatabasesCollapsed }><small>{ this.props.databasesCollapsed ? <i className={`${fonts.icon} ${fonts['icon-functional']}`} data-icon="9" /> : <i className={`${fonts.icon} ${fonts['icon-functional']}`} data-icon="8"/> } search against specific RNA databases</small></a></h4>
                    <div id="rnacentralDatabaseCollapsible" className={styles['databases-collapsed']}>
                      <ul className={styles.rnacentralDatabases}>
                        {this.props.rnacentralDatabases.map(database =>
                          <li key={database}><span className={componentStyles.facet}><input id={database} type="checkbox" checked={this.props.selectedDatabases[database]} onChange={(e) => this.props.onDatabaseCheckboxToggle(e)} /><label htmlFor={database}>{ this.props.rnacentralDatabaseLabels[database] }</label></span></li>
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
                      <input name="submit" type="submit" value="Submit" className={`${themeLight.button} ${ebiGlobal.button}`} />
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
  onFileUpload: (event) => dispatch(actions.onFileUpload(event)),
  fetchRNAcentralDatabases: actions.fetchRNAcentralDatabases
});


export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SearchForm);
