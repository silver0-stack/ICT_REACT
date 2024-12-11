// src/pages/MyPage.js

import React, { useContext, useState, useEffect } from 'react';
import { Form, Button, Container, Image, Spinner } from 'react-bootstrap';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const MyPage = () => {
  const { auth, setAuth, springBootAxiosInstance } = useContext(AuthContext);

  // 초기 상태 설정
  const [userData, setUserData] = useState({
    memId: '',
    memName: '',
    memCellphone: '',
    memPhone: '',
    memEmail: '',
    memAddress: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentProfileUrl, setCurrentProfileUrl] = useState('/default-profile.png');

  const apiBaseUrl = process.env.REACT_APP_SPRING_BOOT_API_URL;


  // 사용자 정보 초기화
  useEffect(() => {
    if (auth.user) {
      // setAuth({

      // })
      setUserData({
        memUuid: auth.user.memUuid, // 반드시 포함
        memId: auth.user.memId,
        memName: auth.user.memName,
        memCellphone: auth.user.memCellphone,
        memPhone: auth.user.memPhone,
        memEmail: auth.user.memEmail,
        memAddress: auth.user.memAddress,
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
    setUserData((prevData) => ({
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


    //! 변경된 데이터만 전송 (null 또는 빈 값 제외)
    const filteredData = Object.fromEntries(
      Object.entries(userData).filter(([_, value]) => value !== null && value !== "")
    );


    console.log("Filtered Data:", filteredData); // 디버깅용 로그 추가

    try {
      // PUT 요청 시 파일명 포함하지 않음
      const response = await springBootAxiosInstance.put(`/api/members/${auth.user.memId}`, filteredData, // JSON으로 전달
        {
          headers: {
            "Content-Type": "application/json", // JSON 형식으로 전달
          },
        }
      );
      if (response.data.success) {
        toast.success('프로필 수정 성공');


        // 업데이트된 사용자 정보를 AuthContext에 반영
        setAuth(prevAuth => ({
          ...prevAuth,
          user: response.data.data, // 서버에서 반환한 전체 사용자 데이터 사용
        }));

        console.log("Server response:", response.data.data);

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


  const handleProfileUpload = async () => {
    if (!profileImage) {
      toast.error('업로드할 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('photoFile', profileImage);

    try {
      const response = await springBootAxiosInstance.post(`/api/profile-pictures/${auth.user.memUuid}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      if (response.data.success) {
        const newProfileUrl = `${apiBaseUrl}/api/profile-pictures/${auth.user.memUuid}?t=${new Date().getTime()}`;
        setAuth((prevAuth) => ({
          ...prevAuth,
          profileImageUrl: newProfileUrl, // 상태와 localStorage에 업데이트
        }));
        toast.success('프로필 사진 업로드 성공');
        setCurrentProfileUrl(
          `${apiBaseUrl}/api/profile-pictures/${auth.user.memUuid}?t=${new Date().getTime()}`
        );
      } else {
        toast.error(response.data.message || '프로필 사진 업로드 실패');
      }
    } catch (error) {
      toast.error('프로필 사진 업로드 중 오류가 발생했습니다.');
      console.error(error);
    }
  };



  const handleProfileDelete = async () => {
    try {
      const response = await springBootAxiosInstance.delete(
        `/api/profile-pictures/${auth.user.memUuid}`
      );
      if (response.data.success) {
        toast.success('프로필 삭제 성공');

        // AuthContext의 profileImageUrl을 기본 이미지로 변경
        setAuth((prevAuth) => ({
          ...prevAuth,
          profileImageUrl: '/default-profile.png', // 기본 이미지로 설정
        }));

        // 마이페이지의 로컬 상태도 업데이트
        setCurrentProfileUrl('/default-profile.png');
      } else {
        toast.error(response.data.message || '프로필 사진 삭제 실패');
      }
    } catch (error) {
      toast.error('프로필 사진 삭제 중 오류가 발생했습니다.');
      console.error(error);
    }
  };

  return (
    <Container className="mt-5">
      <h2>마이페이지</h2>
  
      {/* 프로필 사진 관련 UI */}
      <div className="mb-4">
        <Form.Group controlId="profileImage">
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
      </div>
  
      {/* 사용자 정보 수정 폼 */}
      <Form onSubmit={handleSubmit}>
        {/* 아이디 */}
        <Form.Group controlId="memId" className="mb-3">
          <Form.Label>아이디</Form.Label>
          <Form.Control
            type="text"
            name="memId"
            value={userData.memId}
            onChange={handleChange}
            readOnly
          />
        </Form.Group>
  
        {/* 이름 */}
        <Form.Group controlId="memName" className="mb-3">
          <Form.Label>이름</Form.Label>
          <Form.Control
            type="text"
            name="memName"
            value={userData.memName}
            onChange={handleChange}
          />
        </Form.Group>
  
        {/* 휴대전화 */}
        <Form.Group controlId="memCellphone" className="mb-3">
          <Form.Label>휴대전화</Form.Label>
          <Form.Control
            type="tel"
            name="memCellphone"
            value={userData.memCellphone}
            onChange={handleChange}
            placeholder="예: 010-1234-5678"
          />
        </Form.Group>
  
        {/* 일반전화 */}
        <Form.Group controlId="memPhone" className="mb-3">
          <Form.Label>일반전화</Form.Label>
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
            placeholder="example@example.com"
          />
        </Form.Group>
  
        {/* 주소 */}
        <Form.Group controlId="memAddress" className="mb-3">
          <Form.Label>주소</Form.Label>
          <Form.Control
            type="text"
            name="memAddress"
            value={userData.memAddress}
            onChange={handleChange}
            placeholder="주소를 입력하세요"
          />
        </Form.Group>
  
        {/* 제출 버튼 */}
        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" /> : "프로필 수정"}
        </Button>
      </Form>
    </Container>
  );
  
};

export default MyPage;


