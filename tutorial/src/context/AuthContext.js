// src/context/AuthContext.js

import React, { createContext, useEffect, useState } from 'react';
import jwt_decode from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';


//~ 인증 관련 데이터를 공유할 Context를 생성
export const AuthContext = createContext();

//~ 인증 Context의 Provider 컴포넌트 생성
//~ 애플리케이션의 루트 또는 필요한 부분을 감싸 인증 상태를 제공한다.

/* 
  ^ children은 react 컴포넌트가 자식 요소를 포함할 수 있게 해주는 특별한 프로퍼티(prop)
  ^ 컴포넌트 간의 중첩을 가능케 함
  ^ AuthProvider는 Context Provider 역할을 하며, 인증 관련 상태(auth, setAuth)를 하위 컴포넌트들에게 제공하는 역할을 함
  ^ AuthProvider는 children을 받아서 AuthContext.Provider 내부에 포함시킨다 
  ^ 이렇게 함으로써, AuthProvider로 감싸진 모든 자식 컴포넌트들이 AuthContext에 접근할 수 있다.
  ^ App.js에서 애플리케이션의 루트 컴포넌트를 AuthProvider로 감싸면, 그 하위에 있는 모든 컴포넌트들이 인증 상태에 접근할 수 있다.
*/
export const AuthProvider = ({ children }) => {
  //! 인증 상태를 관리하는 state, 초기값은 LocalStorage에서 가져오거나 null로 설정
  //! 페이지 새로고침 시에도 인증 상태를 유지하기 위해 LocalStorage에서 초기값을 불러온다.
  const [auth, setAuth] = useState({
    accessToken: localStorage.getItem('accessToken') || null, // Access Token: 로그인 후 발급받은 액세스 토큰
    refreshToken: localStorage.getItem('refreshToken') || null, // Refresh Token: 액세스 토큰을 갱신하기 위한 리프레시 토큰
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null, // 사용자 정보(사용자 이름, 역할 등)
  });

  /**
   * 토큰 재발급 함수
   * Spring Boot의 /refresh-token 엔드포인트를 호출하여 새로운 access token 토큰을 발급받습니다.
   */
  const refreshToken = async () => {
    try {
      //! Spring Boot 백엔드의 /refresh-token 엔드포인트에 POST 요청을 보냄
      const response = await springBootAxiosInstance.post('/api/members/refresh-token', {
        refreshToken: auth.refreshToken,
      });

      //! 응답 데이터에서 새로운 토큰들과 사용자 정보르 ㄹ추출
      const { accessToken, refreshToken: newRefreshToken, member } = response.data.data;

      //! 인증 상태 업데이트
      setAuth({
        accessToken,
        refreshToken: newRefreshToken,
        user: member,
      });

      //! 새로운 토큰과 사용자 정보를 LocalStorage에 저장
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      localStorage.setItem('user', JSON.stringify(member));

      //! 새로운 access Token 반환
      return accessToken;
    } catch (error) {
      //! 토큰 재발급 실패 시 에러 로그 출력 및 사용자에게 알림
      console.error('토큰 재발급 실패:', error);
      toast.error('세션이 만료되었습니다. 다시 로그인해주세요.');

      //! 인증 상태 초기화
      setAuth({
        accessToken: null,
        refreshToken: null,
        user: null,
      });

      //! LocalStorage에서 인증 정보 제거
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      //! 사용자 로그인 페이지로 리다이렉트
      window.location.href = '/login';
      return null;
    }
  };

  //! 토큰 만료 시 UI 반응 개선
  const handleExpiredToken = () => {
    setAuth({
      accessToken: null,
      refreshToken: null,
      user: null,
    });
    localStorage.clear();
    toast.error('세션이 만료되었습니다. 다시 로그인 해주세요.');
    window.location.href = '/login'; //로그인 페이지로 이동
  };

  //* 공통 인터셉터 로직을 함수로 추출
  const setupInterceptors = (axiosInstance) => {

    //* 요청 인터셉터: 모든 Axios 요청 전에 실행되어 Access Token을 헤더에 추가
    axiosInstance.interceptors.request.use(
      (config) => {
        if (auth.accessToken) {
          //! Authorization 헤더에 Bearer 토큰을 추가
          config.headers['Authorization'] = `Bearer ${auth.accessToken}`;
          console.log("Access Token being set in headers:", auth.accessToken);
        }
        return config; // 수정된 config 반환
      },
      (error) => {
        return Promise.reject(error); // 오류가 발생하면 이를 Promise 체인에 전달
      }
    );

    //* 응답 인터셉터 설정 - 서버 응답 후 실행
    axiosInstance.interceptors.response.use(
      (response) => {
        return response; // 응답이 정상적이면 그대로 반환
      },
      async (error) => {
        const originalRequest = error.config; // 원래의 요청 정보 저장

        //* 응답 상태가 401(Unauthorized)이고, 재시도 요청이 아니며 Refresh Token이 존재할 경우 토큰 재발급 시도
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry &&
          auth.refreshToken
        ) {
          originalRequest._retry = true; // 재시도 플래그 설정하여 무한 재시도 하지 않도록 방지
          console.log("Attempting to refresh token with refreshToken:", auth.refreshToken);
          try{
            const newAccessToken = await refreshToken(); // 토큰 재발급 함수 호출
  
            if (newAccessToken) {
              //! 원래의 요청 헤더에 새로운 Access Token 추가
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
              //! 수정된 요청을 재시도
              return axiosInstance(originalRequest);
            }

          }catch(refreshError){
            console.error('Token refresh failed:', refreshError);
            handleExpiredToken(); // * Refresh Token도 유효하지 않으면 세션 초기화
          }
        }
        
        //* 401 외의 에러 처리
        if(error.response && error.response.status === 401){
          handleExpiredToken(); // 인증 실패 시 세션 초기화
        }

        return Promise.reject(error); // 조건에 해당하지 않으면 오류를 그대로 Promise 체인에 전달
      }
    );

    
  };

  //! Spring Boot용 Axios 인스턴스 생성
  const springBootAxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_SPRING_BOOT_API_URL, // Spring Boot 백엔드 API URL
    // 'Content-Type'을 수동으로 설정하지 않음
  });

  //! Flask용 Axios 인스턴스 생성
  const flaskAxiosInstance = axios.create({
    baseURL: process.env.REACT_APP_FLASK_API_URL, // Flask 백엔드 API URL
    // 'Content-Type'을 수동으로 설정하지 않음
  });

  //! 각 Axios 인스턴스에 인터셉터 설정
  setupInterceptors(springBootAxiosInstance); // Spring Boot 인스턴스에 인터셉터 설정
  setupInterceptors(flaskAxiosInstance); // Flask 인스턴스에 인터셉터 설정

  //! 로그아웃 함수 - 인증 상태와 LocalStorage를 초기화
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



  //* auth 상태가 변경될 때마다 LocalStorage를 업데이트!!
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

  //! AuthContext.Provider를 통해 자식 컴포넌트들에게 auth 상태와 관련 함수들을 전달
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
      {/* Provider로 감싸진 자식 컴포넌트들 */}
      {children}
    </AuthContext.Provider>
  );
};
