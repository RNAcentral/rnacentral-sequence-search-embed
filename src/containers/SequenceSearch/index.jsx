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

import Results from 'containers/SequenceSearch/components/Results/index.jsx';
import SearchForm from 'containers/SequenceSearch/components/SearchForm/index.jsx';
import routes from "services/routes.jsx";
import {connect} from "react-redux";


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return [
      <SearchForm key={`searchForm`} />,
      <Results key={`results`} />
    ]
  }

  componentDidMount() {
    $(document).foundation();
    $(document).foundationExtendEBI();
  }

}

const mapStateToProps = (state) => ({
  status: state.status,
  jobId: state.jobId,
  submissionError: state.submissionError
});

function mapDispatchToProps(dispatch) {
  return {};
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SequenceSearch);
