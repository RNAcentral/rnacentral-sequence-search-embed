import React from 'react';


class Error extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="hpanel">
            <div className="panel-heading">
              <h1>Error</h1>
            </div>
            <div className="panel-body">
              <div className="callout alert">
                <h3>Got an error, while delegating the task to consumers.</h3>
                <p><a href="mailto:rnacentral@gmail.com">Contact us</a> if the problem persists.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Error;
