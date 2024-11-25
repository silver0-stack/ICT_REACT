// src/components/NavBar.js

import React, { useContext, useEffect } from 'react';
import { Navbar, Nav, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { auth, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // 환경 변수로 백엔드 URL 설정 (프로덕션 환경에서도 유연하게 대응)
  const backendBaseUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8888';

  // 프로필 사진 URL 구성(캐시 무효화를 위해 타임스탬프 추가)
  const profileImageUrl = auth.user && auth.user.photoFileName
    ? `${backendBaseUrl}/first/api/members/photo/${auth.user.photoFileName}?t=${new Date().getTime()}`
    : '/default-profile.png'; // 기본 프로필 사진 경로 (public 폴더에 위치)

  // 디버깅: AuthContext의 photoFileName 값 확인
  useEffect(() => {
    if (auth.user) {
      console.log('NavBar - auth.user.photoFileName:', auth.user.photoFileName);
    } else {
      console.log('NavBar - auth.user is null');
    }
  }, [auth.user]);

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
