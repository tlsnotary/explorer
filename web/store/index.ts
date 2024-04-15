import { applyMiddleware, combineReducers, createStore } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';
import proofUpload from './proofupload';
import notaryKey from './notaryKey';
import proofs from './proofs';

const rootReducer = combineReducers({
  proofUpload,
  notaryKey,
  proofs,
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
    : applyMiddleware(thunk)(createStore);

function configureAppStore(preloadedState?: AppRootState) {
  const { proofUpload, notaryKey, proofs } = preloadedState || {};
  return createStoreWithMiddleware(rootReducer, {
    proofs,
    proofUpload,
    notaryKey,
  });
}

export default configureAppStore;
