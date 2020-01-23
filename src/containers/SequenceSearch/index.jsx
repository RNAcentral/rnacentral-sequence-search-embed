import React from 'react';
import 'jquery/dist/jquery.js';

import Results from 'containers/SequenceSearch/components/Results/index.jsx';
import SearchForm from 'containers/SequenceSearch/components/SearchForm/index.jsx';
import {connect} from "react-redux";


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return [
      <SearchForm key={`searchForm`} databases={this.props.databases} examples={this.props.examples}/>,
      <Results key={`results`} rfam={this.props.rfam} hideFacet={this.props.hideFacet}/>
    ]
  }
}

function mapStateToProps(state) {
  return {
    status: state.status,
    infernal_status: state.infernal_status,
    jobId: state.jobId,
    submissionError: state.submissionError
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SequenceSearch);

