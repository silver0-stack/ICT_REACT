/* 
사용자가 로그인할 수 있는 폼을 제공
회원가입 링크도 텍스트로 추가
백엔드와 연동하여 인증 토큰을 받아 저장한다.
*/ 
// src/components/Login.js

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from "../context/AuthContext";
import axios from 'axios';
 

const Login = () => {
  const { setAuth, axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  const [email, setEmail] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 제출 시 페이지 새로고침을 방지, 이를 통해 상태를 유지하면서 비동기적으로 요청을 보낼 수 있음

    // 서버로 로그인 요청 보내기
    try {
      const response = await axiosInstance.post('/login', {
        userId: email, //  백엔드의 User DTO에 맞게 필드명 조정
        userPwd: password,
      });


      if (response.data.success) {
        // 로그인 성공 시
        const{ accessToken, refreshToken, member } = response.data.data;
        setAuth({
          accessToken,
          refreshToken,
          user: member,
        });
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(member));
        navigate('/'); // 로그인 성공 시 대시보드로 이동
      }else{
        // 로그인 실패 시
        setError(response.data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || '로그인 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>ID:</label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
            />
            </div>
            <div className="form-group">
              <label>Password:</label>
              <input
                type="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                />
            </div>
            <button type="submit" className="submit-button">
              Login
            </button>
      </form>
      <p>
        Don't have an account? <Link to="/signup">Sign Up</Link>
      </p>
    </div>
  );
};

export default Login;
