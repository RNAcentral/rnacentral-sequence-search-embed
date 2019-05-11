import * as types from './actionTypes';
import routes from 'services/routes.jsx';


export function toggleAlignmentsCollapsed() {
  return {type: types.TOGGLE_ALIGNMENTS_COLLAPSED };
}

export function fetchRNAcentralDatabases() {
  return dispatch => {
    dispatch(requestPosts(subreddit));
    return fetch(routes.rnacentralDatabases(), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => dispatch({type: types.FETCH_RNACENTRAL_DATABASES, status: 'success', data: data}));
  }
}

