import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import SequenceSearch from 'containers/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';

import bootstrap from 'styles/bootstrap.css';
import sequenceSearchStyles from 'styles/sequence-search.scss';

// Prepare data
export const store = configureStore();


class RNAcentralSequenceSearch extends HTMLElement {
  constructor() {
    super();

    // prepare DOM and shadow DOM
    // workaround found at https://github.com/facebook/react/issues/9242 to avoid re-renders
    const shadowRoot = this.attachShadow({mode: 'open'});
    const mountPoint = document.createElement('html');
    shadowRoot.appendChild(mountPoint);
    Object.defineProperty(mountPoint, "ownerDocument", { value: shadowRoot });
    shadowRoot.createElement = (...args) => document.createElement(...args);
    shadowRoot.createElementNS = (...args) => document.createElementNS(...args);
    shadowRoot.createTextNode = (...args) => document.createTextNode(...args);

    // parse arguments
    const admin = JSON.parse(this.attributes.admin ? this.attributes.admin.nodeValue : null);
    const customStyle = JSON.parse(this.attributes.customStyle ? this.attributes.customStyle.nodeValue : null);
    const databases = JSON.parse(this.attributes.databases ? this.attributes.databases.nodeValue : null);
    const examples = JSON.parse(this.attributes.examples ? this.attributes.examples.nodeValue : null);
    const hideFacet = JSON.parse(this.attributes.hideFacet ? this.attributes.hideFacet.nodeValue : null);
    const rfam = JSON.parse(this.attributes.rfam ? this.attributes.rfam.nodeValue : null);

    // render React
    ReactDOM.render([
      <style key={bootstrap} dangerouslySetInnerHTML={{__html: bootstrap}}/>,
      <style key={sequenceSearchStyles} dangerouslySetInnerHTML={{__html: sequenceSearchStyles}}/>,
      <body key='body'>
        <Provider key='provider' store={store}>
          <SequenceSearch
              admin={admin}
              customStyle={customStyle}
              databases={databases}
              examples={examples}
              hideFacet={hideFacet}
              rfam={rfam}
          />
        </Provider>
      </body>
      ],
      mountPoint
    );
  }

  connectedCallback() {
  }

  disconnectedCallback() {
    let state = store.getState();
    if (state.statusTimeout) {
      clearTimeout(state.statusTimeout);
    }
  }
}

customElements.define('rnacentral-sequence-search', RNAcentralSequenceSearch);
