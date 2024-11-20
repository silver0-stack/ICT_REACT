/*
사용자가 로그인할 수 있는 폼을 제공
회원가입 링크도 텍스트로 추가
*/ 
// src/components/Login.js

import React from 'react';
import {Link} from 'react-router-dom';

const Login=()=> {
    return(
        <div style={{ padding: '20px', maxWidth: '300px', margin: 'auto' }}>
        <h2>Login</h2>
        <form>
          <div style={{ marginBottom: '10px' }}>
            <label>Email:</label>
            <input type="email" required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password:</label>
            <input type="password" required style={{ width: '100%', padding: '8px', marginTop: '5px' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: '#fff' }}>
            Login
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    );
};

export default Login;