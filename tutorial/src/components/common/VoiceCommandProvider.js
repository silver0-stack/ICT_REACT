// src/components/common/VoiceCommandContext.js

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';  // 필요시 AuthContext도 사용할 수 있습니다

export const VoiceCommandContext = createContext();

export const VoiceCommandProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [stream, setStream] = useState(null);  // 마이크 스트림을 저장할 상태 변수
  const navigate = useNavigate();
  const { flaskAxiosInstance, auth } = useContext(AuthContext);

  // 마이크 스트림을 가져오는 useEffect
  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(userStream);  // 마이크 스트림을 state로 설정
      } catch (err) {
        console.error('마이크 스트림을 가져오는 데 실패했습니다:', err);
      }
    };
    getUserMedia();
  }, []);

  const handleStartListening = () => {
    if (!stream) {
      console.error("마이크 스트림을 찾을 수 없습니다.");
      return;
    }

    setIsListening(true);
    const mediaRecorder = new MediaRecorder(stream);
    const chunks = [];

    mediaRecorder.ondataavailable = (event) => {
      chunks.push(event.data);
    };

    mediaRecorder.onstop = async () => {
      const audioBlob = new Blob(chunks, { type: 'audio/wav' });
      setAudioBlob(audioBlob);
      await sendAudioToServer(audioBlob);
    };

    mediaRecorder.start();
  };

  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    try {
      const response = await flaskAxiosInstance.post('/page-stt', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200) {
        if (response.data.redirect) {
          navigate(response.data.redirect);  // 서버에서 전달된 페이지로 이동
        }
      } else {
        console.log(response.data.message);
      }
    } catch (error) {
      console.error('음성 인식 실패:', error);
    }
  };

  return (
    <VoiceCommandContext.Provider value={{ isListening, handleStartListening }}>
      {children}
    </VoiceCommandContext.Provider>
  );
};
