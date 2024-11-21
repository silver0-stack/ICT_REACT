/*
홈페이지 상단에 고정된 메뉴바를 나타냄
Home, About, Login 등을 링크로 설정
*/ 

// src/components/NavBar.js

import React,  { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const NavBar = () => {
  const { auth, logout} = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () =>{
    logout()
    navigate('/login');
  }

    return(
        <nav className="navbar">
          <ul className="nav-list">
            <li>
              <Link to="/" className="nav-link">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="nav-link">
                About
              </Link>
            </li>
            { auth.accessToken ? (
              <>
                <li>
                  <Link to="/dashboard" className="nav-link">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <button onClick={handleLogout} className="nav-link-button">
                    Logout
                  </button>
                </li>
              </>
            ): (
              <>
                <li>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="nav-link">
                    Sign Up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
    );
};

export default NavBar;