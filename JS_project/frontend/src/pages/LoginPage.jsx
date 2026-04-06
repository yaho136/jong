import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
    // 이메일과 비밀번호 입력을 관리하는 상태(state)
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // 입력값이 바뀔 때마다 실행되는 함수
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 로그인 버튼을 눌렀을 때 실행되는 핵심 로직
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            // 백엔드 서버(8080)로 로그인 요청을 보냅니다.
            const response = await axios.post('http://localhost:8080/api/user/login', {
                email: formData.email,
                password: formData.password
            });

            // 서버에서 응답으로 온 데이터 (JWT 토큰)
            const token = response.data;

            // JWT 토큰은 보통 'ey'로 시작합니다. 성공적인 토큰인지 확인!
            if (token && typeof token === 'string' && token.startsWith('ey')) {
                localStorage.setItem('token', token); // 브라우저에 토큰 저장
                localStorage.setItem('userEmail', formData.email); // 이메일도 저장
                alert("로그인 성공! 환영합니다.");
                window.location.href = '/main'; // 메인 페이지로 이동
            } else {
                // "비밀번호가 틀렸습니다" 등의 메시지 출력
                alert(token);
            }
        } catch (error) {
            console.error("로그인 에러:", error);
            alert("로그인 실패: 이메일 인증 여부나 비밀번호를 확인하세요.");
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>로그인</h2>
            <form onSubmit={handleLogin}>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="email"
                        name="email"
                        placeholder="이메일 입력"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div style={{ marginBottom: '10px' }}>
                    <input
                        type="password"
                        name="password"
                        placeholder="비밀번호 입력"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">로그인</button>
            </form>
            <p>
                계정이 없으신가요? <a href="/register">회원가입</a>
            </p>
        </div>
    );
};

// 🌟 아까 에러의 원인이었던 부분입니다. 이 줄이 반드시 있어야 App.jsx에서 읽을 수 있습니다!
export default LoginPage;