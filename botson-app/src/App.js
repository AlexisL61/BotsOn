import React from 'react';
import {
  BrowserRouter as Router,
  Route,
  Switch,
} from 'react-router-dom';

export default class App extends React.Component {

  render() {
    return (
      <React.StrictMode>
        <Router>
          <Switch>
            <Route path="/home" exact>
              <h1>Test</h1>
            </Route>
            <Route path="/settings">
              <h1>Test2</h1>
            </Route>
            <Route path="/" exact>
              <h1>Test3</h1>
            </Route>
          </Switch>
        </Router>
      </React.StrictMode>
    );
  }
}
