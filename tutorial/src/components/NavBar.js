// src/components/NavBar.js

import React, { useContext, useEffect, useState } from 'react';
import { Navbar, Nav, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 환경 변수로 백엔드 URL 설정 (프로덕션 환경에서도 유연하게 대응)
  const backendBaseUrl = process.env.REACT_APP_SPRING_BOOT_URL || 'http://localhost:8888/first';

  const [profileImageUrl, setProfileImageUrl] = useState('/default-profile.png');


  useEffect(() => {
    if (auth.user) {
      const profileUrl = auth.user.memUuid
        ? `${backendBaseUrl}/api/profile-pictures/${auth.user.memUuid}?t=${new Date().getTime()}`
        : '/default-profile.png';
      setProfileImageUrl(profileUrl);
    } else {
      setProfileImageUrl('/default-profile.png'); // 로그인한 상태가 아니라면 기본 프로필 사진 
    }
  }, [auth.user, backendBaseUrl]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">MyApp</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto"> {/* Bootstrap 5에서는 'ml-auto' 대신 'ms-auto' 사용 */}
          {auth.accessToken ? (
            <>
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              <Nav.Link as={Link} to="/notices">공지사항</Nav.Link>
              {auth.user && auth.user.memType === 'ADMIN' && (
                <Nav.Link as={Link} to="/notices/add">공지사항 추가</Nav.Link>
              )}
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              <Dropdown align="end"> {/* 'alignRight' 대신 'align="end"' 사용 */}
                <Dropdown.Toggle variant="light" id="dropdown-basic">
                  <Image
                    src={profileImageUrl}
                    roundedCircle
                    width="40"
                    height="40"
                    alt="Profile"
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
