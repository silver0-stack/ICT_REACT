/*
모든 컴포넌트를 조합하고, react-router-dom 을 사용해 페이지 간 네비게이션을 설정
*/

// src/App.js

import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Login from "./pages/member/Login";
import SignUp from "./pages/member/SignUp";
import LoginResponse from "./pages/member/LoginResponse";
import SignUpResponse from "./pages/member/SignUpResponse";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import MyPage from './pages/member/MyPage';
import Companion from "./pages/Companion";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div style={{ minHeight: "80vh", padding: "20px" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<h1>About Us</h1>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login-response" element={<LoginResponse />} />
            <Route path="/signup-response" element={<SignUpResponse />} />
            <Route
              path="/mypage"
              element={
                <ProtectedRoute>
                  <MyPage />
                </ProtectedRoute>
              }
            />
            {/* 보호된 라우트 예시 */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <h1>Dashboard</h1>
                </ProtectedRoute>
              }
            />


            <Route
              path="/companion"
              element={
                <ProtectedRoute>
                  <Companion />
                </ProtectedRoute>
              } />
          </Routes>
        </div>
        <Footer />
      </Router>
    </AuthProvider>
  );
}

export default App;
