import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import {
    BrowserRouter as Router,
    Switch,
    Route,
} from 'react-router-dom';
// import LoginPage from './src/pages/LoginPage';

class App extends React.Component {

    render() {
        return (
        <React.StrictMode>
            <Router>
                <Switch>
                    <Route path="/" exact>
                        {<h1>hello world</h1>}
                    </Route>
                </Switch>
            </Router>
        </React.StrictMode>
        );
    }
}

ReactDOM.render(
    <App />,
    document.getElementById('root'),
);