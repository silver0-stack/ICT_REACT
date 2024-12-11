import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { auth, logout, springBootAxiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(auth.profileImageUrl || '/default-profile.png');


  useEffect(() => {
     // 프로필 이미지가 변경될 때 NavBar 업데이트
     const fetchProfileImage = async () => {
      if (auth.user && auth.user.memUuid) {
        try {
          const response = await springBootAxiosInstance.get(
            `/api/profile-pictures/${auth.user.memUuid}`,
            { responseType: 'blob' } // 이미지 데이터를 blob 형태로 가져오기
          );
          //! React에서 파일 데이터를 처리하려면 Blob 형태로 받아야 한다.
          //! axios에서 responseType: 'blob'을 설정하면 파일 데이터를 Blob으로 변환하여 받을 수 있다.
          //! 받은 Blob 데이터를 URL.createObjectURL()로 변환하여 브라우저에서 사용할 수 있는 URL을 생성할 수 있다.
          const imageUrl = URL.createObjectURL(response.data);
          setProfileImage(imageUrl); // NavBar 상태 업데이트
        } catch (error) {
          console.error('프로필 이미지를 가져오는 중 오류 발생:', error);
          setProfileImage('/default-profile.png');
        }
      }
    };

    fetchProfileImage();

  }, [auth.profileImageUrl, auth.user, springBootAxiosInstance]);



  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">MyApp</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          {auth.accessToken ? (
            <>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/notices">공지사항</Nav.Link>
              {auth.user && auth.user.memType === 'ADMIN' && (
                <Nav.Link as={Link} to="/notices/add">공지사항 추가</Nav.Link>
              )}
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              <Dropdown align="end">
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  <Image
                    src={profileImage} // auth.profileImageUrl 사용
                    roundedCircle
                    width="40"
                    height="40"
                    alt="Profile"
                    //! e.target: 이벤트 핸들러의 e는 이벤트 객체입니다. HTML 요소를 가리킨다. 여기서는 <img>태그
                    //! onerror: 이미지 로드에 실패했을 때 실행되는 이벤트. 즉 onError 속성에 지정된 함수가 호출된다.
                    //! 즉, e.target.onerror: 이미지 로드 실패 시 발생하는 무한 호출을 방지하기 위해 onerror를 비활성화한 것.
                    //!  = null : onerror를 null로 설정하여 현재 이벤트 핸들러를 제거한다.
                    //! 이렇게 하면 이미지 소스를 기본값('/default-profile.png')로 변경한 후, 다시 실패하더라도 onError가 재호출되지 않게 함
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-profile.png'; }}
                  />
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/mypage">마이페이지</Dropdown.Item>
                  {/* 추가 메뉴 항목이 필요하면 여기에 추가 */}
                </Dropdown.Menu>
              </Dropdown>
            </>
          ) : (
            <Nav.Link as={Link} to="/login">Login</Nav.Link>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
};

export default NavBar;
