import React, { useEffect, useState, useContext, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NoticeDetail = () => {
    const { springBootAxiosInstance } = useContext(AuthContext);
    //! useParams(): 라우트 경로의 동적 세그먼트(:userId)를 객체로 반환
    //* { notId: '123' }
    const { notId } = useParams();
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

    }, [notId, hasFetched]);

    // 데이터를 비동기로 로드하는 동안 로딩 처리
    if (loading) return <p>Loading ....</p>;

    // notice가 null인 경우 처리
    if (!notice) return <p>공지사항을 불러오는 데 실패했습니다.</p>;

    return (
        <div>
            <h1>{notice.notTitle}</h1>
            <p>{notice.notContent}</p>
            <p>작성자: {notice.notCreatedBy}</p>
            <p>조회수: {notice.notReadCount}</p>
        </div>
    );
};

export default NoticeDetail;
