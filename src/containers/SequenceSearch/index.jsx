import React from 'react';

import Results from 'containers/SequenceSearch/components/Results/index.jsx';
import SearchForm from 'containers/SequenceSearch/components/SearchForm/index.jsx';
import {connect} from "react-redux";


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return [
      <SearchForm
          key={`searchForm`}
          admin={this.props.admin}
          customStyle={this.props.customStyle}
          databases={this.props.databases}
          examples={this.props.examples}
      />,
      <Results
          key={`results`}
          customStyle={this.props.customStyle}
          databases={this.props.databases}
          hideFacet={this.props.hideFacet}
          rfam={this.props.rfam}
      />
    ]
  }
}

function mapStateToProps(state) {
  return {
    status: state.status,
    infernalStatus: state.infernalStatus,
    jobId: state.jobId,
    jobList: state.jobList,
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

