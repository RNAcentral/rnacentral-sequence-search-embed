# RNAcentral sequence search embed

This is an embeddable component that you can include into 
your website to add a NHMMER-backed non-coding RNA sequence search 
against RNAcentral databases (or their arbitrary subset). The 
component also adds text search functionality, backed by EBI Lucene 
text search plugin.

This plugin is written in React and Redux and makes use of Zurb 
Foundation-based EBI theme and CSS modules packaged with Webpack, so
that it doesn't clash with your CSS.

## Installation

Install this package with npm or download it directly from Github.

`npm install @rnacentral/rnacentral-sequence-search-embed`

or

`git clone https://github.com/RNAcentral/rnacentral-sequence-search-embed.git`


Now you can add our javascript bundle and css bundle to your web page either directly or through
 an import with Webpack or native ECMAscript modules and CSS modules.
 
If you want to include it into CSS directly, follow this minimal example:
 

```
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Your page</title>
    <link href="node_modules/@rnacentral/rnacentral-sequence-search-embed/dist/rnacentral-sequence-search-embed.css" rel="stylesheet">
  </head>
  <body class="level2">
    <div id="sequence-search"></div>
    <script src="node_modules/@rnacentral/rnacentral-sequence-search-embed/dist/rnacentral-sequence-search-embed.js"></script>
    <script>
      const store = configureStore();
        
      ReactDOM.render(
        <Provider store={store}>
          <SequenceSearch/>
        </Provider>,
        document.querySelector('div#sequence-search')
      );    
    </script>
  </body>
</html>
```

Note that we import the javascript bundle in `<body>` and css bundle
in `<head>`.

Also take note, how we initialize the plugin with `ReactDOM.render`
and tell it to render the plugin into `'div#sequence-search'` element,
of the page above.

Javascript bundle is wrapped into a UMD wrapper and should be safe
to use with ECMAscript modules and AMD/Require.js. CSS bundle is
using CSS modules and shouldn't be breaking CSS of your webpage.