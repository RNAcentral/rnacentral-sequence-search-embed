import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link, browserHistory} from 'react-router-dom';

import SequenceSearch from 'components/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';


const store = configureStore();

ReactDOM.render(
  <SequenceSearch/>,
  document.querySelector('div#main')
);
