import React from 'react';
import ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';
import {Provider} from 'react-redux';

import SequenceSearch from 'containers/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';


// Prepare data
export const store = configureStore();
export const databases = ['mirbase'];
//
// // Get the shadow root
// const shadowHost = document.querySelector('div#sequence-search');
// const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
//
// // Create div element for react to render into
// const reactRoot = document.createElement('div');
// reactRoot.setAttribute('id', 'react-root');
//
// // Append react root to shadow root
// shadowRoot.appendChild(reactRoot);
//
// // Render react
// ReactDOM.render(
//   <Provider store={store}>
//     <SequenceSearch databases={databases}/>
//   </Provider>,
//   reactRoot
// );


class RNAcentralSequenceSearch extends HTMLElement {
  constructor() {
    super();

    const mountPoint = document.createElement('div');
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(mountPoint);
    ReactDOM.render([
      <link key='styles' href="RNAcentral-sequence-search.css" rel="stylesheet" />,
      <Provider key='provider' store={store}>
        <SequenceSearch databases={databases}/>
      </Provider>],
      mountPoint
    );
    retargetEvents(shadowRoot);
  }
}

customElements.define('rnacentral-sequence-search', RNAcentralSequenceSearch);



// const proto = Object.create(HTMLElement.prototype, {
//   attachedCallback: {
//     value: function() {
//       const mountPoint = document.createElement('div');
//       const shadowRoot = this.createShadowRoot();
//       shadowRoot.appendChild(mountPoint);
//       ReactDOM.render([
//         <link key='styles' href="RNAcentral-sequence-search.css" rel="stylesheet" />,
//         <Provider key='provider' store={store}>
//           <SequenceSearch databases={databases}/>
//         </Provider>],
//         mountPoint
//       );
//       retargetEvents(shadowRoot);
//     }
//   }
// });

// document.registerElement('RNAcentral-sequence-search', {prototype: proto});