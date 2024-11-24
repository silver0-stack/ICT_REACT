import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SignUpResponse = () => {
    const location = useLocation();
    const { message } = location.state || { message: '알 수 없는 오류가 발생했습니다.' };

    return (
        <div className="response-container">
            <h2>회원가입 결과</h2>
            <p>{message}</p>
            <Link to="/login" className="response-link">
                로그인 페이지로 이동
            </Link>
        </div>
    );
};

export default SignUpResponse;
