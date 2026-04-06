import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MainPage from './pages/MainPage';

function App() {
    return (
        <Router>
            <Routes>
                {/* 첫 접속 시 로그인 페이지로 이동 */}
                <Route path="/" element={<LoginPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/main" element={<MainPage />} />
            </Routes>
        </Router>
    );
}

export default App;