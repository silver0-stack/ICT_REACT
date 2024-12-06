/* 마지막으로, index.js파일을 만들어 React앱을 DOM에 렌더링한다*/
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles.css';
import App from './App';
import 'react-toastify/dist/ReactToastify.css'; // Toastify 스타일 추가
import { ToastContainer } from 'react-toastify';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <>
    <App />
    <ToastContainer 
      position="top-right" 
      autoClose={5000} 
      hideProgressBar={false} 
      newestOnTop={false} 
      closeOnClick 
      pauseOnFocusLoss 
      draggable 
      pauseOnHover 
    />
  </>
);

/*
수정 사항 설명:

1. React.StrictMode 제거:
 - 개발 중 React.StrictMode를 끄면 일부 중복 렌더링 문제가 해결될 수 있습니다.
 - 주의: StrictMode는 개발 환경에서 잠재적인 문제를 미리 발견하는 도구이므로, 프로덕션 환경에서는 비활성화되지 않습니다.

2. ToastContainer 확인:
 - Toastify 스타일과 설정을 그대로 유지했습니다.
 */
