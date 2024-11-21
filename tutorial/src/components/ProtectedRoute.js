/* 인증된 사용자만 접근할 수 있는 라우트를 생성한다. */
// src/components/ProtectedRoute.js

import React, { useContext} from 'react';
import { Navigate} from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { auth } = useContext(AuthContext);
    if(!auth.accessToken){
        return <Navigate to ="/login" replace />;
    }
    return children;
};

export default ProtectedRoute;