import React, { useContext, useState, useEffect } from 'react';
import { Navbar, Nav, Image, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { auth, setAuth, logout, springBootAxiosInstance } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(auth.profileImageUrl || '/default-profile.png');
  const [hasFetched, setHasFetched] = useState(false); // 이미지 한번만 가져오기 위한 상태


  useEffect(() => {
    const fetchProfileImage = async () => {
      if (auth.user && auth.user.memUuid) {
      // 사용자 프로필 이미지를 한 번만 가져옴
        try {
          const response = await springBootAxiosInstance.get(
            `/api/profile-pictures/${auth.user.memUuid}`,
            { responseType: 'blob' } // 이미지 데이터를 blob 형태로 가져오기 
          );
          const imageUrl = URL.createObjectURL(response.data);
          setProfileImage(imageUrl);
          setHasFetched(true); // 한 번 가져왔음을 표시
          setAuth((prevAuth) => ({
            ...prevAuth,
            profileImageUrl: imageUrl,
          }))
        } catch (error) {
          console.error('프로필 이미지를 가져오는 중 오류 발생:', error);
          setProfileImage('/default-profile.png');
        }
      }
    };
    fetchProfileImage();

  }, [auth.profileImageUrl , setAuth, springBootAxiosInstance]);



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
