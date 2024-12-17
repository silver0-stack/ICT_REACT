import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const NoticeAddForm = () => {
    // AuthContext를 사용해 Spring Boot Axios 인스턴스를 가져옴 (JWT 인증 헤더 포함된 요청용)
    const { springBootAxiosInstance } = useContext(AuthContext);
    //! useLocation(): 페이지 전환 시 전달된 state 객체를 추출
    const location = useLocation(); 
    const navigate = useNavigate();

    //! useParams(): 라우트 경로에 포함된 파라미터 값을 가져옴
    const { notId } = useParams(); 

    /*
        수정 모드 여부를 확인하기 위한 변수(notId가 존재하면 수정모드)
        * !!는 Truthy와 Falsy 값을 명시적으로 Boolean 값으로 변환한다.
        * 첫 번째 !(NOT 연산자): 반대 값 반환
        *   - Truthy 값 -> false
        *   - Falsy 값 -> true
        * 두 번째 !: 첫 번째 NOT 연산자의 결과를 다시 반전시켜 원래 값의 Truthy/Falsy 상태를 Boolean으로 반환한다.
        * -----------------------------------------------------------------------------------------------------
        * [대안]
        * const isEditMode = Boolean(notId); 
    */
    const isEditMode = !!notId; // notId가 있으면 수정 모드
    console.log('수정 모드인가?: ', isEditMode);
    // 초기 폼 데이터를 state 객체에서 가져오거나 기본값으로 설정
    const initialForm = location.state || { notTitle: '', notContent: '' }; // 초기값 설정
    const [form, setForm] = useState(initialForm);
    // 파일 입력 필드를 관리하기 위한 상태 변수
    const [file, setFile] = useState(null); 
    // 에러 메시지를 화면에 표시하기 위한 상태변수
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가


    // 수정 모드일 경우, 해당 공지사항 데이터를 서버에서 가져옴
    useEffect(() => {
        const fetchNotice = async () => {
            if (!isEditMode) return; // 등록 모드라면 데이터 호출 필요 없음

            try {
                const response = await springBootAxiosInstance.get(`/api/notices/${notId}`);
                setForm(response.data.data); // 서버에서 가져온 데이터로 폼 초기화
            } catch (error) {
                console.error('공지사항 데이터를 불러오는 데 실패했습니다.', error);
            }
        };

        fetchNotice();
    }, [isEditMode, notId, springBootAxiosInstance]);


    // 폼 입력값이 변경될 떄 호출되는 함수
    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value }); // 입력 필드의 값 업데이트
    };

    // 파일 선택 시 호출되는 함수
    const handleFileChange = (e) => {
        setFile(e.target.files[0]); // 첫 번째 파일만 선택??
    }

    // 폼 제출 시 실행되는 함수 (공지사항 저장 및 파일 업로드)
    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
    
        try {
            //& Step 1: 공지사항 등록 (POST /api/notices)
            const noticeResponse = await springBootAxiosInstance.post('/api/notices', {
                notTitle: form.notTitle,
                notContent: form.notContent,
            });
    
            // 생성된 공지사항 ID 추출
            const { data: createdNotice } = noticeResponse.data;
            const noticeId = createdNotice.notId;
    
            //& Step 2: 파일 업로드 (POST /api/notice-files/{noticeId})
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
    
                await springBootAxiosInstance.post(`/api/notice-files/${noticeId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
    
            // 성공적으로 완료되면 공지사항 상세페이지로 이동
            navigate(`/notices/${noticeId}`); 
        } catch (error) {
            // 에러 메시지 처리
            if (error.response) {
                const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
                setErrorMessage(errorMessage);
                console.error(`Error ${error.response.status}: ${errorMessage}`);
            } else {
                setErrorMessage('서버와 통신에 실패했습니다.');
                console.error('Error: ', error);
            }
        }
    };
    

    return (
        <form onSubmit={handleSubmit} encType='multipart/form-data'>
            <h1>{isEditMode ? '공지사항 수정' : '공지사항 추가'}</h1>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            <div>
                <label>제목:</label>
                <input
                    type="text"
                    name="notTitle"
                    value={form.notTitle}
                    onChange={handleChange}
                    required
                />
            </div>
            <div>
                <label>내용:</label>
                <textarea
                    name="notContent"
                    value={form.notContent}
                    onChange={handleChange}
                    required
                ></textarea>
            </div>
            <div>
                <label>파일 첨부 (선택):</label>
                <input
                    type="file"
                    name="file"
                    onChange={handleFileChange}
                />
            </div>
            <button type="submit">{isEditMode ? '수정 완료' : '등록'}</button>
        </form>
    );

}
export default NoticeAddForm;