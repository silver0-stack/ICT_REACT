// src/components/SignUpResponse.js

import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const SignUpResponse = () => {
  const location = useLocation();
  const { message } = location.state || { message: '알 수 없는 오류가 발생했습니다.' };

  return (
    <div className="response-container text-center mt-5">
      <h2>회원가입 결과</h2>
      <p>{message}</p>
      <Link to="/login" className="btn btn-primary mt-3">
        로그인 페이지로 이동
      </Link>
    </div>
  );
};

export default SignUpResponse;

/*
수정 사항 설명:

1. **스타일링 추가:**
   - Bootstrap 클래스 (`text-center`, `btn`, `btn-primary`, `mt-5`, `mt-3`)를 추가하여 시각적으로 개선했습니다.
*/
