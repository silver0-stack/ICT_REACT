import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, useLocation, useParams } from 'react-router-dom';

const NoticeAddForm = () => {
    const { springBootAxiosInstance } = useContext(AuthContext);
    const location = useLocation(); // 페이지 전환과 함께 전달된 state 객체 추출하기 위함
    const navigate = useNavigate();
    const { notId } = useParams(); // 수정 모드일 경우 공지사항 ID를 가져옴

    /*
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
    const initialForm = location.state || { notTitle: '', notContent: '' }; // 초기값 설정
    const [form, setForm] = useState(initialForm);
    const [file, setFile] = useState(null); // 첨부 파일 상태
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가


    useEffect(() => {
        // 수정 모드일 경우, 초기 데이터를 API로 가져옴
        const fetchNotice = async () => {
            if (!isEditMode) return; // 등록 모드이면 api 호출 안 함

            try {
                const response = await springBootAxiosInstance.get(`/api/notices/${notId}`);
                setForm(response.data.data);
            } catch (error) {
                console.error('공지사항 데이터를 불러오는 데 실패했습니다.', error);
            }
        };

        fetchNotice();
    }, [isEditMode, notId, springBootAxiosInstance]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleFileChange = (e) => {
        //& 여러 개 첨부가 가능하도록 수정.
        setFile(e.target.files[0]); // 첫 번째 파일만 선택??
    }
    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
    
        try {
            // Step 1: 공지사항 등록 (POST /api/notices)
            const noticeResponse = await springBootAxiosInstance.post('/api/notices', {
                notTitle: form.notTitle,
                notContent: form.notContent,
            });
    
            // 공지사항 ID 추출
            const { data: createdNotice } = noticeResponse.data;
            const noticeId = createdNotice.notId;
    
            // Step 2: 파일 업로드 (POST /api/notice-files/{noticeId})
            if (file) {
                const formData = new FormData();
                formData.append('file', file);
    
                await springBootAxiosInstance.post(`/api/notice-files/${noticeId}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
    
            // 성공적으로 완료되면 페이지 이동
            navigate(`/notices/${noticeId}`);
        } catch (error) {
            // 에러 처리
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