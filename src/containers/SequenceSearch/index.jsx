import React from 'react';
import {connect} from "react-redux";
import * as actionCreators from 'actions/actions';
import {store} from "app.jsx";

import Results from 'containers/SequenceSearch/components/Results/index.jsx';
import SearchForm from 'containers/SequenceSearch/components/SearchForm/index.jsx';


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const urlWithJobId = this.props.customStyle && this.props.customStyle.urlWithJobId ? this.props.customStyle.urlWithJobId : "";
    if (urlWithJobId === "true") {
      // check if a jobId was passed as a parameter to search for results
      let url = window.location.href;
      url = url.split("?jobid=");
      let jobId = url[url.length - 1]
      const r2dt = !!this.props.r2dt;  // true if exists, otherwise false
      if (jobId.match("^([0-9a-fA-F]{8})-(([0-9a-fA-F]{4}\\-){3})([0-9a-fA-F]{12})$")) {
        store.dispatch(actionCreators.updateJobId(jobId, r2dt))
      } else if (jobId.startsWith("URS")) {
        store.dispatch(actionCreators.onSubmitUrs(jobId, this.props.databases, r2dt))
      }
    }
  }

  componentDidUpdate() {
    const urlWithJobId = this.props.customStyle && this.props.customStyle.urlWithJobId ? this.props.customStyle.urlWithJobId : "";
    if (urlWithJobId === "true") {
      // show the jobId in the URL
      let url = window.location.href;
      let splitUrl = url.split("?jobid=");
      let domain = splitUrl[0]
      if (this.props.jobId){
        window.history.replaceState("", "", domain + "?jobid=" + this.props.jobId);
      } else {
        window.history.replaceState("", "", domain);
      }
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
          r2dt={this.props.r2dt}
      />,
      <Results
          key={`results`}
          customStyle={this.props.customStyle}
          databases={this.props.databases}
          hideFacet={this.props.hideFacet}
          r2dt={this.props.r2dt}
          rfam={this.props.rfam}
      />
    ]
  }
}

function mapStateToProps(state) {
  return {
    jobId: state.jobId,
  };
}

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SequenceSearch);
