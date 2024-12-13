// src/components/common/VoiceCommandContext.js

import React, { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';  // 필요시 AuthContext도 사용할 수 있습니다

export const VoiceCommandContext = createContext();

export const VoiceCommandProvider = ({ children }) => {
  const [isListening, setIsListening] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const navigate = useNavigate();
  const { flaskAxiosInstance, auth } = useContext(AuthContext);

  const handleStartListening = () => {
    setIsListening(true);
    const mediaRecorder = new MediaRecorder(window.stream);
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
