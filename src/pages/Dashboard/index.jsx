import React from 'react';

import routes from 'services/routes.jsx';


class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      consumers: [],
      jobs: []
    };

    this.pollConsumersStatus = this.pollConsumersStatus.bind(this);
    this.pollJobsStatus = this.pollJobsStatus.bind(this);
    this.consumerStatusIcon = this.consumerStatusIcon.bind(this);
  }

  pollConsumersStatus() {
    fetch(routes.consumersStatuses())
      .then(response => response.json())
      .then(data => {
        this.setState({ consumers: data });
        this.consumerStatusTimeout = setTimeout(this.pollConsumersStatus, 1000);
      })
      .catch(reason => this.props.history.push(`/error`));
  }

  pollJobsStatus() {
    fetch(routes.jobsStatuses())
      .then(response => response.json())
      .then(data => {
        this.setState({ jobs: data });
        this.jobsStatusTimeout = setTimeout(this.pollJobsStatus, 1000);
      })
      .catch(reason => this.props.history.push('/error'));
  }

  consumerStatusIcon(status) {
    if (status === 'available') return (<i className="icon icon-functional" style={{color: "green"}} data-icon="/"/>);
    else if (status === 'busy') return (<i className="icon icon-functional spin" data-icon="s"/>);
    else if (status === 'error') return (<i className="icon icon-generic" style={{color: "red"}} data-icon="l"/>);
  }

  jobStatusIcon(status) {
    if (status === 'success') return (<i className="icon icon-functional" style={{color: "green"}} data-icon="/"/>);
    else if (status === 'pending') return (<i className="icon icon-generic" data-icon="{"/>);
    else if (status === 'started') return (<i className="icon icon-functional spin" data-icon="s"/>);
    else if (status === 'error') return (<i className="icon icon-generic" style={{color: "red"}} data-icon="l"/>);
  }

  componentDidMount() {
    this.pollConsumersStatus();
    this.pollJobsStatus();
  }

  componentWillUnmount() {
    if (this.consumerStatusTimeout) {
      window.clearTimeout(this.consumerStatusTimeout);
      window.clearTimeout(this.jobsStatusTimeout);
    }
  }

  render() {
    return [
      <div key="consumers" className="row">
        <div className="col-lg-12">
          <div className="hpanel">
            <div className="panel-heading">
              <h1>Consumers</h1>
            </div>
            <div className="panel-body">
              <table className="responsive-table">
                <thead>
                  <tr>
                    <th>Consumer</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  { this.state.consumers.map((consumer, index) => (
                    <tr key={index}>
                      <td>{ consumer.ip }</td>
                      <td>{ this.consumerStatusIcon(consumer.status) } { consumer.status }</td>
                    </tr>)) }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>,
      <div key="jobs" className="row">
        <div className="col-lg-12">
          <div className="hpanel">
            <div className="panel-heading">
              <h1>Jobs</h1>
            </div>
            <div className="panel-body">
              { this.state.jobs.map((job, index) => (
                <table key={`job-${job.id}`} className="responsive-table">
                  <thead>
                    <tr>
                      <th>Job: {job.id}</th>
                      <th>Status: { this.jobStatusIcon(job.status) } { job.status }</th>
                      <th>Submitted: { job.submitted }</th>
                    </tr>
                  </thead>
                  <tbody>
                    { job.chunks.map((chunk, chunkIndex) => (
                      <tr key={`jobChunk-${chunkIndex}`}>
                        <td>Database: { chunk.database }</td>
                        <td>Status: { this.jobStatusIcon(chunk.status) } { chunk.status }</td>
                        <td>Consumer: { chunk.consumer }</td>
                      </tr>
                    )) }
                  </tbody>
                </table>
              )) }
            </div>
          </div>
        </div>
      </div>
    ]
  }
}

export default Dashboard;