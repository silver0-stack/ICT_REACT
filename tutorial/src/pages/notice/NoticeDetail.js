import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NoticeDetail = () => {
    const { springBootAxiosInstance } = useContext(AuthContext);
    //! useParams(): 라우트 경로의 동적 세그먼트(:userId)를 객체로 반환
    //* { notId: '123' }
    const { notId } = useParams(); 
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        const fetchNotice = async() => {
            try{
                const response=await springBootAxiosInstance.get(`/api/notices/${notId}`);
                setNotice(response.data.data);
            }catch(error){
                console.error('공지사항 페치 실패:', error);
            }
        };
        fetchNotice();
    }, [notId]);

    if (!notId) return <p>Loading ....</p>;

    return(
        <div>
            <h1>{notice.notTitle}</h1>
            <p>{notice.notContent}</p>
            <p>작성자: {notice.notCreatedBy}</p>
            <p>조회수: {notice.notReadCount}</p>
        </div>
    );
};

export default NoticeDetail;
