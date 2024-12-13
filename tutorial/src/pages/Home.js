import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { VoiceCommandContext } from '../components/common/VoiceCommandProvider';

const Home = () => {
    const { isListening, handleStartListening } = useContext(VoiceCommandContext); // Context에서 값 가져오기
    const { auth } = useContext(AuthContext);

    return (
        <div className="home-container">
            <h1>Welcome to the Home Page!</h1>
            {auth.user ? (
                <>
                    <p>안녕하세요, {auth.user.memName}님!</p>
                    <nav>
                        <ul>
                            <li><Link to="/companion">말동무</Link></li>
                        </ul>
                    </nav>
                </>
            ) : (
                <p>Please <a href="/login">login</a> or <a href="/signup">sign up</a>.</p>
            )}
             <button onClick={handleStartListening}>
                {isListening ? '음성 녹음 중지' : '음성 녹음 시작'}
            </button>
        </div>
    );
};

export default Home;
