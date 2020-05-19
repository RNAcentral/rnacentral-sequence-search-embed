import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/actions';

class Admin extends Component {
    render() {
        const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";
        const last_job = this.props.jobsStatuses ? this.props.jobsStatuses[0] : '';
        const consumers = this.props.consumers;
        const unfinished_jobs = this.props.jobsStatuses.filter(job => job.status !== 'success' && job.status !== 'partial_success');
        return (
            <div className="mb-3">
                <div className="card">
                    <div className="card-header">
                        <a className="custom-link" onClick={ this.props.onShowAdmin }>
                            { this.props.showAdmin ? <span style={{color: linkColor}}>&#x25BC; Hide</span> : <span style={{color: linkColor}}>&#x25B6; Show</span> }
                        </a>
                    </div>
                    { this.props.showAdmin ?
                    <div className="card-body">
                        <div className="row">
                            { last_job ? <div className="col-sm-12 mb-3">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Last job</h5>
                                        <table key="last-job" className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Job: {last_job.id}</th>
                                                    <th>Status: { last_job.status }</th>
                                                    <th>Submitted: { last_job.submitted }</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {last_job.chunks.map((chunk, chunkIndex) => (
                                                    <tr key={`jobChunk-${chunkIndex}`}>
                                                        <td>Database: {chunk.database}</td>
                                                        <td>Status: {chunk.status}</td>
                                                        <td>Consumer: {chunk.consumer}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div> : '' }
                            <div className="col-sm-4">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Number of consumers {consumers.length} <a className="custom-link ml-3" style={{color: linkColor, fontSize: "65%"}} onClick={() => this.props.numberOfConsumers()}>update</a></h5>
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Consumer</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                { consumers.map((consumer, index) => (
                                                    <tr key={index}>
                                                        <td>{consumer.ip}</td>
                                                        <td>{consumer.status}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            <div className="col-sm-8">
                                <div className="card">
                                    <div className="card-body">
                                        <h5 className="card-title">Number of unfinished jobs: {unfinished_jobs.length}</h5>
                                        {unfinished_jobs.map((job, index) => (
                                            <table key={`job-${job.id}`} className="table table-striped">
                                                <thead>
                                                    <tr>
                                                        <th>Job: {job.id}</th>
                                                        <th>Status: { job.status }</th>
                                                        <th>Submitted: { job.submitted }</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {job.chunks.map((chunk, chunkIndex) => (
                                                        <tr key={`jobChunk-${chunkIndex}`}>
                                                            <td>Database: {chunk.database}</td>
                                                            <td>Status: {chunk.status}</td>
                                                            <td>Consumer: {chunk.consumer}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : '' }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
  showAdmin: state.showAdmin,
  consumers: state.consumers,
  jobsStatuses: state.jobsStatuses,
});

const mapDispatchToProps = (dispatch) => ({
  onShowAdmin: () => dispatch(actionCreators.onShowAdmin()),
  numberOfConsumers: () => dispatch(actionCreators.numberOfConsumers()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Admin);

