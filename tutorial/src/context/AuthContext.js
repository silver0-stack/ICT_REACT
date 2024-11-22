/* 애플리케이션 전반에서 사용자 인증 상태(로그인, 로그아웃 등)을 관리하거
서버와의 통신을 돕기 위해 만들어진 Context 다.
로그인 상태, 토큰 관리, 서버 요청 등을 중앙 처리할 수 있다.*/
// src/context/AuthContext.js

import React, { createContext, useState } from 'react'; // React와 필요한 Hook들을 import
import jwt_decode from 'jwt-decode'; // JWT 토큰을 디코딩하기 위한 라이브러리
import axios from 'axios'; // HTTP 요청을 위한 Axios 라이브러리
import { toast } from 'react-toastify';

// 인증 관련 데이터를 전달할 Context를 생성
export const AuthContext = createContext();

// 인증 Context의 Provider 컴포넌트 생성
export const AuthProvider = ({ children }) => {
  // 인증 상태를 관리하는 state. 초기값은 LocalStorage에서 가져오거나 null로 설정
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem('accessToken') || null, // Access Token
    refreshToken: localStorage.getItem('refreshToken') || null, // Refresh Token
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null, // 사용자 정보
  });

  // Axios 인스턴스 생성. baseURL을 설정하여 모든 요청의 기본 URL을 지정
  const axiosInstance = axios.create({
    baseURL: 'http://localhost:8888/first/api/members', // 백엔드 API URL
  });

  // 요청 인터셉터: 모든 Axios 요청 전에 실행되어 Access Token을 헤더에 추가
  axiosInstance.interceptors.request.use(
    (config) => {
      if (auth.accessToken) {
        // Authorization 헤더에 Bearer 토큰을 추가
        config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
      }
      return config; // 수정된 config 반환
    },
    (error) => {
      return Promise.reject(error); // 오류가 발생하면 이를 Promise 체인에 전달
    }
  );

  // 응답 인터셉터: 서버 응답 후 실행
  axiosInstance.interceptors.response.use(
    (response) => {
      // 응답이 정상적이면 그대로 반환
      return response;
    },
    async (error) => {
      const originalRequest = error.config; // 원래의 요청 정보 저장

      // 만약 응답상태가 401(Unauthorized)이면서, 해당 요청이 재시도 요청이 아니고,
      // Refresh Token이 존재한다면 토큰 재발급 시도
      if (
        error.response.status === 401 &&
        !originalRequest._retry &&
        auth.refreshToken
      ) {
        originalRequest._retry = true; // 재시도 플래그 설정해서 무한 재시도 하지 않도록 방지
        try {
          // Refresh Token을 사용하여 새로운 AccessToken과 Refresh Token 요청
          const response = await axiosInstance.post('/refresh-token', {
            refreshToken: auth.refreshToken,
          });

          // 서버로부터 새로운 토큰과 사용자 정보 수신
          const { accessToken, refreshToken, member } = response.data.data;

          // 인증 상태 업데이트
          setAuth({
            accessToken,
            refreshToken,
            user: member,
          });

          // 새로운 토큰과 사용자 정보를 LocalStorage 에 저장
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(member));

          // 원래의 요청 헤더에 새로운 Access Token 추가
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          // 수정된 요청을 재시도
          return axiosInstance(originalRequest);
        } catch (err) {
          // Refresh Token이 만료되었거나 유효하지 않을 경우 처리
          console.error('Refresh Token 만료 또는 유효하지 않음');
          toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');

          // 인증 상태 초기화
          setAuth({
            accessToken: null,
            refreshToken: null,
            user: null,
          });

          // LocalStorage에서 인증 정보 제거
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');

          // 사용자 로그인 페이지로 리다이렉트
          window.location.href = '/login';

          // 오류를 Promise 체인에 전달
          return Promise.reject(err);
        }
      }
      
      // 위 조건에 해당하지 않으면, 오류를 그대로 Promise 체인에 전달
      return Promise.reject(error);
    }
  );

  // 로그아웃 함수: 인증 상태와 LocalStorage를 초기화
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

  // AuthContext.Provider를 통해 자식 컴포넌트들에게 auth 상태와 관련 함수들을 전달
  return (
    <AuthContext.Provider value={{ auth, setAuth, axiosInstance, logout }}>
      {children}{/* Provider로 감싸진 자식 컴포넌트들 */}
    </AuthContext.Provider>
  );
};
