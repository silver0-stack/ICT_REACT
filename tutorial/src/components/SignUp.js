/*
회원가입 폼 제공
여기서도 로그인 페이지로 가는 링크 추가
*/ 

// src/components/SignUp.js
import React from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
    return (
        <div style={{ padding: '20px', maxWidth: '300px', margin: 'auto' }}>
        <h2>Sign Up</h2>
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
            Sign Up
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '10px' }}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    );
};

export default SignUp;