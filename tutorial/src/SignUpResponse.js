import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SignUpResponse = () => {
    const location = useLocation(); 
    const { message } = location.state || { message: '알 수 없는 오류가 발생했습니다.' };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>회원가입 결과</h2>
            <p>{message}</p>
            <Link to="/" style={{ color: '#4CAF50', textDecoration: 'none' }}>
                홈으로 돌아가기
            </Link>
        </div>
    );
};

export default SignUpResponse;
