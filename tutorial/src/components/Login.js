/*
사용자가 로그인할 수 있는 폼을 제공
회원가입 링크도 텍스트로 추가
*/ 
// src/components/Login.js

import React, { useState } from 'react';
import {Link, useNavigate} from 'react-router-dom';

const Login=()=> {
  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const navigate=useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); // ???

    // 서버로 로그인 요청 보내기
    try{
      const response = await fetch('http://localhost:8888/first/api/members/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password });
      });

      const data = await response.json();

      if (response.ok){
        // 로그인 성공 시 메시지 전달
        navigate('/login-response', { state: { message: data.message || '로그인에 성공했습니다!' }});
      }else{
        // 로그인 실패 시 메시지 전달
        navigate('/login-response', { state: { message: data.message || '로그인에 실패했습니다.'}});
      }
    }catch(error){
      console.error('로그인 요청 중 오류 발생: ', error);
      navigate('/login-response', { state: { message: '네트워크가 오류가 발생했습니다. 나중에 다시 시도해주세요.' }});
    }
  };



    return(
        <div style={{ padding: '20px', maxWidth: '300px', margin: 'auto' }}>
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '10px' }}>
            <label>Email:</label>
            <input type="email" 
                   value ={email} 
                   onChange={(e) => setEmail(e.target.value)} 
                   required style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            />
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Password:</label>
            <input type="password"
                   value={password} 
                   onChange={(e) => setPassword(e.target.value)}
                   required style={{ width: '100%', padding: '8px', marginTop: '5px' }} 
            />
          </div>
          <button type="submit" 
                  style={{ width: '100%', padding: '10px', backgroundColor: '#4CAF50', color: '#fff' }}>
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