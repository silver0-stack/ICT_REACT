/*
회원가입 폼 제공
여기서도 로그인 페이지로 가는 링크 추가
*/

// src/components/SignUp.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); //폼 제출 시 페이지 새로고침을 방지 -> 비동기적 요청 위함
    
    // 서버로 회원가입 요청 보내기
    try{
      const response=await fetch('http://localhost:8888/first/api/members/enroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),  // 회원가입에 필요한 데이터
      });

    const data=response.json();

    if(response.ok){
      // 회원가입 성공 시 메시지 전달
      navigate('/signup-response', { state: {message: data.message || '회원가입에 성공했습니다!' }});
    }else{
      // 회원가입 실패 시 메시지 전달
      navigate('/signup-response', { state: {message: data.message || '회원가입에 실패했습니다. 다시 시도해주세요.' }});
    }
    }catch(error){
      
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "300px", margin: "auto" }}>
      <h2>Sign Up</h2>
      <form>
        <div style={{ marginBottom: "10px" }}>
          <label>Email:</label>
          <input
            type="email"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Password:</label>
          <input
            type="password"
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#4CAF50",
            color: "#fff",
          }}
        >
          Sign Up
        </button>
      </form>
      <p style={{ textAlign: "center", marginTop: "10px" }}>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignUp;
