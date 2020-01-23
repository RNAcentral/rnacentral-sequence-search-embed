import React from 'react';
import ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';
import {Provider} from 'react-redux';

import SequenceSearch from 'containers/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';

import ebiGlobal from 'ebi-framework/css/ebi-global.css';
import themeLight from 'ebi-framework/css/theme-light.css';
import fonts from 'EBI-Icon-fonts/fonts.css';
import animate from 'animate.css/animate.min.css';
import sequenceSearchStyles from 'containers/SequenceSearch/index.scss';
import resultsStyles from 'containers/SequenceSearch/components/Results/index.scss';
import customStyles from 'index.scss'


// Prepare data
export const store = configureStore();


class RNAcentralSequenceSearch extends HTMLElement {
  constructor() {
    super();

    // prepare DOM and shadow DOM
    const shadowRoot = this.attachShadow({mode: 'open'});
    const mountPoint = document.createElement('html');
    shadowRoot.appendChild(mountPoint);

    // parse arguments
    const databases = JSON.parse(this.attributes.databases.nodeValue);
    const examples = JSON.parse(this.attributes.examples ? this.attributes.examples.nodeValue : null);
    const rfam = JSON.parse(this.attributes.rfam ? this.attributes.rfam.nodeValue : null);
    const hideFacet = JSON.parse(this.attributes.hideFacet ? this.attributes.hideFacet.nodeValue : null);

    // render React
    ReactDOM.render([
      <style key={ebiGlobal} dangerouslySetInnerHTML={{__html: ebiGlobal}}/>,
      <style key={themeLight} dangerouslySetInnerHTML={{__html: themeLight}}/>,
      <style key={fonts} dangerouslySetInnerHTML={{__html: fonts}}/>,
      <style key={animate} dangerouslySetInnerHTML={{__html: animate}}/>,
      <style key={sequenceSearchStyles} dangerouslySetInnerHTML={{__html: sequenceSearchStyles}}/>,
      <style key={resultsStyles} dangerouslySetInnerHTML={{__html: resultsStyles}}/>,
      <style key={customStyles} dangerouslySetInnerHTML={{__html: customStyles}}/>,
      <body key='body'>
        <Provider key='provider' store={store}>
          <SequenceSearch databases={databases} examples={examples} rfam={rfam} hideFacet={hideFacet}/>
        </Provider>
      </body>
      ],
      mountPoint
    );

    // retarget React events to work with shadow DOM
    retargetEvents(shadowRoot);
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
