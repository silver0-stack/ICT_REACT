// src/pages/admin/AdminMemberDetail.js
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

const AdminMemberDetail = () => {
    const { memUuid } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);
    const { springBootAxiosInstance } = useContext(AuthContext);

    useEffect(() => {
        fetchMemberDetails();
    }, [memUuid]);

    const fetchMemberDetails = async () => {
        try {
            //! await를 빠뜨리면 비동기 함수의 결과가 아직 반환되지 않은 상태에서 코드를 진행하기 때문에, 
            //! response.data가 정의되지 않은 상태로 접근하려다 에러가 발생했을 것이다.
            const response = await springBootAxiosInstance.get(`/api/members/${memUuid}`);
            //^ response.data = { success, message, data 의 모든 JSON 서버 응답 }
            //^ response.data.data = { data 값. 즉, 메타데이터를 제외한 실제 데이터 }
            setMember(response.data.data);
        } catch (error) {
            console.error("Error fetching member details:", error);
        } finally {
            setLoading(false);
        }
    };



    if (loading) return <div>Loading...</div>;
    if (!member) return <div>회원 정보를 불러오지 못했습니다.</div>;


    return (
        <div>
            <div>회원 상세 정보</div>
            <p><strong>UUID:</strong> {member.memUuid}</p>
            <p><strong>아이디:</strong> {member.memId}</p>
            <p><strong>이름:</strong> {member.memName}</p>
            <p><strong>이메일:</strong> {member.memEmail}</p>
            <p><strong>주소:</strong> {member.memAddress}</p>
            <p><strong>상태:</strong> {member.memStatus}</p>
            <p><strong>가입일:</strong> {member.memEnrollDate}</p>
            <button onClick={() => window.history.back()}>뒤로 가기</button>
        </div>
    );
};

export default AdminMemberDetail;