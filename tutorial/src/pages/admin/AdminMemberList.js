// src/pages/admin/AdminMemberList.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

const AdminMemberList = () => {
    const { auth, logout, springBootAxiosInstance } = useContext(AuthContext);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();


    useEffect(() => {
        fetchMembers();
    }, []);



    const fetchMembers = async () => {
        try {
            const response = await springBootAxiosInstance.get("/api/members?page=1&limit=10&sort=memEnrollDate,desc");
            const nonAdminMembers = response.data.data.content.filter(member => member.memType !== "ADMIN");
            setMembers(nonAdminMembers); // 관리자를 제외한 멤버를 상태변수 설정
        } catch (error) {
            console.error("멤버를 조회해오면서 에러 발생: ", error);
        } finally {
            setLoading(false); // 조회 성공 혹은 실패 후에 로딩 종료함으로써 로딩 출력 안 함
        }
    };


    const handleMemberClick = (memUuid) => {
        navigate(`/admin/members/${memUuid}`);
    };

    if (loading) return <div>Loading ...</div>


    return (
        <div>
            <h1>회원 목록</h1>
            <table>
                <thead>
                    <tr>
                        <th>UUID</th>
                        <th>아이디</th>
                        <th>이름</th>
                        <th>타입</th>
                        <th>상태</th>
                        <th>상세보기</th>
                    </tr>
                </thead>
                <tbody>
                    {members.map((member) => (
                        <tr key={member.memUuid} >
                            <td>{member.memUuid}</td>
                            <td>{member.memId}</td>
                            <td>{member.memName}</td>
                            <td>{member.memType}</td>
                            <td>{member.memStatus}</td>
                            <td>
                                <button onClick={() => handleMemberClick(member.memUuid)}>보기</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );

};

export default AdminMemberList;