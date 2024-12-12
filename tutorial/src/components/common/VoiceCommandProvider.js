import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// 음성 인식 Context
export const VoiceCommandContext = createContext();

const VoiceCommandProvider = ({ children }) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState(null);
    const navigate = useNavigate();

    // 음성 인식 시작
    const startListening = useCallback(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('음성 인식 기능을 지원하지 않는 브라우저입니다.');
            return;
        }

        const recognitionInstance = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognitionInstance.lang = 'ko-KR'; // 한국어 음성 인식
        recognitionInstance.interimResults = true; // 중간 결과를 받는다.
        recognitionInstance.maxAlternatives = 1; // 최대 후보 1개

        recognitionInstance.onstart = () => {
            setIsListening(true);
            console.log("음성 인식 시작");
        };

        recognitionInstance.onend = () => {
            setIsListening(false);
            console.log("음성 인식 종료");
        };

        recognitionInstance.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log('음성 인식 결과:', transcript);
            handleVoiceCommand(transcript);
        };

        recognitionInstance.onerror = (event) => {
            console.error('음성 인식 오류:', event.error);
        };

        recognitionInstance.start();
        setRecognition(recognitionInstance);
    }, []);

    // 음성 명령 처리 함수
    const handleVoiceCommand = (command) => {
        if (command.includes('공지사항')) {
            navigate('/notices');  // 공지사항 페이지로 이동
        } else if (command.includes('홈')) {
            navigate('/');  // 홈 페이지로 이동
        } else {
            console.log('알 수 없는 명령입니다.');
        }
    };

    // useEffect에서 상태 변경 시 의존성 배열을 정확히 설정하여 무한 렌더링 방지
    useEffect(() => {
        if (isListening && !recognition) {
            startListening();
        }

        return () => {
            if (recognition) recognition.stop();
        };
    }, [isListening, recognition, startListening]); // 의존성 배열을 정확히 설정

    return (
        <VoiceCommandContext.Provider value={{ isListening, startListening }}>
            {children}
        </VoiceCommandContext.Provider>
    );
};

export default VoiceCommandProvider;
