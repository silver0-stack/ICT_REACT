/*
? companion.js
! 작성자: 최은영 2024/11/25
*/

import React, { useState } from 'react';
import axios from 'axios';
import { Placeholder } from 'react-bootstrap';

const Companion = () => {
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([]);

    const sendTextMessage = async () => {
        if (!message.trim()) {
            alert("메시지를 입력하세요.");
            return;
        }

        // ? 상태관리할 때 ...상태명, 이거 왜 쓰는거지? 
        setChat([...chat, { sender: '사용자', text: message }]);

        try {
            const response = await axios.post('http://localhost:5000/chat', { message });
            const reply = response.data.reply;
            setChat([...chat, { sender: '사용자', text: message }, { sender: 'AI', text: reply }]);

            // TTS 재생
            const ttsResponse = await axios.post('http://localhost:5000/speak', { text: reply }, { responseType: 'blob' });
            const audioUrl = URL.createObjectURL(ttsResponse.data);
            const audio = new Audio(audioUrl);
            audio.play();
        } catch (error) {
            console.error('Error: ', error);
            alert('메시지 전송에 실파했습니다.');
        }

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
/*
 & My Function
 ! Some Alert
 ^ some stuff
 ? Question
 * Highlights
 ~ Arrow Function
 TODO COLORFUL
*/

// ^ Tested all Cases

// * End of the file
