import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { VoiceCommandContext } from '../components/common/VoiceCommandProvider';

const Companion = () => {
  const [message, setMessage] = useState('');
  const [chat, setChat] = useState([]);
  const { flaskAxiosInstance, auth } = useContext(AuthContext);

  //const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const { isListening, handleStartListening } = useContext(VoiceCommandContext); // VoiceCommandContext에서 가져오기

  // 음성 인식 시작
  const chat_startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('음성 인식 기능을 지원하지 않는 브라우저입니다.');
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.lang = 'ko-KR';  // 한국어 음성 인식
    recognitionInstance.interimResults = true;  // 중간 결과도 받기
    recognitionInstance.maxAlternatives = 1;  // 최대 후보 1개

    // recognitionInstance.onstart = () => {
    //   console.log('음성 인식 시작');
    //   setIsListening(true);
    // };

    // recognitionInstance.onend = () => {
    //   console.log('음성 인식 종료');
    //   setIsListening(false);
    // };

    recognitionInstance.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      console.log('음성 인식 결과:', transcript);
      setMessage(transcript);
    };

    recognitionInstance.start();
    setRecognition(recognitionInstance);
  };

  const sendTextMessage = async () => {
    if (!message.trim()) {
      alert('메시지를 입력하세요.');
      return;
    }

    setChat([...chat, { sender: '사용자', text: message }]);

    try {
      const response = await flaskAxiosInstance.post('/chat', { message });
      const reply = response.data.reply;

      setChat([...chat, { sender: '사용자', text: message }, { sender: 'AI', text: reply }]);

      const ttsResponse = await flaskAxiosInstance.post('/speak', { text: reply }, { responseType: 'blob' });
      const audioUrl = URL.createObjectURL(ttsResponse.data);
      const audio = new Audio(audioUrl);
      audio.play();
    } catch (error) {
      console.error('Error: ', error);
      alert('메시지 전송에 실패했습니다.');
    }

    setMessage('');
  };

  useEffect(() => {
    if (isListening) {
      chat_startListening();
    } else if (recognition) {
      recognition.stop();
    }

    return () => {
      if (recognition) recognition.stop();
    };
  }, [isListening, recognition]);

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

        {/* 음성 인식 시작/중지 버튼 */}
        <button onClick={() => handleStartListening()}>
          {isListening ? '음성 녹음 중지' : '음성 녹음 시작'}
        </button>

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
