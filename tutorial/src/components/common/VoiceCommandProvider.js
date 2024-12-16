import React, { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export const VoiceCommandContext = createContext();

export const VoiceCommandProvider = ({ children }) => {
  const { flaskAxiosInstance, auth } = useContext(AuthContext);
  const [isListening, setIsListening] = useState(false); // 음성 녹음 상태
  const [stream, setStream] = useState(null); // 마이크 스트림을 저장할 상태 변수
  const [mediaRecorder, setMediaRecorder] = useState(null); // MediaRecorder 객체 상태
  const navigate = useNavigate();

  // 마이크 스트림을 가져오는 useEffect
  useEffect(() => {
    const getUserMedia = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setStream(userStream); // 마이크 스트림을 state로 설정
        console.log("마이크 스트림을 성공적으로 가져왔습니다.");
      } catch (err) {
        console.error('마이크 스트림을 가져오는 데 실패했습니다:', err);
        alert('마이크 권한을 허용해주세요.');
      }
    };
    getUserMedia();
  }, []);

  // 음성 명령을 서버에 전송하는 함수
  const handleStartListening = () => {
    if (!stream) {
      console.error("마이크 스트림을 찾을 수 없습니다.");
      alert("마이크 스트림을 찾을 수 없습니다. 다시 시도해주세요.");
      return;
    }

    if (isListening) {
      // 중지 시 MediaRecorder.stop() 호출
      mediaRecorder.stop();
      console.log("음성 녹음 중지");
      setIsListening(false);
    } else {
      // 시작 시 MediaRecorder 시작
      const recorder = new MediaRecorder(stream);
      console.log("Recorder 상태:", recorder.state);


      // 말동무   : STT (말 -> 텍스트)

      // 페이지 전환: 말 -> FLASK 서버에서 키워드로 판단 (공지사항, 홈)
      // <녹음한 파일 FAKLSK 전달!!!!> -- 생략 
      // <
      // FLASK에서 STT 를 써요
      // 텍스트에 키워드 존재 여부확인 
      // 공지사항 있으면 /NOTICES 
 


      // 텍스트로 

      recorder.onstart = () => {
        console.log("Recorder 상태:", recorder.state); // 'recording'이어야 함
      };

      recorder.start();
      console.log("Recorder 시작 후 상태:", recorder.state); // 'recording'이어야 함

      setMediaRecorder(recorder);
      const chunks = [];

      recorder.ondataavailable = (event) => {
        console.log("받은 데이터:", event.data);
        chunks.push(event.data);
      };

      recorder.onstop = async () => {
        console.log("녹음 종료, 데이터 개수:", chunks.length);
        const audioBlob = new Blob(chunks, { type: 'audio/wav' });
        console.log("생성된 Blob 크기:", audioBlob.size);

        if (audioBlob.size > 0) {
          await sendAudioToServer(audioBlob);
        } else {
          console.error("녹음 데이터가 비어 있습니다.");
        }
      };

      recorder.start();
      console.log("음성 녹음 시작");
      setIsListening(true);
    }
  };

  // 서버에 음성 파일을 보내는 함수
  const sendAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.wav');

    try {
      const response = await flaskAxiosInstance.post('/page-stt', formData);
      console.log("서버 응답:", response.data);

      if (response.status === 200 && response.data.redirect) {
        navigate(response.data.redirect);  // 서버에서 전달된 페이지로 이동
      }
    } catch (error) {
      console.error('서버와의 연결에 실패했습니다:', error.response || error);
      alert('서버와의 연결에 실패했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <VoiceCommandContext.Provider value={{ isListening, handleStartListening }}>
      {children}
    </VoiceCommandContext.Provider>
  );
};
