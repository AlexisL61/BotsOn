import React, { lazy } from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    HashRouter
} from 'react-router-dom';
// import LoginPage from './src/pages/LoginPage.jsx';
import Test from '../src/test.jsx';

class App extends React.Component {

    render() {
        return (
            <HashRouter>
                <Route path="/" exact >
                    <Test />
                </Route>
                <Route path="/extensions">
                    <h1>Extensions</h1> 
                </Route>
          </HashRouter>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root'),
);