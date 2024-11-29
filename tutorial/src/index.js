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
  <React.StrictMode>
    <App />
    <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick pauseOnFocusLoss draggable pauseOnHover />
  </React.StrictMode>
);

/*
수정 사항 설명:

1. ToastContainer 추가:
 - 'react-toastify'를 사용하여 ToastContainer를 추가했습니다. 이를 통해 애플리케이션 전반에서 toast 알림을 사용할 수 있습니다.

 2. 스타잉링 확인:
  -  `bootstrap`과 `react-toastify`의 CSS 파일을 올바르게 import 했는지 확인했습니다.
 */