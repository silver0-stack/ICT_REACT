/* 로그인 요청 시 서버로부터 받은 메시지를 출력하는 페이지 */
// src/components/LoginResponse.js

import React from "react";
import { useLocation, Link } from "react-router-dom";

const LoginResponse = () => {
  const location = useLocation();
  const { message } = location.state || {
    message: "알 수 없는 오류가 발생했습니다.",
  };

  return (
    <div className="response-container">
      <h2>로그인 결과</h2>
      <p>{message}</p>
      <Link to="/" className="response-link">
        홈으로 돌아가기
      </Link>
    </div>
  );
};

export default LoginResponse;
