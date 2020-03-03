# RNAcentral sequence search embed

This is an embeddable component that you can include into your website to add a non-coding RNA sequence search.

The component sends search requests to EBI-backed API, run on EBI cloud infrastructure.

It searches against RNAcentral databases (or their arbitrary subset) with NHMMER, CMSCAN and also adds text search 
functionality, backed by EBI Lucene text search plugin.

This plugin is written in React/Redux and makes use of Zurb Foundation-based EBI theme. It is bundled as a Web 
Component, so it should not clash with your website's javascript or CSS.

## Installation

Download this package directly from Github.

`git clone https://github.com/RNAcentral/rnacentral-sequence-search-embed.git`

Now you can add the component's javascript bundle (it contains all the styles and fonts) to your web page either 
directly or through an import with Webpack:

`<script type="text/javascript" src="/rnacentral-sequence-search-embed/dist/RNAcentral-sequence-search.js"></script>`

To use it just insert an html tag somewhere in your html:

```
<rnacentral-sequence-search databases='["miRBase"]' />
```

To show some examples and/or enable the Rfam search, use:

```
<rnacentral-sequence-search 
    databases='["miRBase"]'
    examples='[
        {"description": "miRNA hsa-let-7a-1", "urs": "URS000004F5D8", "sequence": "CUAUACAAUCUACUGUCUUUC"},
    ]
    rfam="true"
/>
```

If you want to hide one specific facet, use:
```
<rnacentral-sequence-search 
    databases='["miRBase"]'
    hideFacet='["has_conserved_structure"]'
/>
```

You can hide any facet - ` "rna_type", "TAXONOMY", "expert_db", "qc_warning_found", "has_go_annotations", 
"has_conserved_structure", "has_genomic_coordinates" `

You can also customise some elements of this embeddable component. See what you can change [here](#layout).
The example below changes the color of the buttons:

```
<rnacentral-sequence-search
    databases='["miRBase"]'
    customStyle='{
      "searchButtonColor": "#007c82",
      "clearButtonColor": "#6c757d"
    }'
/>
```

For a minimal example, see [index.html](./index.html). For an Rfam example, see [rfam.html](./rfam.html).

## Attributes/parameters

Sequence search component accepts a number of attributes. You pass them as html attributes
and their values are strings (this is a requirement of Web Components):

#### databases

Array of databases to search query sequence against. Currently you can choose from:

database          |
------------------|
dictybase         |
ena               |
ensembl           |
ensembl_fungi     |
ensembl_metazoa   |
ensembl_plants    |
ensembl_protists  |
flybase           |
gencode           |
greengenes        |
gtrnadb           |
hgnc              |
lncbase           |
lncbook           |
lncipedia         |
lncrnadb          |
mgi               |
mirbase           |
modomics          |
noncode           |
pdbe              |
pombase           |
rdp               |
refseq            |
rfam              |
rgd               |
sgd               |
silva             |
snopy             |
srpdb             |
tair              |
tarbase           |
tmrna_web         |
wormbase          |
zwd               |

#### layout

Parameters that you can use to customise some elements of this embeddable component

parameter                   | description                                                                       |
----------------------------|-----------------------------------------------------------------------------------|
h3Color                     | change the color of the `Similar sequences` and `Rfam classification` text        |
h3Size                      | change the size of the `Similar sequences` and `Rfam classification` text         |
exactMatchBackgroundColor   | change the background color of the "Exact match" area                             | 
similarSeqText              | change the `Similar sequences` text                                               | 
facetColor                  | change the color of the facet title                                               |
facetSize                   | change the size of the facet title                                                |
seqTitleColor               | used in results, it changes the color of the title                                |
seqTitleSize                | used in results, it changes the size of the title                                 |
seqInfoColor                | used in results, it changes the color of the text `number of nucleotides`         |
seqInfoSize                 | used in results, it changes the size of the text `number of nucleotides`          |
searchButtonColor           | change the color of the `Search` button                                           |
clearButtonColor            | change the color of the `Clear` button                                            |
uploadButtonColor           | change the color of the `Upload file` button                                      |
hideUploadButton            | hide the `Upload file` button. Use "hideUploadButton": "true" to hide the button  |
loadMoreButtonColor         | change the color of the `Load more` button                                        |

## Developer details

### Local development

1. `npm install`

2. `npm run serve` to start a server on http://localhost:8080/

3. `npm run clean` to clean the dist folder of old assets

4. `npm run build` to generate a new distribution.

### Notes

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
