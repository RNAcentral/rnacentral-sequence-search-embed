# RNAcentral sequence search embed

This is an embeddable component that you can include into
your website to add a non-coding RNA sequence search.

The component sends search requests to EBI-backed API, run on
EBI cloud infrastructure.

It searches against RNAcentral databases (or their arbitrary subset)
with NHMMER and also adds text search functionality, backed by EBI
Lucene text search plugin.

This plugin is written in React/Redux and makes use of Zurb
Foundation-based EBI theme. It is bundled with CSS modules and
 UMD wrapper and packaged with Webpack, so it should not clash with
your website's javascript or CSS.

## Installation

Install this package with npm or download it directly from Github.

`npm install @rnacentral/rnacentral-sequence-search-embed`

or

`git clone https://github.com/RNAcentral/rnacentral-sequence-search-embed.git`


Now you can add the javascript bundle and css bundle to your web page either directly or through
 an import with Webpack or native ECMAscript modules and CSS modules.

For a minimal example, see [index.html](./index.html).

Javascript bundle is wrapped into a UMD wrapper and should be safe
to use with ECMAscript modules and AMD/Require.js. CSS bundle is
using CSS modules and shouldn't be breaking CSS of your webpage.

## Parameters

SequenceSearch component accepts a number of parameters. You pass them as html attributes
in curly braces:

```
<rnacentral-sequence-search databases='["mirbase"]' />
```

#### databases

Array of databases to search query sequence against. Currently you can choose from:

database     |
-------------|
ena          |
greengenes   |
lncrnadb     |
mirbase      |
pdbe         |
pombase      |
rdp          |
refseq       |
rfam         |
rgd          |
sgd          |
snopy        |
srpdb        |
tair         |
tmrna-website|
wormbase     |
 
 
## Developer details

This embed is implemented as a Web Component, wrapping a piece of code in React/Redux.

Being a Web Component, it isolates CSS styles from the main page to avoid clash of styles with it.
The CSS styles and fonts are bundled into the javascript inline via Webpack 3 build system,
see webpack.config.js file. Upon load of RNAcentral-sequence-search.js, the component registers
itself in the custom elements registry.

There are some peculiarities about interaction of Web Components with React.

First, there is a known issue with React events breaking, when React component is mounted under a shadow root in
shadow DOM. We solve this by retargeting React events for shadow dom with this package:

* https://www.npmjs.com/package/react-shadow-dom-retarget-events.

Second, Web Components accept input parameters as strings. That means that we have to parse
parameters in Web Component initialization code and pass the resulting objects as props to React.
Here are some examples of passing the parameters to the Web Component or from Web Component
to React:

* https://hackernoon.com/how-to-turn-react-component-into-native-web-component-84834315cb24
* https://stackoverflow.com/questions/50404970/web-components-pass-data-to-and-from/50416836
