import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route, Link, browserHistory} from 'react-router-dom';

import Layout from 'components/Layout/index.jsx';


ReactDOM.render(
  <Router history={browserHistory}>
    <Route path="/" component={Layout} >
    </Route>
  </Router>,
  document.querySelector('div#main')
);
