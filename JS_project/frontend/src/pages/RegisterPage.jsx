import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';

const RegisterPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nickname: ''
    });
    const [verificationCode, setVerificationCode] = useState('');
    const [isMailSent, setIsMailSent] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/user/join', {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
                experience: 0,
                isVerified: false
            });

            if (response.data.includes("발송")) {
                alert("📜 인증 메일이 발송되었습니다! 메일함을 확인해주세요.");
                setIsMailSent(true);
            } else {
                alert(response.data);
            }
        } catch (error) {
            console.error(error);
            alert("❌ 회원가입 실패: 이미 존재하는 이메일이거나 서버 에러입니다.");
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/user/verify', {
                email: formData.email,
                code: verificationCode
            });

            if (response.data.includes("성공")) {
                alert("✨ 인증 성공! 이제 로그인이 가능합니다.");
                window.location.href = '/login';
            } else {
                alert("⚠️ 인증번호가 일치하지 않습니다.");
            }
        } catch (error) {
            console.error(error);
            alert("인증 처리 중 서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="auth-wrapper">
            <div className="auth-card">
                <h2>{isMailSent ? "이메일 인증" : "용사 등록"}</h2>

                {!isMailSent ? (
                    /* 1단계: 가입 정보 입력 */
                    <form onSubmit={handleRegister}>
                        <div className="auth-form-group">
                            <label>닉네임</label>
                            <input
                                type="text"
                                name="nickname"
                                className="auth-input"
                                placeholder="멋진 이름을 지어주세요"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="auth-form-group">
                            <label>이메일</label>
                            <input
                                type="email"
                                name="email"
                                className="auth-input"
                                placeholder="example@mail.com"
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
                                placeholder="최소 6자 이상"
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn">인증 메일 받기</button>
                    </form>
                ) : (
                    /* 2단계: 인증번호 입력 */
                    <form onSubmit={handleVerify}>
                        <div className="auth-form-group">
                            <p style={{ color: '#636e72', fontSize: '0.9rem', marginBottom: '20px' }}>
                                메일로 전송된 <strong>인증번호 6자리</strong>를<br/> 아래에 입력해 주세요.
                            </p>
                            <input
                                type="text"
                                className="auth-input"
                                style={{ textAlign: 'center', fontSize: '1.2rem', letterSpacing: '5px' }}
                                placeholder="000000"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="auth-btn" style={{ background: '#4CAF50' }}>인증 완료</button>
                        <p style={{ marginTop: '15px', fontSize: '0.8rem', color: '#b2bec3', cursor: 'pointer' }} onClick={() => setIsMailSent(false)}>
                            이메일을 잘못 입력하셨나요?
                        </p>
                    </form>
                )}

                <p className="auth-footer">
                    이미 계정이 있으신가요? <a href="/login">로그인하러 가기</a>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;