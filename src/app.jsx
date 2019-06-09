import React from 'react';
import ReactDOM from 'react-dom';
import retargetEvents from 'react-shadow-dom-retarget-events';
import {Provider} from 'react-redux';

import SequenceSearch from 'containers/SequenceSearch/index.jsx';
import configureStore from 'store/configureStore.js';

import ebiGlobal from 'ebi-framework/css/ebi-global.css';
import themeLight from 'ebi-framework/css/theme-light.css';
import 'EBI-Icon-fonts/fonts.css';
import fonts from 'EBI-Icon-fonts/fonts.css';
import animate from 'animate.css/animate.min.css';
import sequenceSearchStyles from 'containers/SequenceSearch/index.scss';
import resultsStyles from 'containers/SequenceSearch/components/Results/index.scss';


// Prepare data
export const store = configureStore();
export const databases = ['mirbase'];


class RNAcentralSequenceSearch extends HTMLElement {
  constructor() {
    super();

    const mountPoint = document.createElement('html');
    const shadowRoot = this.attachShadow({mode: 'open'});
    shadowRoot.appendChild(mountPoint);
    ReactDOM.render([
      <style key={ebiGlobal} dangerouslySetInnerHTML={{__html: ebiGlobal}}/>,
      <style key={themeLight} dangerouslySetInnerHTML={{__html: themeLight}}/>,
      <style key={fonts} dangerouslySetInnerHTML={{__html: fonts}}/>,
      <style key={animate} dangerouslySetInnerHTML={{__html: animate}}/>,
      <style key={sequenceSearchStyles} dangerouslySetInnerHTML={{__html: sequenceSearchStyles}}/>,
      <style key={resultsStyles} dangerouslySetInnerHTML={{__html: resultsStyles}}/>,
      <body key='body'>
        <Provider key='provider' store={store}>
          <SequenceSearch databases={databases}/>
        </Provider>
      </body>
      ],
      mountPoint
    );
    retargetEvents(shadowRoot);
  }
}

customElements.define('rnacentral-sequence-search', RNAcentralSequenceSearch);
