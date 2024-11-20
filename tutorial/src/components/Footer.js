/*
페이지 하단에 고정된 영역
보통 저작권 정보나 연락처 배치
*/
// src/components/Footer.js

import React from 'react';

const Footer= ()=>{
    return(
        <footer style={{ padding: '10px', background: '#333', color: '#fff', textAlign: 'center' }}>
            <p>© 2024 My Website. All rights reserved</p>
        </footer>
    );
};

export default Footer;
