/*
홈페이지 상단에 고정된 메뉴바를 나타냄
Home, About, Login 등을 링크로 설정
*/ 

// src/components/NavBar.js

import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => {
    return(
        <nav style={{ padding: '10px', background: '#333', color: '#fff' }}>
        <ul style={{ listStyle: 'none', display: 'flex', justifyContent: 'space-around' }}>
          <li><Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>Home</Link></li>
          <li><Link to="/about" style={{ color: '#fff', textDecoration: 'none' }}>About</Link></li>
          <li><Link to="/login" style={{ color: '#fff', textDecoration: 'none' }}>Login</Link></li>
        </ul>
      </nav>
    );
};

export default NavBar;