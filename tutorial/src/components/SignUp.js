/*
회원가입 폼 제공
여기서도 로그인 페이지로 가는 링크 추가
*/

// src/components/SignUp.js


import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';


const SignUp = () => {
  const { axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: '',
    userPwd: '',
    userName: '',
    gender: '',
    age: '',
    phone: '',
    email: '',
    photoFile: null,
  })
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photoFile') {
      setFormData({ ...formData, photoFile: files[0] });
    }else{
      setFormData({ ...formData, [name]: value});
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); //폼 제출 시 페이지 새로고침을 방지 -> 비동기적 요청 위함

    // 서버로 회원가입 요청 보내기
    try {
      // ID 중복 체크
      const idCheckResponse = await axios.post('http://localhost:8888/first/api/members/idchk', null, {
        params: { userId: formData.userId },
      });

      if (idCheckResponse.data.data === 'dub') {
        setError('이미 사용 중인 ID입니다.');
        return;
      }
    } catch (err) {
      console.error(err);
      setError('ID 중복 검사 중 오류가 발생했습니다.');
      return;
    }


    // 회원가입 데이터 준비
    const data = new FormData();
    data.append('userId', formData.userId);
    data.append('userPwd', formData.userPwd);
    data.append('userName', formData.userName);
    data.append('gender', formData.gender);
    data.append('age', formData.age);
    data.append('phone', formData.phone);
    data.append('email', formData.email);
    if (formData.photoFile) {
      data.append('photoFile', formData.photoFile);
    }


    try {
      const response = await axiosInstance.post('/enroll', data);

      if (response.data.success) {
        // 회원가입 성공 시 메시지 전달
        navigate('/signup-response', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
      } else {
        setError(response.data.message || '회원가입에 실패했습니다.');
      }
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign Up</h2>
      {error && <p className="error-message">{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <div className="form-group">
          <label>ID:</label>
          <input
            type="text"
            name="userId" // 정확히 'userId'로 설정
            value={formData.userId}
            onChange={handleChange}
            required
            placeholder="Enter your ID"
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="userPwd"
            value={formData.userPwd}
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
        </div>
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            required
            placeholder="Enter your name"
          />
        </div>
        <div className="form-group">
          <label>Gender:</label>
          <select name="gender" value={formData.gender} onChange={handleChange} required>
            <option value="">Select</option>
            <option value="M">Male</option>
            <option value="F">Female</option>
          </select>
        </div>
        <div className="form-group">
          <label>Age:</label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            placeholder="Enter your age"
            min="0"
          />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Enter your phone number"
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group">
          <label>Profile Photo:</label>
          <input
            type="file"
            name="photoFile"
            accept=".jpg, jpeg, .png, .gif"
            onChange={handleChange}
          />
        </div>
        <button type="submit" className="submit-button">
          Sign Up
        </button>
      </form>
      <p>
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignUp;
