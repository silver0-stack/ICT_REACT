/*
모든 컴포넌트를 조합하고, react-router-dom 을 사용해 페이지 간 네비게이션을 설정
*/

// src/App.js

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Footer from './components/Footer';
import Login from './components/Login';
import SignUp from './components/SignUp';


function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ minHeight: '80vh', padding: '20px' }}>
        <Routes>
          <Route path="/" element={<h1>Welcome to the Home Page!</h1>} />
          <Route path="/about" element={<h1>About Us</h1>} />
          <Route path="/login" element={<Login />}/>
          <Route path="/signup" element={<SignUp/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;