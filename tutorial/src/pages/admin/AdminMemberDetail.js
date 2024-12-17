import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import { Card, CardContent, CardMedia, Typography, Button, Box, CircularProgress } from "@mui/material";

const AdminMemberDetail = () => {
    //! useParams(): 동적 URL 세그먼트(memUuid)를 가졍오는 훅
    const { memUuid } = useParams();

    // 상태(state)를 활용해 데이터를 저장하고 컴포넌트 재렌더링
    const [member, setMember] = useState(null); // 회원 정보 저장
    const [profileImage, setProfileImage] = useState('/default-profile.png'); // 기본 프로필 이미지 설정
    const [loading, setLoading] = useState(true); // 로딩상태

    //! AuthContext에서 springBootAxiosInstance를 가져와 JWT 인증이 포함된 요청을 수행
    const { springBootAxiosInstance } = useContext(AuthContext);
    const navigate = useNavigate();


    //* useEffect: 컴포넌트 마운트 시 API 호출 (의존성 배열: [memUuid])
    useEffect(() => {
        fetchMemberDetails(); // 회원 정보 API 호출
        fetchProfileImage(); // 프로필 이미지 API 호출
    }, [memUuid]);


    // 회원 상세 정보 가져오기
    const fetchMemberDetails = async () => {
        try {
            const response = await springBootAxiosInstance.get(`/api/members/${memUuid}`);
            setMember(response.data.data); // 성공 시 데이터 설정
        } catch (error) {
            console.error("Error fetching member details:", error);
        } finally {
            setLoading(false); // 로딩 상태 종료
        }
    };

    // 프로필 이미지 Blob 데이터를 가져오기
    const fetchProfileImage = async () => {
        try {
            const response = await springBootAxiosInstance.get(
                `/api/profile-pictures/${memUuid}`,
                { responseType: 'blob' } // Blob 형태로 응답 받음
            );
            const imageUrl = URL.createObjectURL(response.data); // Blob 데이터를 브라우저 URL로 변환
            setProfileImage(imageUrl); // 이미지 설정
        } catch (error) {
            console.error("Error fetching profile image:", error);
            setProfileImage('/default-profile.png'); // 오류 시 기본 이미지 설정
        }
    };


    // 회원 삭제 핸들러
    const handleDeleteMember = async () => {
        if (window.confirm("정말로 이 회원을 삭제하시겠습니까?")) {
            try {
                await springBootAxiosInstance.delete(`/api/members/${memUuid}`);
                alert("회원이 삭제되었습니다.");
                navigate("/admin/members"); // 삭제 후 목록 페이지로 이동
            } catch (error) {
                console.error("Error deleting member:", error);
                alert("회원 삭제에 실패했습니다.");
            }
        }
    };



    // 로딩 상태 표시
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    // 데이터가 없는 경우 처리
    if (!member) {
        return (
            <Box textAlign="center" mt={4}>
                <Typography variant="h6" color="error">
                    회원 정보를 불러오지 못했습니다.
                </Typography>
            </Box>
        );
    }

    return (
        <Box display="flex" justifyContent="center" mt={5}>
            <Card sx={{ maxWidth: 500, boxShadow: 3 }}>
                {/* CardMedia: 프로필 이미지 */}
                <CardMedia
                    component="img"
                    height="300"
                    image={profileImage}
                    alt="Profile Image"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/default-profile.png'; }} // 이미지 오류 처리
                />
                <CardContent>
                    <Typography variant="h5" component="div" gutterBottom>
                        회원 상세 정보
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>UUID:</strong> {member.memUuid}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>아이디:</strong> {member.memId}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>이름:</strong> {member.memName}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>이메일:</strong> {member.memEmail}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>주소:</strong> {member.memAddress}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>상태:</strong> {member.memStatus}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        <strong>가입일:</strong> {member.memEnrollDate}
                    </Typography>
                    <Box mt={3} textAlign="center">
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => window.history.back()}
                        >
                            뒤로 가기
                        </Button>
                        <Button variant="contained" color="error" onClick={handleDeleteMember} sx={{ ml: 2 }}>
                            삭제하기
                        </Button>
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminMemberDetail;
