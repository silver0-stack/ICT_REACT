// src/pages/MyPage.js

import React, { useContext, useState, useEffect } from 'react';
import { Form, Button, Container, Image, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MyPage = () => {
  const { auth, setAuth, springBootAxiosInstance  } = useContext(AuthContext);
  
  // 초기 상태 설정
  const [userData, setUserData] = useState({
    memUuid: '',
    memId: '',
    memPw: '',
    memName: '',
    gender: '',
    age: '',
    memCellphone: '',
    memPhone: '',
    memEmail: '',
    memRnn: '',
  });
  
  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentProfileUrl, setCurrentProfileUrl]=useState('/default-profile.png');

  const apiBaseUrl = process.env.REACT_APP_SPRING_BOOT_API_URL;


  // 사용자 정보 초기화
  useEffect(() => {
    if (auth.user) {
      setUserData({
        memUuid: auth.user.memUuid,
        memId: auth.user.memId,
        memName: auth.user.memName,
        gender: auth.user.gender,
        age: auth.user.age,
        memCellphone: auth.user.memCellphone,
        memPhone: auth.user.memPhone,
        memEmail: auth.user.memEmail,
        memRnn: auth.user.memRnn,
      });

      // 프로필 사진 URL 설정
      const profileUrl = auth.user.memUuid
      ? `${apiBaseUrl}/api/profile-pictures/${auth.user.memUuid}?t=${new Date().getTime()}` 
      : '/default-profile.png';
      setCurrentProfileUrl(profileUrl);
    }
  }, [apiBaseUrl, auth.user]);

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
  
    const formData = new FormData();
    formData.append('memName', userData.memName);
    formData.append('gender', userData.gender);
    formData.append('age', userData.age);
    formData.append('memCellphone', userData.memCellphone);
    formData.append('memPhone', userData.memPhone);
    formData.append('memEmail', userData.memEmail);
    formData.append('memRnn', userData.memRnn);

    // 비밀번호 변경 시 추가
    if (userData.memPw) {
      formData.append('memPw', userData.memPw);
    }
  
  
    try {
      // PUT 요청 시 파일명 포함하지 않음
      const response = await springBootAxiosInstance.put(`/api/members/${auth.user.memId}`, formData);
      if (response.data.success) {
        toast.success('프로필 수정 성공');
        // 업데이트된 사용자 정보를 AuthContext에 반영
        setAuth(prevAuth => ({
          ...prevAuth,
          user: {
            ...prevAuth.user,
            ...response.data.data, // 서버에서 반환한 전체 사용자 데이터 사용
          },
        }));
      } else {
        toast.error(response.data.message || '프로필 수정 실패');
      }
    } catch (error) {
      toast.error('프로필 수정 중 오류가 발생했습니다.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  const handleProfileUpload = async() => {
    if(!profileImage){
      toast.error('업로드할 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('photoFile', profileImage);

    try{
      const response = await springBootAxiosInstance.post(`/api/profile-pictures/${auth.user.memUuid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if(response.data.success){
        const newProfileUrl = `${apiBaseUrl}/api/profile-pictures/${auth.user.memUuid}?t=${new Date().getTime()}`;
        setAuth((prevAuth) => ({
          ...prevAuth,
          profileImageUrl: newProfileUrl, // AuthContext 업데이트
        }));
        toast.success('프로필 사진 업로드 성공');
        setCurrentProfileUrl(
          `${apiBaseUrl}/api/profile-pictures/${auth.user.memUuid}?t=${new Date().getTime()}`
        );
      }else{
        toast.error(response.data.message || '프로필 사진 업로드 실패');
      }
    }catch(error){
      toast.error('프로필 사진 업로드 중 오류가 발생했습니다.');
      console.error(error);
    }
  };



  const handleProfileDelete = async() => {
    try{
      const response = await springBootAxiosInstance.delete(
        `/api/profile-pictures/${auth.user.memUuid}`
      );
      if(response.data.success){
        toast.success('프로필 삭제 성공');

      // AuthContext의 profileImageUrl을 기본 이미지로 변경
      setAuth((prevAuth) => ({
        ...prevAuth,
        profileImageUrl: '/default-profile.png', // 기본 이미지로 설정
      }));

      // 마이페이지의 로컬 상태도 업데이트
        setCurrentProfileUrl('/default-profile.png');
      }else{
        toast.error(response.data.message || '프로필 사진 삭제 실패');
      }
    }catch(error){
      toast.error('프로필 사진 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <Container className="mt-5">
    <h2>마이페이지</h2>
    <Form onSubmit={handleSubmit}>
      {/* 프로필 사진 */}
      <Form.Group controlId="profileImage" className="mb-3">
          <Form.Label>프로필 사진</Form.Label>
          <div className="mb-3">
            <Image
              src={currentProfileUrl}
              roundedCircle
              width="100"
              height="100"
              alt="Profile"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/default-profile.png';
              }}
            />
          </div>
          <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
          <div className="mt-2">
            <Button variant="primary" onClick={handleProfileUpload}>
              프로필 사진 업로드
            </Button>
            <Button variant="danger" onClick={handleProfileDelete} className="ms-2">
              프로필 사진 삭제
            </Button>
          </div>
        </Form.Group>


      {/* 이름 */}
      <Form.Group controlId="memName" className="mb-3">
        <Form.Label>이름</Form.Label>
        <Form.Control
          type="text"
          name="memName"
          value={userData.memName}
          onChange={handleChange}
          required
        />
      </Form.Group>

      {/* 성별 */}
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

      {/* 나이 */}
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

      {/* 휴대전화 */}
      <Form.Group controlId="memCellphone" className="mb-3">
        <Form.Label>휴대전화번호</Form.Label>
        <Form.Control
          type="tel"
          name="memCellphone"
          value={userData.memCellphone}
          onChange={handleChange}
          required
          placeholder="예: 010-1234-5678"
        />
      </Form.Group>

      {/* 일반전화 */}
      <Form.Group controlId="memPhone" className="mb-3">
        <Form.Label>일반전화번호</Form.Label>
        <Form.Control
          type="tel"
          name="memPhone"
          value={userData.memPhone}
          onChange={handleChange}
          placeholder="예: 02-123-4567"
        />
      </Form.Group>

      {/* 이메일 */}
      <Form.Group controlId="memEmail" className="mb-3">
        <Form.Label>이메일</Form.Label>
        <Form.Control
          type="email"
          name="memEmail"
          value={userData.memEmail}
          onChange={handleChange}
          required
          placeholder="Enter your email"
        />
      </Form.Group>

      {/* 주민등록번호 */}
      <Form.Group controlId="memRnn" className="mb-3">
        <Form.Label>주민등록번호</Form.Label>
        <Form.Control
          type="text"
          name="memRnn"
          value={userData.memRnn}
          onChange={handleChange}
          required
          placeholder="Enter your RNN"
        />
      </Form.Group>

      {/* 필요한 다른 필드 추가 */}

      {/* 제출 버튼 */}
      <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : '프로필 수정'}
        </Button>
    </Form>
  </Container>
  );
};

export default MyPage;



/*
수정 사항 설명:

1. **필드 이름 일치화:**
   - `userId` → `memId`
   - `userName` → `memName`
   - `phone` → `memCellphone` 및 `memPhone`
   - `email` → `memEmail`
   - `rnn` → `memRnn`
   - 등 백엔드와 일치하도록 이름을 수정했습니다.

2. **Axios 인스턴스 사용:**
   - API 호출을 `axiosInstance`를 통해 일관되게 처리하도록 수정했습니다.

3. **프로필 사진 URL 수정:**
   - 프로필 사진을 가져오는 API 경로를 `memId`를 기반으로 수정했습니다.
   - 예: `http://localhost:8888/api/profile-pictures/${userData.memId}`

4. **에러 처리 및 사용자 경험 개선:**
   - 에러 메시지 및 성공 메시지를 `toast`를 사용하여 사용자에게 시각적으로 피드백을 제공합니다.
*/