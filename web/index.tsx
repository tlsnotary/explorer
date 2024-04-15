import 'isomorphic-fetch';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import type {} from 'redux-thunk/extend-redux';
import configureAppStore from './store';
import App from './pages/App';

// @ts-ignore
const store = configureAppStore(window.__PRELOADED_STATE__);
// @ts-ignore
delete window.__PRELOADED_STATE__;

(async () => {
  ReactDOM.hydrate(
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>,
    document.getElementById('root'),
  );
})();

if ((module as any).hot) {
  (module as any).hot.accept();
}
