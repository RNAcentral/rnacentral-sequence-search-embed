import React, {Component} from "react";
import {connect} from "react-redux";
import * as actionCreators from "actions/actions";
import { MdHelpOutline } from "react-icons/md"


class Rfam extends Component {
  render() {
    const h3Style = {
      color: this.props.customStyle && this.props.customStyle.h3Color ? this.props.customStyle.h3Color : "#007c82",
      fontSize: this.props.customStyle && this.props.customStyle.h3Size ? this.props.customStyle.h3Size : "28px",
    };
    const fixCss = this.props.customStyle && this.props.customStyle.fixCss && this.props.customStyle.fixCss === "true" ? "1.5rem" : "";
    const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";
    const showRfamAlignment = !!(this.props.customStyle && this.props.customStyle.showRfamAlignment);
    return (
      <div className="row">
        <div className="col-sm-12 mt-3">
          <span style={h3Style}>Rfam classification </span>{ this.props.infernalStatus === "loading" ? <div className={`spinner-border ${fixCss ? '' : 'spinner-border-sm'} mb-1`} role="status" /> : <span style={h3Style}><a className="text-muted" style={{fontSize: "65%", verticalAlign: "10%"}} href="https://rnacentral.org/help/sequence-search#rfam" target="_blank"><MdHelpOutline /></a></span> }
          { this.props.infernalStatus === "loading" ? '' : this.props.infernalStatus === "success" && this.props.infernalEntries.length ? [
            <div className="table-responsive mt-3" key={`rfam-div`}>
              <table className="table">
                <thead>
                  <tr>
                    <th>Family</th>
                    <th>Accession</th>
                    <th>Start</th>
                    <th>End</th>
                    <th>Bit score</th>
                    <th>E-value</th>
                    <th>Strand</th>
                    {showRfamAlignment ? null : <th>Alignment</th>}
                  </tr>
                </thead>
                <tbody>
                {this.props.infernalEntries.map((entry, index) => (
                  <React.Fragment key={`react-fragment-${index}`}>
                    <tr className="noBorder">
                      <td><a className="custom-link" style={{color: linkColor}} href={`https://rfam.org/family/${entry.target_name}`} target="_blank">{entry.description}</a></td>
                      <td><a className="custom-link" style={{color: linkColor}} href={`https://rfam.org/family/${entry.accession_rfam}`} target="_blank">{entry.accession_rfam}</a></td>
                      <td>{entry.seq_from}</td>
                      <td>{entry.seq_to}</td>
                      <td>{entry.score}</td>
                      <td>{entry.e_value}</td>
                      <td>{entry.strand}</td>
                      {showRfamAlignment ? null :
                        <td>
                          {
                            entry.alignment ?
                            <a className="custom-link" onClick={ this.props.onToggleInfernalAlignmentsCollapsed }>
                              { this.props.infernalAlignmentsCollapsed ? <span style={{color: linkColor}}>&#x25B6; Show</span> : <span style={{color: linkColor}}>&#x25BC; Hide</span> }
                            </a> : "Not available"
                          }
                        </td>
                      }
                    </tr>
                    {
                      showRfamAlignment ?
                        <tr>
                          <td className="alignment-rfam-td" colSpan={7}>
                            <div className="alignment-rfam">{ entry.alignment + '\n' }</div>
                          </td>
                        </tr> : this.props.infernalAlignmentsCollapsed ? null :
                        <tr>
                          <td className="alignment-rfam-td" colSpan={8}>
                            <div className="alignment-rfam">{ entry.alignment + '\n' }</div>
                          </td>
                        </tr>
                    }
                  </React.Fragment>
                ))}
                </tbody>
              </table>
            </div>
          ] : <div className="mt-3 media">The query sequence did not match any <img src={'https://rnacentral.org/static/img/expert-db-logos/rfam.png'} alt="Rfam logo" style={{width: "5%"}}/> <div className="media-body ml-1">families</div>.</div>}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    infernalStatus: state.infernalStatus,
    infernalEntries: state.infernalEntries,
    infernalAlignmentsCollapsed: state.infernalAlignmentsCollapsed,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    onToggleInfernalAlignmentsCollapsed: (event) => dispatch(actionCreators.toggleInfernalAlignmentsCollapsed(event)),
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Rfam);