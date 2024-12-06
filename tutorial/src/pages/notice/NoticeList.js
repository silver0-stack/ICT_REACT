import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NoticeList = () => {
    const { springBootAxiosInstance, auth } = useContext(AuthContext);
    //! useState(null) 과 useState([])의 차이점: 빈 값 초기화, 빈 배열 초기화
    //! const { , } 와 const [ , ]의 차이점: 객체 구조 분해 할당, 리액트 훅 (useState) 반환값
    const [notices, setNotices] = useState([]); // 공지사항 목록의 배열 초기화 훅

    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await springBootAxiosInstance.get('/api/notices');
                setNotices(response.data.data.content); // Page 객체의 content를 가져옴()
            } catch (error) {
                console.error('공지사항을 조회해오는 것을 실패함: ', error);
            }
        };
        //? 왜  useEffect 내에서 자기 호출하지?
        fetchNotices();
    }, []); //? 왜 의존성 배열이 빈 배열이지? 무슨 뜻이지?

    return (
        <div>
            <h1>공지사항 목록</h1>
            {auth.user?.memType === 'ADMIN' && (
                <Link to="/notices/add">
                    <button>공지사항 등록</button>
                </Link>
            )}
            <ul>
                {/* 질문: 왜 (notice) => {} 가 아니라 (notice) => () 인지 궁금함*/}
                {/* 질문: <li key={}> 에서 key는 어떤 키워드고 무슨 기능인지 궁금함*/}
                {notices.map((notice) => (
                    <li key={notices.notId}>
                        <Link to={`/notice/${notice.notId}`}>{notice.notTitle}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default NoticeList;