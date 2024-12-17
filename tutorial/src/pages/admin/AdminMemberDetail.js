import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';
import { Card, CardContent, CardMedia, Typography, Button, Box, CircularProgress } from "@mui/material";

const AdminMemberDetail = () => {
    const { memUuid } = useParams();
    const [member, setMember] = useState(null);
    const [profileImage, setProfileImage] = useState('/default-profile.png'); // 기본 이미지 설정
    const [loading, setLoading] = useState(true);
    const { springBootAxiosInstance } = useContext(AuthContext);

    useEffect(() => {
        fetchMemberDetails();
        fetchProfileImage();
    }, [memUuid]);

    // 회원 정보 조회
    const fetchMemberDetails = async () => {
        try {
            const response = await springBootAxiosInstance.get(`/api/members/${memUuid}`);
            setMember(response.data.data);
        } catch (error) {
            console.error("Error fetching member details:", error);
        } finally {
            setLoading(false);
        }
    };

    // 프로필 이미지 조회
    const fetchProfileImage = async () => {
        try {
            const response = await springBootAxiosInstance.get(
                `/api/profile-pictures/${memUuid}`,
                { responseType: 'blob' } // 이미지 데이터를 Blob 형태로 가져옴
            );
            const imageUrl = URL.createObjectURL(response.data); // Blob 데이터를 URL로 변환
            setProfileImage(imageUrl);
        } catch (error) {
            console.error("Error fetching profile image:", error);
            setProfileImage('/default-profile.png'); // 오류 시 기본 이미지 설정
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

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
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default AdminMemberDetail;
