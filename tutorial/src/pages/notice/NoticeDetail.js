import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { toast } from 'react-toastify';

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

    useEffect(() => {
        if (hasFetched) return; // 이미 데이터를 가져왔다면 API 호출 방지

        const fetchNotice = async () => {
            try {
                const response = await springBootAxiosInstance.get(`/api/notices/${notId}`);
                setNotice(response.data.data);
                setHasFetched(true); // 데이터 가져오기 완료
            } catch (error) {
                console.error('공지사항 페치 실패:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNotice();

    }, [notId, hasFetched, springBootAxiosInstance]);

    // 데이터를 비동기로 로드하는 동안 로딩 처리
    if (loading) return <p>Loading ....</p>;

    // notice가 null인 경우 처리
    if (!notice) return <p>공지사항을 불러오는 데 실패했습니다.</p>;

    // notice 상태변수를 공지사항 수정 하는 폼으로 전송한다.
    //* notice가 null이거나 초기화되지 않은 경우 , state가 제대로 전달되지 않을 수 있다.
    //* 빈 상태를 처리하거나 기본값을 설정하는 로직이 필요하다.
    const handleEdit = () => {
        if(!notice){
            console.error("공지사항 데이터가 비어있습니다.");
            return;
        }
        console.log('Notice state: ', notice);
        navigate(`/notices/edit/${notId}`, { state: notice });
    };

    
    const handleDelete = async () => {
        const confirmDelete = window.confirm("정말로 이 공지사항을 삭제하시겠습니까?");
        if(!confirmDelete) return; // 삭제 확인 취소 시 동작 중지

        try{
            await springBootAxiosInstance.delete(`/api/notices/${notId}`);
            alert("공지사항이 성공적으로 삭제되었습니다.");
            navigate('/notices'); // 공지사항 목록으로 이동
        }catch(error){
            toast.error('공지사항 삭제 실패: ', error);
            if(error.response){
                console.error(error.response.data.message);
                alert('공지사항 삭제에 실패했습니다.');
            }
        }
    }



    return (
        <div>
            <h1>{notice.notTitle}</h1>
            <p>{notice.notContent}</p>
            <p>작성자: {notice.notCreatedBy}</p>
            <p>조회수: {notice.notReadCount}</p>
            {auth.user?.memType === 'ADMIN' && (
                <>
                <button onClick={handleEdit}>공지사항 수정</button>
                <button onClick={handleDelete}>공지사항 삭제</button>
                </>
            )}
        </div>
    );
};

export default NoticeDetail;
