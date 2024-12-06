import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NoticeAddForm = () => {
    const { springBootAxiosInstance } = useContext(AuthContext);
    const [form, setForm] = useState({ notTitle: '', notContent: '' });
    const [errorMessage, setErrorMessage] = useState(''); // 에러 메시지 상태 추가
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        try {
            await springBootAxiosInstance.post('/api/notices', form);
            navigate('/notices'); // 등록 후 목록 페이지로 이동
        } catch (error) {
            // 서버에서 반환된 ApiResponse의 메시지 처리
            if(error.response && error.response.data && error.response.data.message){
                setErrorMessage(error.response.data.message); // 에러 메시지 상태 업데이트
                console.error('서버 응답 메시지: ', error.response.data.message); // 메시지 로그 출력
            }
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h1>공지사항 추가</h1>
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
            <button type="submit">등록</button>
        </form>
    );

}
export default NoticeAddForm;