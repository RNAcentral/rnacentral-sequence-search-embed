import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link, browserHistory} from 'react-router-dom';

import SequenceSearch from 'components/SequenceSearch/index.jsx';


ReactDOM.render(
  <SequenceSearch/>,
  document.querySelector('div#main')
);
