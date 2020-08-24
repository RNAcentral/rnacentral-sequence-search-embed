import React, {Component} from "react";
import {connect} from "react-redux";
import { MdHelpOutline } from "react-icons/md"
import {FaExternalLinkAlt, FaSearch} from "react-icons/fa"


class R2DT extends Component {
  rnacentralServer(link) {
    let rnacentralLink = "";
    if (link.includes("wwwdev")) {
      rnacentralLink = `https://test.rnacentral.org/r2dt?jobid=${this.props.r2dtJobId}`
    } else {
      rnacentralLink = `https://rnacentral.org/r2dt?jobid=${this.props.r2dtJobId}`
    }
    return rnacentralLink
  }

  render() {
    const h3Style = {
      color: this.props.customStyle && this.props.customStyle.h3Color ? this.props.customStyle.h3Color : "#007c82",
      fontSize: this.props.customStyle && this.props.customStyle.h3Size ? this.props.customStyle.h3Size : "28px",
    };
    const titleStyle = {
      fontSize: this.props.customStyle && this.props.customStyle.facetSize ? this.props.customStyle.facetSize : "20px",
    }
    const searchButtonColor = this.props.customStyle && this.props.customStyle.searchButtonColor ? this.props.customStyle.searchButtonColor : "";
    const fixCss = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "1.5rem" : "";
    const fixCssBtn = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "38px" : "";
    return (
      <div className="row" key={`r2dt-div`}>
        <div className="col-sm-12">
          <div className="mt-3 mb-3">
            <span style={h3Style}>Secondary structure </span>{ this.props.r2dtStatus === "RUNNING" ? <div className={`spinner-border ${fixCss ? '' : 'spinner-border-sm'} mb-1`} role="status" /> : <span style={h3Style}><a className="text-muted" style={{fontSize: "65%", verticalAlign: "10%"}} href="https://rnacentral.org/help/secondary-structure" target="_blank"><MdHelpOutline /></a></span> }
          </div>
          {
            this.props.r2dtSubmissionError && (
              <div className="alert alert-danger">
                { this.props.r2dtSubmissionError }
              </div>
            )
          }
          {
            (this.props.r2dtStatus === "FAILURE" || this.props.r2dtStatus === "ERROR") && (
              <div className="alert alert-danger">
                <p><strong>There was an error</strong></p>
                <span>Let us know if the problem persists by raising an issue on <a href="https://github.com/RNAcentral/r2dt-web/issues" target="_blank">GitHub</a>.</span>
              </div>
            )
          }
          {
            this.props.r2dtStatus === "NOT_FOUND" && (
              <div className="alert alert-warning">
                <p><strong>Job not found</strong></p>
                <span>The results might have expired. If you think this is an error, please let us know by raising an issue on <a href="https://github.com/RNAcentral/r2dt-web/issues" target="_blank">GitHub</a></span>
              </div>
            )
          }
          {
            this.props.r2dtStatus === "FINISHED" && this.props.r2dtThumbnail && (
              <div className="media">
                <a href={this.rnacentralServer(this.props.r2dtThumbnail)} target="_blank">
                  <img className="img-thumbnail mb-3" width="140" height="120" src={this.props.r2dtThumbnail} />
                </a>
                <div className="media-body">
                  <p style={titleStyle} className="ml-3">R2DT</p>
                  <p className="ml-3">Visualise RNA secondary structure in standard orientations using RNA 2D Templates (R2DT).</p>
                  <div className="ml-3"><a href={this.rnacentralServer(this.props.r2dtThumbnail)} className="btn btn-primary" style={{background: searchButtonColor, borderColor: searchButtonColor, fontSize: fixCss, height: fixCssBtn}} role="button" target="_blank"><span className="btn-icon"><FaExternalLinkAlt /></span> Visualise</a></div>
                </div>
              </div>
            )
          }
          {
            this.props.r2dtStatus === "FINISHED" && !this.props.r2dtThumbnail && (
              <div className="mb-3">
                The sequence did not match any of the templates. If you think it's an error, please <a href="https://github.com/RNAcentral/r2dt-web/issues" target="_blank">get in touch</a>.
              </div>
            )
          }
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    r2dtJobId: state.r2dtJobId,
    r2dtStatus: state.r2dtStatus,
    r2dtSubmissionError: state.r2dtSubmissionError,
    r2dtThumbnail: state.r2dtThumbnail,
  };
}

function mapDispatchToProps(dispatch) {
  return {}
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(R2DT);