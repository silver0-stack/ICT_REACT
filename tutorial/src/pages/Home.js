/* 홈 페이지를 추가혀여 기본적인 환영 메시지를 표시 */
// src/components/Home.js

import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
    const { auth } = useContext(AuthContext);

    return (
        <div className="home-container">
            <h1>Welcome to the Home Page!</h1>
            {auth.user? (
                <><p>안녕하세요, {auth.user.memName}님!</p><nav>
                    <ul>
                        <li><Link to="/companion">말동무</Link></li>
                    </ul>
                </nav></>
            ): (
                <p>Please <a href="/login">login</a> or <a href="/signup">sign up</a>.</p>
            )}
        </div>
    )
}

export default Home;