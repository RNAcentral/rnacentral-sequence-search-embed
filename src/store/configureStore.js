import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';

import initialState from './initialState';
import rootReducer from '../reducers/rootReducer';


export default function configureStore() {
  return createStore(
    rootReducer,
    initialState,  //     window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
    applyMiddleware(thunk)
  );
}
