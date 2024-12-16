/* 
인증된 사용자만 접근할 수 있는 라우트를 생성한다.
이 컴포넌트를 사용하여 보호된 페이지에 접근할 때 사용자의 인증 상태를 확인하고,
인증되지 않은 사용자는 로그인 페이지로 리다이렉트시킨다.
*/
// src/components/ProtectedRoute.js

import React, { useContext} from 'react';
import { Navigate} from 'react-router-dom';
// AuthContext를 import하여 인증 상태에 접근
import { AuthContext } from '../context/AuthContext';

// ProtectedRoute 컴포넌트 정의
const ProtectedRoute = ({ children, roles = [] }) => {
    // AuthContext에서 auth 상태를 가져옴
    const { auth } = useContext(AuthContext);

    // 인증되지 않은 사용자인 경우 (accessToken이 없을 때)
    if(!auth.accessToken){
        // <Navigate> 컴포넌트를 사용하여 로그인 페이지로 리다이렉트
        // 'replace' prop은 현재 기록을 새로운 기록으로 대체하여 뒤로 가기 버튼을 눌렀을 때
        // 리다이렉트 이전 페이지로 돌아가지 않도록 함
        // 즉, 브라우저의 히스토리를 대체하여, 사용자가 뒤로 가기를 눌렀을 떄 보호된 라우트를 돌아가지 않도록 함.
        return <Navigate to ="/login" replace />;
    }

    if(roles.length > 0 && !roles.includes(auth.user.memType)){
        return <Navigate to="/" />
    }
    // 인증된 사용자인 경우, 자식 컴포넌트를 렌더링
    return children;
};

// ProtectedRoute 컴포넌트를 export 하여 다른 컴포넌트에서 사용할 수 있게 함
export default ProtectedRoute;