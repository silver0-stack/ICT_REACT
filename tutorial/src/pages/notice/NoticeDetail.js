import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import {
    Card,
    CardContent,
    CardMedia,
    Typography,
    Button,
    Box,
    CircularProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Link as MuiLink,
} from "@mui/material";
import { Download, Image } from "@mui/icons-material"; // 아이콘
import { AiOutlineFile } from "react-icons/ai";

const NoticeDetail = () => {
    const { springBootAxiosInstance, auth } = useContext(AuthContext);
    //! useParams(): 라우트 경로의 동적 세그먼트(:userId)를 객체로 반환
    //* { notId: '123' }
    const { notId } = useParams();

    const navigate = useNavigate();

    //^ notice의 초기값을 null로 설정하면 데이터가 비동기로 로드되기 때문에 
    //^ fetchNotices가 완료되기 전까지 notice는 null 상태가 되어버린다.
    //* 컴포넌트가 렌더링되는 동안 null인 상태에서 notice.notTitle에 접근하려고 해서 null 에러 발생했음
    const [notice, setNotice] = useState(null); // 초기값을 null로 설정

    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    const [hasFetched, setHasFetched] = useState(false); // 조회 여부를 상태로 관리

    const [files, setFiles] = useState([]); // 첨부 파일 목록

    const [imagePreviews, setImagePreviews] = useState({}); // 이미지 미리보기 URL 저장


    // 공지사항 상세 조회
    const fetchNoticeDetails = async () => {
        try {
            const response = await springBootAxiosInstance.get(`/api/notices/${notId}`);
            setNotice(response.data.data);
            setHasFetched(true); // 데이터 가져오기 완료
        } catch (error) {
            console.error("공지사항 데이터를 불러오는 데 실패했습니다.", error);
        } finally {
            setLoading(false);
        }
    };


    // 공지사항 첨부파일 조회
    const fetchAttachedFiles = async () => {
        try {
            const response = await springBootAxiosInstance.get(`/api/notice-files/${notId}`);
            setFiles(response.data.data || []);

            // 이미지 미리보기 URL 생성
            response.data.data
                .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file.nfOriginalName))
                .forEach((file) => fetchImagePreview(file.nfId));
        } catch (error) {
            console.error("첨부 파일을 불러오는 데 실패했습니다.", error);
        }

    };

    // 이미지 미리보기 Blob 생성
    const fetchImagePreview = async (fileId) => {
        try {
            const response = await springBootAxiosInstance.get(
                `/api/notice-files/download/${fileId}`,
                { responseType: 'blob' } // Blob 데이터로 받음
            );

            const url = URL.createObjectURL(response.data);
            setImagePreviews((prev) => ({ ...prev, [fileId]: url }));
        } catch (error) {
            console.error('이미지 미리보기를 불러오는 데 실패했습니다.', error);
        }

    };



    useEffect(() => {
        if (hasFetched) return; // 이미 데이터를 가져왔다면 API 호출 방지
        fetchNoticeDetails();
        fetchAttachedFiles();

    }, [notId]);


    // 파일 다운로드 함수
    const handleFileDownload = async (fileId, fileName) => {
        try {
            const response = await springBootAxiosInstance.get(
                `/api/notice-files/download/${fileId}`,
                { responseType: 'blob' } // 파일 데이터를 Blob 형식으로 받음
            );

            // Blob을 사용해 다운로드 링크 생성
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName); // 파일 이름 설정
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url); // URL 해제
        } catch (error) {
            toast.error("파일 다운로드 실패");
            console.error("파일 다운로드 중 오류 발생:", error);
        }
    };


    
    // 데이터를 비동기로 로드하는 동안 로딩 처리
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
                <CircularProgress />
            </Box>
        );
    }

    // notice가 null인 경우 처리
    if (!notice) {
        return (
            <Box textAlign="center" mt={4}>
                <Typography variant="h6" color="error">
                    공지사항 정보를 불러오지 못했습니다.
                </Typography>
            </Box>
        );
    }

    // notice 상태변수를 공지사항 수정 하는 폼으로 전송한다.
    //* notice가 null이거나 초기화되지 않은 경우 , state가 제대로 전달되지 않을 수 있다.
    //* 빈 상태를 처리하거나 기본값을 설정하는 로직이 필요하다.
    const handleEdit = () => {
        if (!notice) {
            console.error("공지사항 데이터가 비어있습니다.");
            return;
        }
        console.log('Notice state: ', notice);
        navigate(`/notices/edit/${notId}`, { state: notice });
    };


    const handleDelete = async () => {
        const confirmDelete = window.confirm("정말로 이 공지사항을 삭제하시겠습니까?");
        if (!confirmDelete) return; // 삭제 확인 취소 시 동작 중지

        try {
            await springBootAxiosInstance.delete(`/api/notices/${notId}`);
            alert("공지사항이 성공적으로 삭제되었습니다.");
            navigate('/notices'); // 공지사항 목록으로 이동
        } catch (error) {
            toast.error('공지사항 삭제 실패: ', error);
            if (error.response) {
                console.error(error.response.data.message);
                alert('공지사항 삭제에 실패했습니다.');
            }
        }
    }



    return (
        <Box display="flex" justifyContent="center" mt={5}>
            <Card sx={{ maxWidth: 800, boxShadow: 3 }}>
                <CardContent>
                    <Typography variant="h4" gutterBottom>
                        {notice.notTitle}
                    </Typography>
                    <Typography variant="body1" paragraph>
                        {notice.notContent}
                    </Typography>

                    {/* 첨부 파일 섹션 */}
                    {files.length > 0 && (
                        <Box mt={3}>
                            <Typography variant="h6" gutterBottom>
                                첨부 파일
                            </Typography>
                            <List>
                                {files.map((file) => {
                                    const isImage = /\.(jpg|jpeg|png|gif)$/i.test(file.nfOriginalName);
                                    return (
                                        <ListItem key={file.nfId} divider>
                                            <ListItemIcon>
                                                {isImage ? <Image color="primary" /> : <AiOutlineFile size={24} />}
                                            </ListItemIcon>
                                            <ListItemText primary={file.nfOriginalName} />
                                            <Button
                                                variant="outlined"
                                                color="primary"
                                                onClick={() => handleFileDownload(file.nfId, file.nfOriginalName)}
                                                startIcon={<Download />}
                                            >
                                                다운로드
                                            </Button>
                                        </ListItem>
                                    );
                                })}

                            </List>
                        </Box>
                    )}

                    {/* 이미지 미리보기 */}
                    <Box mt={3}>
                        {Object.keys(imagePreviews).map((fileId) => (
                            <CardMedia
                                key={fileId}
                                component="img"
                                image={imagePreviews[fileId]}
                                alt="첨부 이미지 미리보기"
                                sx={{ maxHeight: 300, marginTop: 2, borderRadius: 1 }}
                            />
                        ))}
                    </Box>

                    <Box mt={3} textAlign="center">
                        <Button variant="contained" color="primary" onClick={() => navigate("/notices")}>
                            목록으로
                        </Button>
                        {auth.user?.memType === 'ADMIN' && (
                            <>
                                <Button variant="contained" color="primary" onClick={handleEdit}>
                                    수정하기
                                </Button>
                                <Button variant="contained" color="primary" onClick={handleDelete}>
                                    삭제하기
                                </Button>
                            </>
                        )}
                    </Box>
                </CardContent>
            </Card>
        </Box>
    );
};

export default NoticeDetail;
