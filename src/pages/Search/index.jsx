import React from 'react';
import { withRouter } from 'react-router-dom';

import routes from 'services/routes.jsx';

import 'pages/Search/index.scss';


class Search extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      rnacentralDatabases: [],
      rnacentralDatabaseLabels: {},
      databasesCollapsed: true,
      selectedDatabases: {},
      sequence: "",
      submissionError: ""
    };

    this.onSelectAllDatabases = this.onSelectAllDatabases.bind(this);
    this.onDeselectAllDatabases = this.onDeselectAllDatabases.bind(this);
    this.onToggleDatabasesCollapsed = this.onToggleDatabasesCollapsed.bind(this);
    this.onExampleSequence = this.onExampleSequence.bind(this);
    this.onClearSequence = this.onClearSequence.bind(this);
    this.onFileUpload = this.onFileUpload.bind(this);
  }

  onSubmit(event) {
    event.preventDefault();

    // if sequence is not given - ignore submit
    if (this.state.sequence) {
      fetch(routes.submitJob(), {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: this.state.sequence,
          databases: Object.keys(this.state.selectedDatabases).filter(key => this.state.selectedDatabases[key])
        })
      })
      .then(function (response) {
        if (response.ok) {
          return response.json();
        } else {
          throw new Error(response.statusText);
        }
      })
      .then(data => this.props.history.push(`/job/${data.job_id}`))
      .catch(error => this.setState({submissionError: error.toString()}));
    }
  }

  onSequenceTextareaChange(event) {
    this.setState({sequence: event.target.value.toUpperCase()});
  }

  onDatabaseCheckboxToggle(event) {
    let selectedDatabases = { ...this.state.selectedDatabases };
    selectedDatabases[event.target.id] = !selectedDatabases[event.target.id];
    this.setState({ selectedDatabases: selectedDatabases });
  }

  onSelectAllDatabases(event) {
    let selectedDatabases = {};
    this.state.rnacentralDatabases.map(db => { selectedDatabases[db] = true; });
    this.setState({ selectedDatabases: selectedDatabases });
  }

  onDeselectAllDatabases(event) {
    let selectedDatabases = {};
    this.state.rnacentralDatabases.map(db => { selectedDatabases[db] = false; });
    this.setState({ selectedDatabases: selectedDatabases });
  }

  onToggleDatabasesCollapsed(event) {
    $('#rnacentralDatabaseCollapsible').toggleClass('databases-collapsed');
    this.setState({ databasesCollapsed: !this.state.databasesCollapsed });
  }

  onExampleSequence(sequence) {
    this.setState({sequence: sequence});
  }

  onClearSequence(event) {
    this.setState({sequence: ""});
  }

  onFileUpload(event) {
    // TODO: fasta parsing
    // TODO: exception handling - user closed the dialog
    // TODO: exception handling - this is not a proper fasta file

    let fileReader = new FileReader();

    fileReader.onloadend = (event) => {
      let fileContent = event.target.result;
      this.setState({sequence: fileContent});
    };

    fileReader.readAsText(event.target.files[0]);
  }

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
                        Examples: <a onClick={ e => this.onExampleSequence("CUAUACAAUCUACUGUCUUUC") }>miRNA hsa-let-7a-1</a> <small>(URS000004F5D8)</small>, <a onClick={ e => this.onExampleSequence("UGCCUGGCGGCCGUAGCGCGGUGGUCCCACCUGACCCCAUGCCGAACUCAGAAGUGAAACGCCGUAGCGCCGAUGGUAGUGUGGGGUCUCCCCAUGCGAGAGUAGGGAACUGCCAGGCAU") }> 5S rRNA</a> <small>(URS0000049E57)</small>, <a onClick={ e => this.onExampleSequence("AGACCCGGCACCCGCGCAACGGAGGAGGGGCGCUGUGCCCUCUCCCCAACGGCGGUCAGCUUGGAACGCCUGCCCGGCGCACGCCCGGGGCCGGGGAGCCGAACUCGGUGCCAGCCGCACCCGGGCGGGUUGCUGGUGCGCCCUCCCCUCGCCCCCGUCCCUGGGGUCCUUGACCCAGGCUCUUGGGGCUAGCCUAUCUUCUGAGGAGCACAAGGUCCCUGGGGGCUCAGGGAAGAGAAAUUGGAGAAAGGGGGAGGAAGCCCCCAAGAUGGAUCACCCAUUGCCUGGUUUCGCAGGAGACUGUCCGCCUUCAGUUCUCCAGCAGCUCGGGGAUCAUGGCCCACUGAACCCCCAAGCGCUUUCACCCGAACCCAAGGAGGACGACCAGGAAAGACGGGAACUCGCGUAGACACGCCCGGAAGCCCUUGUCAUGUAAAUAGCUGUCGGGGACUGGUGUAUUGUCGCCGCCCCAGCCGGCGGGACCUGGGGCGAAUCCACACCCAUUGUCUGCUGCCCAAGGGGCCUCCGGCUGGGGGGCGCGGCUGCGGAGUUCAAAAGGGGUAUGAGCAGGAGGGGUGUACUUUUAGUUCAUUAAGUUUUAAUUACAGGAGUGCUACAAGAACACAUUCUUCAGGUUUAAAAAGAUAUUAAAAUAUUACAUAAGAGACCUCCCCUCCCUGGCCCACCUCCAGCCUCUUAAAAAUUUAGUGUGUCGCCUUUUAGACACUUUCUCAAAGCUUCACUUAUUUAACAGGCACUUAAGGAGCACCUACCUGUGCCAGAAACUCUCCAAAUAUUAACUCAACCUGACACCGACUCAGUGUGGCCGAAUAUUACUCUCCCCAUUUUACAGAGCGGGCAGCUGGUCAAGGAAGUCGCUUGUUGAAAGUCACACAGUGGUGGAGCCUGUGUGCCAACCCAGGACCCUGGGGAGCUGCCUCCCCCUCUCCCACGUAGUCCUGAUUCUUUAAGUGUCCACAUAUUCCUGUAAUGCCUGGAGUUUCAGUAAUUAGCAGGGACUUAGUGUGUUCAGAGAAAAAAAAAGCUUUUAAAAAUUAUUGUUACUGUGUUUGUAACAGUUUGGAUAGAGAAGGAAAAGCUGGAAUUUGGGAAGUGAAGGUGGCCUCGGGGUAGAACUUACCUAGACCAGAGCGAAUUCAUCCUGAAGAACUCAGAGAAAGCCGGUGCAGGAAGUGGGUUCCCGCUCUCCCUGCACAGGCACAGUGAUGCUGCCAGAGCUCUCCCAGAAAGACCAGGAGGCUUGUUCUGGAGAAGUCAAGCCCAGGGAUGUGGCUCAGGCUGGUCCAAGCUCUUUGGAGGAGUCCAAGCGUGCCCAGCCCAGAGGGAGGUUCAGAGGCACUGACCGUCUUCUGUUUGGGAGGAGAAGCUCACUCUUGGAGCCACAGCCAGCACUAGGUCAGGACCCAGGCCCCGGCCCAGGAGUGGGGCAAUACCCAGCGUCUACCCCAGAUGGCACCCUGCUGUGAACUGGGCGCCCUCAGCCCCUGCCUUGAGGAAGGGGCAAUACCACCAGCGUGUCUUUUAUCAGGGAAGAUAUUGCUGCAGUUUGGCCGCUGCAACUUAAGAGAAAAGCUAAGGGGUCCCCCAGCAUCCCUUGGGGUGCCACUGCAAAUACUGGCUGGGCCUGGAGAUGACCUGGGUCCCAUUCACUUCCUAGGGUGAAGGAGGUCAUCAUUACCACCCCUGCUUUCAGCCAUUUCUUCAUUCAUUCAAUCAACAAACUGGCUGAGCUGCAACCCUGAGCCGGGGAAUUCAGCCACUCCAGACACAGCCCCUGCCCUCCGGGAAGUCUCGGGAGACCUGGCUAGUCUGGCUGGGAGAAGUCACACGUUGAUUGUCUUGGAAGUGAGAUGGCAUUUACACAAUGGAGGCUGCACUGCCAGCAGGCAAAAAUAACCAGUUAAUUCAGUGGCUUAAAGAAACCAAACCUACCCACAACGCUUGACCUCCCAUUGAUCCAUCUGCGACACCGGCAGUGGCUACCAUUUAUUGAGUGCUGAUGGUGUCACCUGGGAUUGACUUAGUGGUCUCUGGCGCUAGUUCCGAAGUUGAUUCUGUCUGGAGAGCUUAAUGCAGUGUUCAGACCUCAGGGUCCGAACCUGAGGGUCACCCAAAGAUGAGUGGGACAUAGCUGUGUGACCUCGGCUGAGUGCUUUCACCUCUCCAACCUCAGUUUCCUCUUCUGCAAAAUGGGGUGGCUUCAUGGCACCUUCACGUGGUGUGAUUGCGAGGAAUGAAGGGAUCGAUGCCUUGCAAGUAGAGGAGAAGGGGCCGGAUACAUCUUAGUUGUUAUGUUAUUUAAUCAUCUUGGCAACCCCGGGAGGGAGGAACCACUAUCAUUUUAUUUUCCAUUUUGCAGUUGAGGACAAUGAUGAUUCCAGCACAGACAGGGCCCCUGACGGGGCAGUAGGAAAGGAGAAUUGCUUUGGAAGGAGCAUAGGCUGGACUGCCAGCACUCAUAGGAGGCUUCGUGUGUGCCCAGGACUGCGAGAAUUAAAUACAGGACACCCAGUUCAGUUUGAAUUUCAGAUAAACUAUGAAUAAUGAUUAGUGUAAGUAUAUCUCAAUUUAACUGGAAAAAAAAAAAAAAAAAA") }>NKILA lncRNA</a> <small>(URS00008120E1)</small> | <a id="clearSequence" onClick={ this.onClearSequence }>Clear sequence</a>
                      </label>
                    </p>
                    <textarea id="sequence" name="sequence" rows="7" value={this.state.sequence} onChange={(e) => this.onSequenceTextareaChange(e)} />
                    <p>
                      Or upload a file:
                      <input id="sequence-file" name="sequence-file" type="file" accept=".fasta" onChange={this.onFileUpload} />
                    </p>
                  </fieldset>
                </div>
                { this.state.submissionError && <div className="callout alert">
                  <h3>Form submission failed</h3>
                  { this.state.submissionError }
                </div>}
                <div>
                  <fieldset>
                    <h4><a onClick={ this.onToggleDatabasesCollapsed }><small>{ this.state.databasesCollapsed ? <i className="icon icon-functional" data-icon="9" /> : <i className="icon icon-functional" data-icon="8"/> } search against specific RNA databases</small></a></h4>
                    <div id="rnacentralDatabaseCollapsible" className="databases-collapsed">
                      <ul id="rnacentralDatabases" className="facets">
                        {this.state.rnacentralDatabases.map(database =>
                          <li key={database}><span className="facet"><input id={database} type="checkbox" checked={this.state.selectedDatabases[database]} onChange={(e) => this.onDatabaseCheckboxToggle(e)} /><label htmlFor={database}>{ this.state.rnacentralDatabaseLabels[database] }</label></span></li>
                        )}
                      </ul>
                      <p>
                        <label>
                          <a id="selectAllDatabases" onClick={this.onSelectAllDatabases}>Select all</a> | <a id="deselectAllDatabases" onClick={this.onDeselectAllDatabases}>Deselect all</a>
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
    fetch(routes.rnacentralDatabases())
      .then(response => response.json())
      .then(data => {

        let rnacentralDatabases = data.map(database => database.id);

        let selectedDatabases = {};
        data.map(database => { selectedDatabases[database.id] = false });

        let rnacentralDatabaseLabels = {};
        data.map(database => { rnacentralDatabaseLabels[database.id] =  database.label });

        this.setState({
          rnacentralDatabases: rnacentralDatabases,
          selectedDatabases: selectedDatabases,
          rnacentralDatabaseLabels: rnacentralDatabaseLabels
        });

      });
  }

}

export default withRouter(Search);
