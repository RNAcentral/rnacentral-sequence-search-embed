import React from 'react';


class About extends React.Component {
  render() {
    return (
      <div className="row">
        <div className="col-lg-12">
          <div className="hpanel">
            <div className="panel-heading">
              <h1>About</h1>
            </div>
            <div className="panel-body">
              <p>
                RNA sequence search is maintained by RNAcentral consortium and is used to
                search a subset of RNAcentral consortium member databases for non-coding RNA
                sequences.
              </p>
              <p>
                Under the hood, this search is powered with NHMMER program, distributed over
                EBI Embassy cloud infrastructure.
              </p>
              <p>
                RNA search allows to filter found sequences, using facets, provided by EBI search service.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default About;
