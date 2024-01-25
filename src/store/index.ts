import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import counter from './counter';
import proofUpload from './proofupload';

const rootReducer = combineReducers({
  counter,
  proofUpload
});

export type AppRootState = ReturnType<typeof rootReducer>;

const createStoreWithMiddleware =
  process.env.NODE_ENV === 'development'
    ? applyMiddleware(
      thunk,
      createLogger({
        collapsed: true,
      }),
    )(createStore)
    : applyMiddleware(
      thunk,
    )(createStore);

function configureAppStore() {
  return createStoreWithMiddleware(
    rootReducer,
  );
}

const store = configureAppStore();

export default store;
