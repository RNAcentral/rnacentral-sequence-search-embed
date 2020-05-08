import React, {Component} from 'react';
import {connect} from 'react-redux';
import * as actionCreators from 'actions/actions';

class Admin extends Component {
    render() {
        const linkColor = this.props.customStyle && this.props.customStyle.linkColor ? this.props.customStyle.linkColor : "#337ab7";
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
                        <h5 className="card-title">
                            Number of consumers {this.props.consumers.length}
                            <a className="custom-link ml-3" style={{color: linkColor, fontSize: "65%"}} onClick={() => this.props.numberOfConsumers()}>update</a>
                        </h5>
                        <p className="card-text">...</p>
                    </div> : '' }
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
  showAdmin: state.showAdmin,
  consumers: state.consumers,
});

const mapDispatchToProps = (dispatch) => ({
  onShowAdmin: () => dispatch(actionCreators.onShowAdmin()),
  numberOfConsumers: () => dispatch(actionCreators.numberOfConsumers()),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Admin);

