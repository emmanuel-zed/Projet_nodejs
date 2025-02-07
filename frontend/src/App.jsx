import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import UserProfile from './components/UserProfile';
import AdminDashboard from './components/AdminDashboard';
import './styles/App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Login} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route path="/profile" component={UserProfile} />
          <Route path="/admin" component={AdminDashboard} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;