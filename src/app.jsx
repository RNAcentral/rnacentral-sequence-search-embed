import React from 'react';
import ReactDOM from 'react-dom';

import SequenceSearch from 'containers/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';


const store = configureStore();

ReactDOM.render(
  <SequenceSearch store={store}/>,
  document.querySelector('div#main')
);
