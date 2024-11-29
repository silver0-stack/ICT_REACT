/*
회원가입 폼 제공
여기서도 로그인 페이지로 가는 링크 추가
*/

// src/components/SignUp.js


import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';


const SignUp = () => {
  const { axiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    memId: '',
    memPw: '',
    memName: '',
    memType: '', // 기본값 설정 (백엔드에서 'USER'로 기본 설정을 했는지 확인)
    memEmail: '',
    memAddress: '',
    memCellphone: '',
    memPhone: '',
    memRnn: '',
    // 기타 필요한 필드 추가...
    photoFile: null,
  })
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photoFile') {
      setFormData({ ...formData, photoFile: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleCheckId = async () => {
    if (!formData.memId) {
      setError('ID를 먼저 입력해주세요.');
      return;
    }
    try {
      const idCheckResponse = await axiosInstance.post('/idchk', null, {
        params: { memId: formData.memId },
      });

      if (idCheckResponse.data.data === 'dup') {
        setError('이미 사용 중인 ID입니다.');
      } else {
        setError('사용 가능한 ID입니다.');
      }
    } catch (err) {
      console.error(err);
      setError('ID 중복 검사 중 오류가 발생했습니다.');
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault(); //폼 제출 시 페이지 새로고침을 방지 -> 비동기적 요청 위함

    // 회원가입 데이터 준비
    const data = new FormData();
    data.append('memId', formData.memId);
    data.append('memPw', formData.memPw);
    data.append('memName', formData.memName);
    data.append('memType', formData.memType);
    data.append('memEmail', formData.memEmail);
    data.append('memAddress', formData.memAddress);
    data.append('memCellphone', formData.memCellphone);
    data.append('memPhone', formData.memPhone);
    data.append('memRnn', formData.memRnn);
    if (formData.photoFile) {
      data.append('photoFile', formData.photoFile);
    }


    try {
      const response = await axiosInstance.post('/enroll', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

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
      {error && <p className={`error-message ${error === '사용 가능한 ID입니다.' ? 'text-success' : 'text-danger'}`}>{error}</p>}
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        {/* 회원 ID */}
        <div className="form-group">
          <label>ID:</label>
          <div className="d-flex">
            <input
              type="text"
              name="memId" // 'userId' → 'memId'
              value={formData.memId}
              onChange={handleChange}
              required
              placeholder="Enter your ID"
              className="form-control"
            />
            <button
              type="button"
              className="btn btn-secondary ms-2"
              onClick={handleCheckId}
              disabled={!formData.memId}
            >
              중복 체크
            </button>
          </div>
        </div>

        {/* 비밀번호 */}
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            name="memPw" // 'userPwd' → 'memPw'
            value={formData.memPw}
            onChange={handleChange}
            required
            placeholder="Enter your password"
            className="form-control"
          />
        </div>

        {/* 이름 */}
        <div className="form-group">
          <label>Name:</label>
          <input
            type="text"
            name="memName" // 'userName' → 'memName'
            value={formData.memName}
            onChange={handleChange}
            required
            placeholder="Enter your name"
            className="form-control"
          />
        </div>

        {/* 회원 타입 */}
        <div className="form-group">
          <label>Type:</label>
          <select name="memType" value={formData.memType} onChange={handleChange} required className="form-select">
            <option value="">Select</option>
            <option value="SENIOR">Senior</option>
            <option value="MANAGER">Manager</option>
            <option value="FAMILY">Family</option>
            <option value="ADMIN">Admin</option>
            <option value="AI">AI</option>
          </select>
        </div>

        {/* 이메일 */}
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="memEmail" // 'email' → 'memEmail'
            value={formData.memEmail}
            onChange={handleChange}
            required
            placeholder="Enter your email"
            className="form-control"
          />
        </div>

        {/* 주소 */}
        <div className="form-group">
          <label>Address:</label>
          <input
            type="text"
            name="memAddress" // 'address' → 'memAddress'
            value={formData.memAddress}
            onChange={handleChange}
            required
            placeholder="Enter your address"
            className="form-control"
          />
        </div>

        {/* 휴대전화 */}
        <div className="form-group">
          <label>Cellphone:</label>
          <input
            type="tel"
            name="memCellphone" // 'phone' → 'memCellphone'
            value={formData.memCellphone}
            onChange={handleChange}
            placeholder="Enter your cellphone number"
            className="form-control"
          />
        </div>

        {/* 일반전화 */}
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="tel"
            name="memPhone" // 'phone' → 'memPhone'
            value={formData.memPhone}
            onChange={handleChange}
            placeholder="Enter your phone number"
            className="form-control"
          />
        </div>

        {/* 주민등록번호 */}
        <div className="form-group">
          <label>RNN:</label>
          <input
            type="text"
            name="memRnn" // 'rnn' → 'memRnn'
            value={formData.memRnn}
            onChange={handleChange}
            required
            placeholder="Enter your RNN"
            className="form-control"
          />
        </div>

        {/* 프로필 사진 */}
        <div className="form-group">
          <label>Profile Photo:</label>
          <input
            type="file"
            name="photoFile"
            accept=".jpg, .jpeg, .png, .gif"
            onChange={handleChange}
            className="form-control"
          />
        </div>

        {/* 제출 버튼 */}
        <button type="submit" className="btn btn-primary mt-3">
          Sign Up
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignUp;
