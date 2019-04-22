import React from 'react';
import {Route, Link, Redirect, Switch} from 'react-router-dom';
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


class SequenceSearch extends React.Component {
  constructor(props) {
    super(props);

    this.state = {

    };
  }

  render() {
    return [
      <SearchForm key={`searchForm`}></SearchForm>,
      <Results key={`results`}></Results>
    ]
  }

  componentDidMount() {
    $(document).foundation();
    $(document).foundationExtendEBI();
  }

}

export default SequenceSearch;