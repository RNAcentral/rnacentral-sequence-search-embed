# RNAcentral sequence search embed

This is an embeddable component that you can include into your website to add a non-coding RNA sequence search.

The component sends search requests to EBI-backed API, run on EBI cloud infrastructure.

It searches against RNAcentral databases (or their arbitrary subset) with NHMMER, CMSCAN and also adds text search 
functionality, backed by EBI Lucene text search plugin.

This plugin is written in React/Redux. It is bundled as a Web Component, so it should not clash with your website's 
javascript or CSS.

## How to use

Just insert this html tag somewhere in your code:

```
<rnacentral-sequence-search databases='["your-database-name"]' />
```

and also the component's javascript package available at Github:

```
<script type="text/javascript" src="https://rnacentral.github.io/rnacentral-sequence-search-embed/dist/RNAcentral-sequence-search.js"></script>
```

If you prefer to install this package and perform the updates manually, see the [Installation](#Installation) section.


## Attributes/parameters

Sequence search component accepts a number of attributes. You pass them as html attributes
and their values are strings (this is a requirement of Web Components):

#### databases

Array of databases to search query sequence against. Currently you can choose from:

| database         |
|------------------|
| 5srrnadb         |
| crw              |
| dictybase        |
| ena              |
| ensembl          |
| ensembl_fungi    |
| ensembl_metazoa  |
| ensembl_plants   |
| ensembl_protists |
| expression_atlas |
| flybase          |
| genecards        |
| greengenes       |
| gtrnadb          |
| hgnc             |
| intact           |
| lncbase          |
| lncbook          |
| lncipedia        |
| lncrnadb         |
| malacards        |
| mgi              |
| mirbase          |
| mirgenedb        |
| modomics         |
| noncode          |
| pdbe             |
| pirbase          |
| plncdb           |
| pombase          |
| psicquic         |
| rdp              |
| refseq           |
| rfam             |
| rgd              |
| ribovision       |
| sgd              |
| silva            |
| snodb            |
| snopy            |
| snorna_database  |
| srpdb            |
| tair             |
| tarbase          |
| tmrna_web        |
| wormbase         |
| zfin             |
| zwd              |

#### examples

To show some examples, use:

```
<rnacentral-sequence-search 
    databases='["miRBase"]'
    examples='[
        {"description": "miRNA hsa-let-7a-1", "urs": "URS000004F5D8", "sequence": "CUAUACAAUCUACUGUCUUUC"}
    ]
/>
```

#### Rfam and R2DT

To enable Rfam classification and generate secondary structure (2D) diagrams using R2DT, use:

```
<rnacentral-sequence-search 
    databases='["miRBase"]'
    rfam="true"
    r2dt="true"
/>
```

#### facets

If you want to hide one specific facet, use:
```
<rnacentral-sequence-search 
    databases='["miRBase"]'
    hideFacet='["has_conserved_structure"]'
/>
```

You can hide any facet - ` "rna_type", "TAXONOMY", "expert_db", "qc_warning_found", "has_go_annotations", 
"has_conserved_structure", "has_genomic_coordinates" `

#### layout

You can also customise some elements of this embeddable component. The example below changes the color of the buttons:

```
<rnacentral-sequence-search
    databases='["miRBase"]'
    customStyle='{
      "searchButtonColor": "#007c82",
      "clearButtonColor": "#6c757d"
    }'
/>
```

Parameters that you can use to customise the widget:

| parameter                 | description                                                                        |
|---------------------------|------------------------------------------------------------------------------------|
| fixCss                    | fix the CSS. Use *"fixCss": "true"* if the button sizes are different              |
| urlWithJobId              | Use *"urlWithJobId": "true"* to show the jobId as a parameter in the URL&ast;      |
| linkColor                 | change the color of the links                                                      |
| h3Color                   | change the color of the `Similar sequences` and `Rfam classification` text         |
| h3Size                    | change the size of the `Similar sequences` and `Rfam classification` text          |
| exactMatchBackgroundColor | change the background color of the "Exact match" area                              |
| similarSeqText            | change the `Similar sequences` text                                                | 
| facetColor                | change the color of the facet title                                                |
| facetSize                 | change the size of the facet title                                                 |
| seqTitleSize              | used in results, it changes the size of the title                                  |
| seqInfoColor              | used in results, it changes the color of the text `number of nucleotides`          |
| seqInfoSize               | used in results, it changes the size of the text `number of nucleotides`           |
| searchButtonColor         | change the color of the `Search` button                                            |
| clearButtonColor          | change the color of the `Clear` button                                             |
| uploadButtonColor         | change the color of the `Upload file` button                                       |
| hideUploadButton          | hide the `Upload file` button. Use *"hideUploadButton": "true"* to hide the button |
| loadMoreButtonColor       | change the color of the `Load more` button                                         |

&ast; The urlWithJobId parameter may not work as desired. We recommend testing this feature in a test environment.

#### links

Search results links can also be changed. For example, assuming the link points to 
*www.example.com/?id=12345* and you want to change the URL to *www.newurl.com/12345*, use:

```
<rnacentral-sequence-search
    databases='["miRBase"]'
    customUrl='{
      "stringToSplit": "id=",
      "newUrl": "www.newurl.com/"
    }'
/>
```

#### example files

For a minimal example, see [index.html](./index.html). For an Rfam example, see [rfam.html](./rfam.html).

## Installation

Download this package directly from Github.

`git clone https://github.com/RNAcentral/rnacentral-sequence-search-embed.git`

Now you can add the component's javascript bundle (it contains all the styles and fonts) to your web page either 
directly or through an import with Webpack:

`<script type="text/javascript" src="/rnacentral-sequence-search-embed/dist/RNAcentral-sequence-search.js"></script>`

You will need to run the `git pull` command whenever there are updates.

## Developer details

### Local development

1. `npm install`

2. `npm run serve` to start a server on http://localhost:8080/

3. `npm run clean` to clean the dist folder of old assets

4. `npm run build` to generate a new distribution

### Notes

This embed is implemented as a Web Component, wrapping a piece of code in React/Redux.

Being a Web Component, it isolates CSS styles from the main page to avoid clash of styles with it.
The CSS styles and fonts are bundled into the javascript inline via Webpack 3 build system,
see webpack.config.js file. Upon load of RNAcentral-sequence-search.js, the component registers
itself in the custom elements registry.

Web Components accept input parameters as strings. That means that we have to parse
parameters in Web Component initialization code and pass the resulting objects as props to React.
Here are some examples of passing the parameters to the Web Component or from Web Component
to React:

* https://hackernoon.com/how-to-turn-react-component-into-native-web-component-84834315cb24
* https://stackoverflow.com/questions/50404970/web-components-pass-data-to-and-from/50416836
