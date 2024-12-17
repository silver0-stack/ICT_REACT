import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useTable } from "react-table";
import ReactPaginate from "react-paginate";
import styles from "./AdminMemberList.module.css";

const AdminMemberList = () => {
    const { springBootAxiosInstance } = useContext(AuthContext);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMembers(currentPage);
    }, [currentPage]);

    const fetchMembers = async (page = 1, limit = 10) => {
        setLoading(true);
        try {
            const response = await springBootAxiosInstance.get(
                `/api/members?page=${page}&limit=${limit}&sort=memEnrollDate,desc`
            );
            const nonAdminMembers = response.data.data.content.filter(
                (member) => member.memType !== "ADMIN"
            );
            setMembers(nonAdminMembers);
            setTotalPages(response.data.data.totalPages);
        } catch (error) {
            console.error("멤버를 조회해오면서 에러 발생: ", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event) => {
        const selectedPage = event.selected + 1;
        setCurrentPage(selectedPage);
    };

    const handleMemberClick = (memUuid) => {
        navigate(`/admin/members/${memUuid}`);
    };

    const columns = React.useMemo(
        () => [
            { Header: "UUID", accessor: "memUuid" },
            { Header: "아이디", accessor: "memId" },
            { Header: "이름", accessor: "memName" },
            { Header: "타입", accessor: "memType" },
            { Header: "상태", accessor: "memStatus" },
            {
                Header: "상세보기",
                Cell: ({ row }) => (
                    <button onClick={() => handleMemberClick(row.original.memUuid)}>
                        보기
                    </button>
                ),
            },
        ],
        []
    );

    const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
        useTable({ columns, data: members });

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>회원 목록</h1>
            {/* React Table */}
            <div className={styles["table-container"]}>
                <table {...getTableProps()} className={styles.table}>
                    <thead>
                        {headerGroups.map((headerGroup) => (
                            <tr {...headerGroup.getHeaderGroupProps()}>
                                {headerGroup.headers.map((column) => (
                                    <th {...column.getHeaderProps()}>{column.render("Header")}</th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody {...getTableBodyProps()}>
                        {rows.map((row) => {
                            prepareRow(row);
                            return (
                                <tr {...row.getRowProps()}>
                                    {row.cells.map((cell) => (
                                        <td {...cell.getCellProps()}>{cell.render("Cell")}</td>
                                    ))}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* ReactPaginate UI */}
            <ReactPaginate
                previousLabel={"이전"}
                nextLabel={"다음"}
                breakLabel={"..."}
                breakClassName={styles["break-me"]}
                pageCount={totalPages}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                containerClassName={styles.pagination}
                activeClassName={styles.active}
                disabledClassName={styles.disabled}
                forcePage={currentPage - 1}
            />
        </div>
    );
};

export default AdminMemberList;
