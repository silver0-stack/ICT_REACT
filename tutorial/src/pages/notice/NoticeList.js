import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const NoticeList= () => {
    const { springBootAxiosInstance, auth } = useContext(AuthContext);
    //! useState(null) 과 useState([])의 차이점:
    //! const { , } 와 const [ , ]의 차이점
    const [ notice, setNotice] = useState([]); 
}