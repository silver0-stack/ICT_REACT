// src/pages/admin/AdminMemberList.js
import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../context/AuthContext';

const AdminMemberList = () => {
    const { auth, logout, springBootAxiosInstance } = useContext(AuthContext);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();


    useEffect(() => {
        fetchMembers(currentPage);
    }, [currentPage]);



    const fetchMembers = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const response = await springBootAxiosInstance.get(`/api/members?page=${page}&limit=${limit}&sort=memEnrollDate,desc`);
            const nonAdminMembers = response.data.data.content.filter(member => member.memType !== "ADMIN");
            setMembers(nonAdminMembers); // 관리자를 제외한 멤버를 상태변수 설정
            setTotalPages(response.data.data.totalPages); // 총 페이지 수 설정
        } catch (error) {
            console.error("멤버를 조회해오면서 에러 발생: ", error);
        } finally {
            setLoading(false); // 조회 성공 혹은 실패 후에 로딩 종료함으로써 로딩 출력 안 함
        }
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
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

            {/* 페이지네이션 UI */}
            <div style={{ display: "flex", justifyContent: "center", marginTop: "20px" }}>
                <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                >
                    이전
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                    <button
                        key={index + 1}
                        onClick={() => handlePageChange(index + 1)}
                        style={{
                            margin: "0 5px",
                            backgroundColor: currentPage === index + 1 ? "lightblue" : "white",
                        }}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                >
                    다음
                </button>
            </div>
        </div>
    );

};

export default AdminMemberList;