import React from 'react';

import Results from 'containers/SequenceSearch/components/Results/index.jsx';
import SearchForm from 'containers/SequenceSearch/components/SearchForm/index.jsx';
import {connect} from "react-redux";
import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // check if a jobId was passed as a parameter to search for results
    let url = window.location.href;
    url = url.split("/");
    let jobId = url[url.length - 1]
    if (jobId.match("^([0-9a-fA-F]{8})-(([0-9a-fA-F]{4}\\-){3})([0-9a-fA-F]{12})$")) {
      store.dispatch(actionCreators.updateJobId(jobId))
    }
  }

  componentDidUpdate() {
    // show the jobId in the URL
    if (this.props.jobId && this.props.url){
      window.history.replaceState("", "", this.props.url + this.props.jobId);
    } else if (!this.props.jobId && this.props.url){
      window.history.replaceState("", "", this.props.url);
    }
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
    jobId: state.jobId,
    url: state.url,
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SequenceSearch);
