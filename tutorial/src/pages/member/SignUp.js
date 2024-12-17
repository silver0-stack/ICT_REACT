/*
회원가입 폼 제공
여기서도 로그인 페이지로 가는 링크 추가
*/

// src/components/SignUp.js


import React, { useState, useContext } from "react";
import { Form, Link, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';


const SignUp = () => {
  const { springBootAxiosInstance } = useContext(AuthContext);
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
  })
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const [isIdChecked, setIdChecked] = useState(false); // ID 중복 체크 여부 상태
  const [photoFile, setPhotoFile] = useState(null); // 프로필 이미지 파일 상태
  const [profilePreview, setProfilePreview] = useState('/default-profile.png'); // 프로필 사진 미리보기 URL


  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'photoFile') {
      const file = files[0];
      setPhotoFile(file);
      setProfilePreview(URL.createObjectURL(file)); // 이미지 미리보기
    } else {
      setFormData({ ...formData, [name]: value });
    }

    if (name === 'memId') setIdChecked(false); // ID가 변경되면 중복 체크 상태 초기화

  };

  const handleCheckId = async () => {
    if (!formData.memId) {
      setError('ID를 먼저 입력해주세요.');
      return;
    }
    try {
      const idCheckResponse = await springBootAxiosInstance.post('/api/members/idchk', null, {
        params: { memId: formData.memId },
      });

      if (idCheckResponse.data.data === 'dup') {
        setError('이미 사용 중인 ID입니다.');
        setIdChecked(false); // 중복된 경우 체크 실패
      } else {
        setError('사용 가능한 ID입니다.');
        setIdChecked(true); // 중복 체크 통과한 경우 중복 체크 완료
      }
    } catch (err) {
      console.error(err);
      setError('ID 중복 검사 중 오류가 발생했습니다.');
    }
  };



  // 회원가입 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault(); //폼 제출 시 페이지 새로고침을 방지 -> 비동기적 요청 위함

    if (!isIdChecked) { // 중복 체크 완료 여부 확인
      alert("아이디 중복 체크를 완료해주세요.");
      return;
    }
    setLoading(true); // 로딩 시작

    try {
      //* 1. 회원가입 요청 (사진 제외)
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value); // formData에 추가
      });


      // 회원가입 요청 (프로필 사진 제외)
      const response = await springBootAxiosInstance.post('/api/members/enroll', formDataToSend);
      if (!response.data.success) {
        throw new Error(response.data.message || '회원가입에 실패했습니다.');
      }

      const memUuid = response.data?.data?.memUuid; // 서버로부터 memUuid 받아오기
      if (!memUuid) {
        throw new Error('서버로부터 memUuid를 받지 못했습니다.');
      }

      //* 2. 프로필 이미지 업로드 요청
      if (photoFile) {
        const profileFormData = new FormData();
        profileFormData.append('photoFile', photoFile);

        const uploadResponse = await springBootAxiosInstance.post(
          `/api/profile-pictures/${memUuid}`,
          profileFormData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        if (!uploadResponse.data.success) {
          throw new Error(uploadResponse.data.message || '프로필 사진 업로드 실패');
        }

        toast.success('프로필 사진이 성공적으로 업로드되었습니다.');
      }

      toast.success('회원가입이 완료되었습니다.');
      navigate('/signup-response', { state: { message: '회원가입이 완료되었습니다. 로그인해주세요.' } });
    } catch (error) {
      console.error(error);
      setError(error.response?.data?.message || '회원가입 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  // 프로필 이미지 삭제 핸들러
  const handleDeleteProfileImage = () => {
    setPhotoFile(null);
    setProfilePreview('/default-profile.png'); // 기본 이미지로 설정
    toast.info('프로필 이미지가 삭제되었습니다.');
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
          <div>
            <img src={profilePreview} alt="Profile Preview" style={{ width: '100px', borderRadius: '50%' }} />
          </div>
          <input type="file" name="photoFile" accept="image/*" onChange={handleChange} />
          {photoFile && (
            <button type="button" onClick={handleDeleteProfileImage} className="btn btn-danger mt-2">
              프로필 사진 삭제
            </button>
          )}
        </div>

        <button type="submit" className="btn btn-primary mt-3" disabled={loading}>
          {loading ? '처리 중...' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-3">
        Already have an account? <Link to="/login">Login</Link>
      </p>
    </div>
  );
};

export default SignUp;
