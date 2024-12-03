// src/components/Companion.js

import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Companion = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { flaskAxiosInstance, auth } = useContext(AuthContext); // auth 가져오기

  const sendTextMessage = async () => {
    if (!message.trim()) {
      alert("메시지를 입력하세요.");
      return;
    }

    // 사용자 메시지를 먼저 채팅 목록에 추가
    setChat([...chat, { sender: '사용자', text: message }]);

    try {
      // 토큰 확인 로그 추가
      console.log("Access Token being sent:", auth.accessToken);

      // Flask 백엔드로 메시지 전송 시 Authorization 헤더에 Bearer 토큰 포함
      const response = await flaskAxiosInstance.post(
        '/chat',
        { message }
      );
      const reply = response.data.reply;

      // AI 응답을 채팅 목록에 추가
      setChat([...chat, { sender: '사용자', text: message }, { sender: 'AI', text: reply }]);

      // TTS 재생
      const ttsResponse = await flaskAxiosInstance.post('/speak', { text: reply }, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(ttsResponse.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error: ', error);
      if (error.response && error.response.data && error.response.data.message) {
        alert(`메시지 전송에 실패했습니다: ${error.response.data.message}`);
      } else {
        alert('메시지 전송에 실패했습니다.');
      }
    }

    // 입력 필드 초기화
    setMessage('');
  };

  return (
    <div>
      <h2>말동무 서비스</h2>
      <div>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => { if (e.key === 'Enter') sendTextMessage(); }}
        />
        <button onClick={sendTextMessage}>전송</button>
      </div>
      <div>
        {chat.map((msg, index) => (
          <p key={index}><strong>{msg.sender}:</strong> {msg.text}</p>
        ))}
      </div>
    </div>
  );
};

export default Companion;
