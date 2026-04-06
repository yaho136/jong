import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import logoImg from '../assets/logo.png';

const LoginPage = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/user/login', {
                email: formData.email,
                password: formData.password
            });
            const token = response.data;
            if (token && typeof token === 'string' && token.startsWith('ey')) {
                localStorage.setItem('token', token);
                localStorage.setItem('userEmail', formData.email);
                alert("⚔️ 고자질 월드에 입장하셨습니다!");
                window.location.href = '/main';
            } else {
                alert(token);
            }
        } catch (error) {
            alert("❌ 접속 실패: 식별 정보를 다시 확인하세요.");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                {/* 🌟 로고 이미지 영역 */}
                <div className="auth-logo-container">
                    <img src={logoImg} alt="고자질 캘린더" className="auth-logo-img" />
                </div>


                <form onSubmit={handleLogin}>
                    <div className="auth-form-group">
                        <label>이메일 주소</label>
                        <input
                            type="email"
                            name="email"
                            className="auth-input"
                            placeholder="hero@quest.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="auth-form-group">
                        <label>비밀번호</label>
                        <input
                            type="password"
                            name="password"
                            className="auth-input"
                            placeholder="비밀번호 입력"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-btn">입장하기 (로그인)</button>
                </form>

                <div className="auth-footer">
                    <p>아직 회원이 아니신가요?</p>
                    <span className="auth-footer-link">
                        <a href="/register">회원가입 하러가기</a>
                    </span>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;