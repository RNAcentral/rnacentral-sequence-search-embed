import React, {Component} from 'react';
import {store} from "app.jsx";
import * as actionCreators from 'actions/actions';
import {connect} from "react-redux";
import ReactGA from 'react-ga4';
import JSZip from 'jszip';
import info from 'expert-dbs/index';

class Filter extends Component {
  onFilterSubmit(event) {
    event.preventDefault();
    const state = store.getState();
    if (state.filter) {
      store.dispatch(actionCreators.onFilterResult());
    }
  }

  onFilterReset(event) {
    event.preventDefault();
    const state = store.getState();
    if (state.sequence) {
      store.dispatch(actionCreators.onClearResult());
      store.dispatch(actionCreators.onSubmit(state.sequence, this.props.databases));
    }
  }

  filterClickTrack(value){
    const trackingID = this.props.customStyle && this.props.customStyle.trackingID ? this.props.customStyle.trackingID : "";
    trackingID ? ReactGA.initialize(trackingID) : '';
    trackingID ? ReactGA.event({ category: 'filter', action: 'click', label: value }) : '';
  }

  onDownload() {
    // filter out entries without rnacentral_id
    const validEntries = this.props.downloadEntries.filter(entry => entry?.rnacentral_id);

    // create sequence folder
    let zip = new JSZip();
    let FileSaver = require('file-saver');
    let sequenceFolder = zip.folder("sequences");

    // create text file with the results
    let textData = "Query: " + this.props.sequence + "\n" + "\n" +
      "Number of hits: " + validEntries.length + "\n" + "\n" +
      validEntries.map((entry, index) => (
        ">> " + (entry?.rnacentral_id ?? "") + " " + (entry?.description ?? "") + "\n" +
        "E-value: " + (entry?.e_value?.toExponential() ?? "") + "\t" +
        "Identity: " +  `${parseFloat(entry?.identity ?? 0).toFixed(2)}%` + "\t" +
        "Query coverage: " + `${parseFloat(entry?.query_coverage ?? 0).toFixed(2)}%` + "\t" +
        "Gaps: " + `${parseFloat(entry?.gaps ?? 0).toFixed(2)}%` + "\n" + "\n" +
        "Alignment: " + "\n" + (entry?.alignment ?? "") + "\n" + "\n" + "\n"
      ))
    textData = textData.replace(/,>>/g, '>>')
    let textFile = new Blob([textData], {type: 'text/plain'});
    sequenceFolder.file('similar-sequences.txt', textFile);

    // create json file with the results
    let jsonData = {
      "query": this.props.sequence,
      "hits": validEntries.length,
      "results": validEntries.map((entry, index) => (
          {
            "description": entry?.description ?? "",
            "e-value": entry?.e_value?.toExponential() ?? "",
            "identity": `${parseFloat(entry?.identity ?? 0).toFixed(2)}%`,
            "query_coverage": `${parseFloat(entry?.query_coverage ?? 0).toFixed(2)}%`,
            "gaps": `${parseFloat(entry?.gaps ?? 0).toFixed(2)}%`,
            "alignment": entry?.alignment ?? ""
          }
        ))
    }
    let jsonFile = new Blob([JSON.stringify(jsonData)], {type: 'application/json'});
    sequenceFolder.file('similar-sequences.json', jsonFile);

    // create fasta file with sequences extracted from alignment
    let fastaData = '';
    validEntries.map((entry, index) => {
      fastaData += ">" + (entry?.rnacentral_id ?? "") + "/" + (entry?.alignment_start ?? "") + "-" + (entry?.alignment_stop ?? "") + " " + (entry?.description ?? "") + "\n" + (entry?.alignment_sequence ?? "") + "\n";
    });
    let fastaFile = new Blob([fastaData], {type: 'text/plain'});
    sequenceFolder.file('similar-sequences.fasta', fastaFile);

    // info for the metadata below
    // get url
    const url = window.location.href;

    // check where the sequences come from
    let expertDbs = []
    this.props.downloadEntries.map(entry => {
      if (entry.fields && entry.fields.expert_db) {
        expertDbs.push(...entry.fields.expert_db.filter(item => !expertDbs.includes(item)));
      }
    })
    const newExpertDb = expertDbs.map((item) => {
      return item.toLowerCase();
    });
    const showExpertDb = info.filter(({name}) => newExpertDb.includes(name));

    // get current date/time
    const today = new Date();
    const date = today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date + ' ' + time;

    // create the title
    const title = this.props.databases.length === 0 ?
        "RNAcentral sequence similarity search results" :
        this.props.databases + " sequence similarity search results"

    // create the description
    const description = this.props.databases.length === 0 ?
        "The search found " + this.props.downloadEntries.length + " sequences from " + showExpertDb.length +
        " Expert Databases. The RNAcentral sequence similarity search enables searches against a comprehensive " +
        "collection of non-coding RNA sequences from a consortium of RNA databases. The search is powered by the " +
        "nhmmer software."
        : "The search found " + this.props.downloadEntries.length + " similar sequences. " +
        this.props.databases + " is part of RNAcentral, which integrates more than 45 different specialized ncRNA " +
        "databases. The search is powered by the nhmmer software."

    // create json file with metadata
    let dataPackage = {
      "homepage": url,
      "title": title,
      "description": description,
      "rnacentral_version": "v24",
      "licenses": [{
        "name": "CC0",
        "path": "https://creativecommons.org/share-your-work/public-domain/cc0/",
        "title": "Creative Commons Zero license"
      }],
      "download_date": dateTime,
      "sources": this.props.databases.length === 0 ?
        showExpertDb.map(entry => (
          {
            "name": entry.name,
            "web": entry.url
          }
          )) :
          {
            "name": this.props.databases[0],
            "web": showExpertDb.find(db => db.name===this.props.databases[0].toLowerCase()).url
          },
      "resources": [
        {
          "name": "similar-sequences",
          "path": "sequences/similar-sequences.txt",
          "description": "Results file in text format",
          "format": "txt",
          "mediatype": "text/txt",
          "encoding": "ASCII",
        },
        {
          "name": "similar-sequences",
          "path": "sequences/similar-sequences.json",
          "description": "Results file in JSON format",
          "format": "json",
          "mediatype": "application/json",
          "encoding": "ASCII",
        },
        {
          "name": "similar-sequences",
          "path": "sequences/similar-sequences.fasta",
          "description": "List of similar sequences in FASTA format",
          "format": "txt",
          "mediatype": "text/txt",
          "encoding": "ASCII",
        }
      ],
      "maintainers": [{
        "name": "RNAcentral",
        "web": "https://rnacentral.org"
      }],
      "datapackage_version": "1.2",
    }
    let dataPackageFile = new Blob([JSON.stringify(dataPackage)], {type: 'application/json'});
    zip.file('datapackage.json', dataPackageFile)

    // download zip file
    let rootDirectory = this.props.jobId + ".zip"
    zip.generateAsync({type:"blob"}).then(function(content) {
      FileSaver.saveAs(content, rootDirectory);
    });
  }

