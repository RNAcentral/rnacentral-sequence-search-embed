import * as types from './actionTypes';
import routes from 'services/routes.jsx';


export function toggleAlignmentsCollapsed() {
  return {type: types.TOGGLE_ALIGNMENTS_COLLAPSED };
}

export function fetchRNAcentralDatabases() {
  return function(dispatch) {
    return fetch(routes.rnacentralDatabases(), {
      method: 'GET',
      mode: 'cors',
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(response => response.json())
    .then(data => dispatch(fetchRNAcentralDatabasesSuccess(data)));
  }
}

export function fetchRNAcentralDatabasesSuccess(data) {
  return {type: types.FETCH_RNACENTRAL_DATABASES, status: 'success', data: data}
}

export function textareaChange() {
  return {type: types.TEXT_AREA_CHANGE, value: value}
}

export function onSumbit() {
  return {type: types.SUBMIT_JOB}
}

export function onSequenceTextAreaChange(sequence) {
  return {type: types.TEXTAREA_CHANGE, sequence: sequence}
}

export function onDatabaseCheckboxToggle() {
  return {type: types.TOGGLE_DATABASE_CHECKBOX}
}

export function onSelectAllDatabases() {
  return {type: types.SELECT_ALL_DATABASES}
}

export function onDeselectAllDatabases() {
  return {type: types.DESELECT_ALL_DATABASES}
}

export function onToggleDatabasesCollapsed() {
  return {type: types.TOGGLE_DATABASES_COLLAPSED}
}

export function onExampleSequence(sequence) {
  return {type: types.EXAMPLE_SEQUENCE, sequence: sequence}
}

export function onClearSequence() {
  return {type: types.CLEAR_SEQUENCE}
}

export function onFileUpload () {
  return {type: types.FILE_UPLOAD}
}