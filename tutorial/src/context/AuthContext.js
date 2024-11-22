/* 애플리케이션 전반에서 사용자 인증 상태(로그인, 로그아웃 등)을 관리하거
서버와의 통신을 돕기 위해 만들어진 Context 다.
로그인 상태, 토큰 관리, 서버 요청 등을 중앙 처리할 수 있다.*/
// src/context/AuthContext.js

import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';

// 인증 컨텍스트 생성
export const AuthContext = createContext();

// 인증 컨텍스트 프로바이더 컴포넌트
export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  });

  // Axios 인스턴스 생성
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8888/first/api/members', // 백엔드 API URL
  });

  // 요청 인터셉터: Access Token을 헤더에 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      if (auth.accessToken) {
        config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // 응답 인터셉터: Access Token 만료 시 Refresh Token으로 재발급
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        auth.refreshToken
      ) {
        originalRequest._retry = true;
        try {
          const response = await axiosInstance.post('/refresh-token', {
            refreshToken: auth.refreshToken,
          });
          const { accessToken, refreshToken, member } = response.data.data;
          setAuth({
            accessToken,
            refreshToken,
            user: member,
          });
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(member));
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return axiosInstance(originalRequest);
        } catch (err) {
          console.error('Refresh Token 만료 또는 유효하지 않음');
          setAuth({
            accessToken: null,
            refreshToken: null,
            user: null,
          });
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(err);
        }
      }
      return Promise.reject(error);
    }
  );

  // 로그아웃 함수
  const logout = () => {
    setAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ auth, setAuth, axiosInstance, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