  render() {
    const fixCss = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "1.5rem" : "";

    return (
      <div className="row" key={`filter-div`}>
        <div className="col-sm-4">
          <form onSubmit={(e) => this.onFilterSubmit(e)} onReset={(e) => this.onFilterReset(e)}>
            <div className="input-group">
              <input className="form-control" style={{fontSize: fixCss}} type="text" value={this.props.filter} onChange={(e) => this.props.onFilterChange(e)} placeholder="Text search within results"/>
              <button type="submit" onClick={() => this.filterClickTrack('filter')} className={`btn btn-outline-secondary ${!this.props.filter && "disabled"}`} style={{fontSize: fixCss}}>Filter</button>
              <button type="reset" onClick={() => this.filterClickTrack('clear')} className={`btn btn-outline-secondary ${!this.props.filter && "disabled"}`} style={{fontSize: fixCss}}>Clear</button>
            </div>
          </form>
        </div>
        <div className="col-sm-4">
          <select className="form-select" style={{fontSize: fixCss}} onChange={this.props.onSort}>
            <option value="e_value">Sort by E-value (min to max) - default</option>
            <option value="-e_value">Sort by E-value (max to min)</option>
            <option value="-identity">Sort by Identity (max to min)</option>
            <option value="identity">Sort by Identity: (min to max)</option>
            <option value="-query_coverage">Sort by Query coverage: (max to min)</option>
            <option value="query_coverage">Sort by Query coverage: (min to max)</option>
            <option value="-target_coverage">Sort by Target coverage: (max to min)</option>
            <option value="target_coverage">Sort by Target coverage: (min to max)</option>
          </select>
        </div>
        <div className="col-sm-4">
          <button className="btn btn-outline-secondary mr-1" style={{fontSize: fixCss}} onClick={this.props.onToggleAlignmentsCollapsed}>{this.props.alignmentsCollapsed ? 'See alignments' : 'Hide alignments'}</button>
          <button className="btn btn-outline-secondary mr-1" style={{fontSize: fixCss}} onClick={this.props.onToggleDetailsCollapsed}>{this.props.detailsCollapsed ? 'See details' : 'Hide details'}</button>
          <button className="btn btn-outline-secondary" style={{fontSize: fixCss}} onClick={() => this.onDownload()} disabled={this.props.downloadStatus === "success" ? "" : "disabled"}>{this.props.downloadStatus === "success" ? "Download" : <span><span className={`spinner-border ${fixCss ? '' : 'spinner-border-sm'}`} role="status" aria-hidden="true"></span> Loading</span>}</button>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    alignmentsCollapsed: state.alignmentsCollapsed,
    detailsCollapsed: state.detailsCollapsed,
    filter: state.filter,
    jobId: state.jobId,
    sequence: state.sequence,
    downloadStatus: state.downloadStatus,
    downloadEntries: state.downloadEntries,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleAlignmentsCollapsed: () => dispatch({ type: 'TOGGLE_ALIGNMENTS_COLLAPSED' }),
    onToggleDetailsCollapsed: () => dispatch({ type: 'TOGGLE_DETAILS_COLLAPSED' }),
    onSort: (event) => dispatch(actionCreators.onSort(event)),
    onFilterChange: (event) => dispatch(actionCreators.onFilterChange(event)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Filter);