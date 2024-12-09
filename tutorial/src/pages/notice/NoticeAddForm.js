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

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        try {
            if (isEditMode) {
                await springBootAxiosInstance.put(`/api/notices/${notId}`, form);
            } else {
                await springBootAxiosInstance.post('/api/notices', form);
            }
            navigate(isEditMode ? `/notices/${notId}` : '/notices'); // 등록인지 수정인지에 따라 다른 페이지 전환
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response?.data?.message || '알 수 없는 오류가 발생했습니다.';
                setErrorMessage(errorMessage); // 화면에 표시
                console.error(`Error ${error.response.status}: ${errorMessage}`);
            } else {
                setErrorMessage('서버와 통신에 실패했습니다.');
                console.error('Error: ', error);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
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
            <button type="submit">{isEditMode ? '수정 완료' : '등록'}</button>
        </form>
    );

}
export default NoticeAddForm;