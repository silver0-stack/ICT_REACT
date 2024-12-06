import React, { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const NoticeForm = () => {
    const { springBootAxiosInstance } = useContext(AuthContext);
    const [form, setForm] = useState({ notTitle:'', notContent: ''});
    const navigate=useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value});
    };

    const handleSubmit = async(e) => {
        e.preventDefault();

    }

}