import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import SequenceSearch from 'containers/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';


export const store = configureStore();

ReactDOM.render(
  <Provider store={store}>
    <SequenceSearch/>
  </Provider>,
  document.querySelector('div#sequence-search')
);
