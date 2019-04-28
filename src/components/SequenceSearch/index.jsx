import React from 'react';
import 'ebi-framework/js/script.js';
import 'foundation-sites/dist/js/foundation.js';
import 'ebi-framework/js/foundationExtendEBI.js';
import 'jquery/dist/jquery.js';

// import 'foundation-sites/dist/css/foundation.css';  // clash with ebi-framework1.3: header 'display: block/flexbox'
import 'ebi-framework/css/ebi-global.css';
import 'ebi-framework/css/theme-light.css';
import 'EBI-Icon-fonts/fonts.css';
import 'animate.css/animate.min.css';
import 'styles/style.scss';

import Results from 'components/SequenceSearch/components/Results/index.jsx';
import SearchForm from 'components/SequenceSearch/components/SearchForm/index.jsx';
import routes from "services/routes.jsx";


let statusChoices = {
  notSubmitted: "notSubmitted",
  submitted: "submitted",
  loading: "loading",
  error: "error"
};


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      status: statusChoices.notSubmitted,
      jobId: null,
      submissionError: null
    };
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
          throw response;
        }
      })
      .then(data => this.setState({jobId: data.job_id}))
      .catch(error => this.setState({status: error, submissionError: response.statusText}));
    }
  }




  render() {
    return [
      <SearchForm key={`searchForm`} status={this.state.status} />,
      <Results key={`results`} status={this.state.status} jobId={this.state.jobId} />
    ]
  }

  componentDidMount() {
    $(document).foundation();
    $(document).foundationExtendEBI();
  }

}

export default SequenceSearch;
