// src/pages/MyPage.js

import React, { useContext, useState, useEffect } from 'react';
import { Form, Button, Container, Image, Spinner } from 'react-bootstrap';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-toastify';

const MyPage = () => {
  const { auth, setAuth, axiosInstance } = useContext(AuthContext);
  
  // 올바른 구조 분해 할당 사용
  const [userData, setUserData] = useState({
    userId: '',
    userName: '',
    gender: '',
    age: 0,
    phone: '',
    email: '',
    photoFileName: '',
    // 필요한 다른 필드 추가
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (auth.user) {
      setUserData({
        userId: auth.user.userId,
        userName: auth.user.userName,
        gender: auth.user.gender,
        age: auth.user.age,
        phone: auth.user.phone,
        email: auth.user.email,
        photoFileName: auth.user.photoFileName, // 서버에서 반환한 전체 파일명 포함(userId_originalFileName.ext)
        // 필요한 다른 필드 추가
      });
    }
  }, [auth.user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prevData => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // 클라이언트 측 유효성 검사
    if (!/\S+@\S+\.\S+/.test(userData.email)) {
      toast.error('유효한 이메일 주소를 입력해주세요.');
      setLoading(false);
      return;
    }
  
    if (!/^\d{3}-\d{3,4}-\d{4}$/.test(userData.phone)) {
      toast.error('유효한 전화번호 형식을 입력해주세요. (예: 010-1234-5678)');
      setLoading(false);
      return;
    }
  
    const formData = new FormData();
    formData.append('userName', userData.userName);
    formData.append('gender', userData.gender);
    formData.append('age', userData.age);
    formData.append('phone', userData.phone);
    formData.append('email', userData.email);
  
    // 비밀번호 변경 시 추가
    if (userData.userPwd) {
      formData.append('userPwd', userData.userPwd);
    }
  
    if (profileImage) {
      formData.append('photoFile', profileImage);
    }
  
    try {
      // PUT 요청 시 파일명 포함하지 않음
      const response = await axiosInstance.put(`${userData.userId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success) {
        toast.success('프로필이 성공적으로 수정되었습니다.');
        // 업데이트된 사용자 정보를 AuthContext에 반영
        setAuth(prevAuth => ({
          ...prevAuth,
          user: {
            ...prevAuth.user,
            ...response.data.data, // 서버에서 반환한 전체 사용자 데이터 사용
          },
        }));
      } else {
        toast.error(response.data.message || '프로필 수정에 실패했습니다.');
      }
    } catch (error) {
      console.error('프로필 수정 오류:', error);
      if (error.response && error.response.status === 403) {
        toast.error('권한이 없습니다. 관리자에게 문의해주세요.');
      } else if (error.response && error.response.status === 409) {
        toast.error('데이터 충돌이 발생했습니다. 다시 시도해주세요.');
      } else {
        toast.error('프로필 수정 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const profileImageUrl = userData.photoFileName
    ? `http://localhost:8888/first/api/members/photo/${userData.photoFileName}?t=${new Date().getTime()}`
    : '/default-profile.png';

  return (
    <Container className="mt-5">
      <h2>마이페이지</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="profileImage" className="mb-3">
          <Form.Label>프로필 사진</Form.Label>
          <div className="mb-3">
            <Image 
              src={profileImageUrl} 
              roundedCircle 
              width="100" 
              height="100" 
              alt="Profile" 
              onError={(e) => { e.target.onerror = null; e.target.src = '/default-profile.png'; }}
            />
          </div>
          <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
        </Form.Group>

        <Form.Group controlId="userName" className="mb-3">
          <Form.Label>이름</Form.Label>
          <Form.Control
            type="text"
            name="userName"
            value={userData.userName}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="gender" className="mb-3">
          <Form.Label>성별</Form.Label>
          <Form.Control
            as="select"
            name="gender"
            value={userData.gender}
            onChange={handleChange}
            required
          >
            <option value="">선택하세요</option>
            <option value="M">남성</option>
            <option value="F">여성</option>
            <option value="O">기타</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="age" className="mb-3">
          <Form.Label>나이</Form.Label>
          <Form.Control
            type="number"
            name="age"
            value={userData.age}
            onChange={handleChange}
            min="0"
            max="150"
            required
          />
        </Form.Group>

        <Form.Group controlId="phone" className="mb-3">
          <Form.Label>전화번호</Form.Label>
          <Form.Control
            type="text"
            name="phone"
            value={userData.phone}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="email" className="mb-3">
          <Form.Label>이메일</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        {/* 필요한 다른 필드 추가 */}

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : '프로필 수정'}
        </Button>
      </Form>
    </Container>
  );
};

export default MyPage;
