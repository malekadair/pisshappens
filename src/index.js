import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter as Router } from 'react-router-dom'
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ComicsProvider } from './contexts/ComicsContext'
import { CommentsProvider } from './contexts/CommentsContext'
import { ComicProvider } from './contexts/ComicContext'


ReactDOM.render(
  <React.StrictMode>
    <Router>
      <ComicsProvider>
        <ComicProvider>
          <CommentsProvider>
            <App />
          </CommentsProvider>
        </ComicProvider>
      </ComicsProvider>
    </Router>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
