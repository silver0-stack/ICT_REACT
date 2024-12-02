// src/context/AuthContext.js

import React, { createContext, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
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

  /**
   * 토큰 재발급 함수
   * Spring Boot의 /refresh-token 엔드포인트를 호출하여 새로운 토큰을 발급받습니다.
   */
  const refreshToken = async () => {
    try {
      const response = await springBootAxiosInstance.post('/api/members/refresh-token', {
        refreshToken: auth.refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken, member } = response.data.data;

      // 인증 상태 업데이트
      setAuth({
        accessToken,
        refreshToken: newRefreshToken,
        user: member,
      });

      // 새로운 토큰과 사용자 정보를 LocalStorage에 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(member));

      return accessToken;
    } catch (error) {
      console.error('토큰 재발급 실패:', error);
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
      return null;
    }
  };

  /**
   * 공통 인터셉터 로직을 함수로 추출
   * 두 Axios 인스턴스에 적용할 수 있습니다.
   */
  const setupInterceptors = (axiosInstance, isFlask = false) => {

    if (isFlask) {
      // Flask 백엔드와의 통신에는 인터셉터 설정을 생략
      return;
    }

    // 요청 인터셉터: 모든 Axios 요청 전에 실행되어 Access Token을 헤더에 추가
    axiosInstance.interceptors.request.use(
      (config) => {
        if (auth.accessToken) {
          // Authorization 헤더에 Bearer 토큰을 추가
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
          console.log("Access Token being set in headers:", auth.accessToken); // 추가 로그
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

        // 만약 응답 상태가 401(Unauthorized)이면서, 해당 요청이 재시도 요청이 아니고,
        // Refresh Token이 존재한다면 토큰 재발급 시도
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          auth.refreshToken
        ) {
          originalRequest._retry = true; // 재시도 플래그 설정해서 무한 재시도 하지 않도록 방지
          console.log("Attempting to refresh token with refreshToken:", auth.refreshToken); // 추가 로그
          const newAccessToken = await refreshToken(); // 토큰 재발급

          if (newAccessToken) {
            // 원래의 요청 헤더에 새로운 Access Token 추가
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            // 수정된 요청을 재시도
            return axiosInstance(originalRequest);
          }
        }

        // 위 조건에 해당하지 않으면, 오류를 그대로 Promise 체인에 전달
        return Promise.reject(error);
      }
    );
  };

  // Spring Boot용 Axios 인스턴스 생성
  const springBootAxiosInstance = axios.create({
    baseURL: 'http://localhost:8888/first', // Spring Boot 백엔드 API URL
    // 'Content-Type'을 수동으로 설정하지 않음
  });

  // Flask용 Axios 인스턴스 생성
  const flaskAxiosInstance = axios.create({
    baseURL: 'http://localhost:5000', // Flask 백엔드 API URL
    // 'Content-Type'을 수동으로 설정하지 않음
  });

  // 각 Axios 인스턴스에 인터셉터 설정
  setupInterceptors(springBootAxiosInstance); // Spring Boot 인스턴스 설정
  setupInterceptors(flaskAxiosInstance, true); // Flask 인스턴스에는 인터셉터를 설정하지 않음

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

  // auth 상태가 변경될 때마다 LocalStorage를 업데이트!!
  useEffect(() => {
    if (auth.accessToken) {
      localStorage.setItem('accessToken', auth.accessToken);
    } else {
      localStorage.removeItem('accessToken');
    }

    if (auth.refreshToken) {
      localStorage.setItem('refreshToken', auth.refreshToken);
    } else {
      localStorage.removeItem('refreshToken');
    }

    if (auth.user) {
      localStorage.setItem('user', JSON.stringify(auth.user));
    } else {
      localStorage.removeItem('user');
    }
  }, [auth]);

  // AuthContext.Provider를 통해 자식 컴포넌트들에게 auth 상태와 관련 함수들을 전달
  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        springBootAxiosInstance, // Spring Boot용 Axios 인스턴스 제공
        flaskAxiosInstance, // Flask용 Axios 인스턴스 제공
        logout,
      }}
    >
      {children}
      {/* Provider로 감싸진 자식 컴포넌트들 */}
    </AuthContext.Provider>
  );
};
