import * as types from './actionTypes';
import routes from 'services/routes.jsx';


export function receiveStuff(json) {
  return {type: types.RECEIVE_STUFF, stuff: json.stuff};
}

export function fetchStuff() {
  return dispatch => {
    return fetch(routes.facets(), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(json => dispatch(receiveStuff(json)));
  };
}

export function toggleAlignmentsCollapsed() {
  return {type: types.TOGGLE_ALIGNMENTS_COLLAPSED };
}

export function fetchRNAcentralDatabases() {
  return dispatch => {
    dispatch(requestPosts(subreddit));
    return fetch(routes.rnacentralDatabases())
      .then(response => response.json())
      .then(data => dispatch({type: types.FETCH_RNACENTRAL_DATABASES, status: success, data: data}));
  }
}

export function fetchRNAcentralDatabasesSuccess(data) {
  let rnacentralDatabases = data.map(database => database.id);

  let selectedDatabases = {};
  data.map(database => { selectedDatabases[database.id] = false });

  let rnacentralDatabaseLabels = {};
  data.map(database => { rnacentralDatabaseLabels[database.id] =  database.label });

  this.setState({
    rnacentralDatabases: rnacentralDatabases,
    selectedDatabases: selectedDatabases,
    rnacentralDatabaseLabels: rnacentralDatabaseLabels
  });
}

export function fetchRNAcentralDatabasesError() {

}
