import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { VoiceCommandContext } from '../components/common/VoiceCommandProvider';

const NoticeList = () => {
    const { springBootAxiosInstance, auth } = useContext(AuthContext);
    //! useState(null) 과 useState([])의 차이점: 빈 값 초기화, 빈 배열 초기화
    //! const { , } 와 const [ , ]의 차이점: 객체 구조 분해 할당, 리액트 훅 (useState) 반환값
    const [notices, setNotices] = useState([]); // 공지사항 목록의 배열 초기화 훅

    const { isListening, handleStartListening } = useContext(VoiceCommandContext);  // Context에서 값 가져오기



    //? useEffect는 일반적으로 데이터 페치, 구독(subscribe), 타이머 설정 등 부수 효과를 처리하기 위해 사용된다
    //? React의 useEffect 는 동기함수로 작동해야 하지만 데이터 페치 같은 작업은 비동기 함수로 처리된다.
    //? 따라서 fetchNotice라는 비동기 함수를 내부에 정의하고 호출하는 방식으로 구현한다.
    useEffect(() => {
        const fetchNotices = async () => {
            try {
                const response = await springBootAxiosInstance.get('/api/notices');
                setNotices(response.data.data.content); // Page 객체의 content를 가져옴()
            } catch (error) {
                console.error('공지사항을 조회해오는 것을 실패함: ', error);
            }
        };
        //~ useEffect 내부에서 비동기 작업을 수행하기 위해 비동기 함수를 정의하고 즉시 호출하는 패턴이다.
        fetchNotices();
    }, [springBootAxiosInstance]);
    //? 의존성 배열이 비어 있으면 컴포넌트가 처음 마운트될 때 단 한 번 실행된다.
    //? 데이터 페치와 같은 작업을 초기 렌더링 시 한 번만 수행하려는 경우에 적합
    //~ 추가 의존성이 없다는 의미: 처음 마운트될 때 딱 한 번만 데이터 페치한다는 의미와 동일
    //~ fetchNotices 함수가 의존하는 외부 변수나 상태가 없으므로 빈 배열로 설정
    //~ 만약 상태(state)나 프롭스(props)를 의존성에 추가하면, 해당 값이 변경될 때마다 useEffect 가 재실행

    return (
        <div>
            <h1>공지사항 목록</h1>
            {auth.user?.memType === 'ADMIN' && (
                <Link to="/notices/add">
                    <button>공지사항 등록</button>
                </Link>
            )}
            <ul>
                {/* 질문: 왜 (notice) => {} 가 아니라 (notice) => () 일까?*/}
                {/* //* ()는 함수의 암묵적 반환, {}는 명시적 반환. 즉 return 여부 차이 */}
                {/* 질문: <li key={}> 에서 key는 어떤 키워드고 무슨 기능인지 궁금함*/}
                {/* //* React가 리스트 항목의 고유성을 식별하고 DOM 업데이트를 최적화하도록 돕는 값 */}
                {notices.map((notice) => (
                    <li key={notice.notId}>
                        <Link to={`/notices/${notice.notId}`}>{notice.notTitle}</Link>
                    </li>
                ))}
            </ul>
            <button onClick={handleStartListening}>
                {isListening ? '음성 녹음 중지' : '음성 녹음 시작'}
            </button>
        </div>
    );
};

export default NoticeList;