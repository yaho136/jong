import React, { useState } from 'react';
import axios from 'axios';

const RegisterPage = () => {
    // 1. 회원가입 및 인증 상태 관리
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nickname: ''
    });
    const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력할 인증번호
    const [isMailSent, setIsMailSent] = useState(false); // 메일 발송 여부 확인

    // 입력값 변경 처리
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // 2. [회원가입 및 인증 메일 받기] 버튼 클릭 시
    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/user/join', {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
                experience: 0,     // 초기 경험치
                isVerified: false  // 초기 인증 상태
            });

            if (response.data.includes("발송")) {
                alert("인증 메일이 발송되었습니다. 메일함을 확인해주세요!");
                setIsMailSent(true); // 인증번호 입력창 보여주기
            } else {
                alert(response.data);
            }
        } catch (error) {
            console.error(error);
            alert("회원가입 실패: 이미 존재하는 이메일이거나 서버 에러입니다.");
        }
    };

    // 3. [인증 완료] 버튼 클릭 시 (가장 중요한 부분!)
    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/api/user/verify', {
                email: formData.email,
                code: verificationCode
            });

            // 백엔드 응답 메시지에 "성공" 이라는 단어가 포함되어 있다면
            if (response.data.includes("성공")) {
                alert("인증 성공! 로그인 페이지로 이동합니다.");

                // 🌟 핵심: 성공 시 로그인 페이지로 강제 이동 🌟
                window.location.href = '/login';
            } else {
                alert("인증번호가 일치하지 않습니다. 다시 확인해주세요.");
            }
        } catch (error) {
            console.error(error);
            alert("인증 처리 중 서버 오류가 발생했습니다.");
        }
    };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h2>회원가입</h2>

            {!isMailSent ? (
                /* 가입 폼 */
                <form onSubmit={handleRegister}>
                    <div style={{ marginBottom: '10px' }}>
                        <input type="email" name="email" placeholder="이메일" onChange={handleChange} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type="password" name="password" placeholder="비밀번호" onChange={handleChange} required />
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                        <input type="text" name="nickname" placeholder="닉네임" onChange={handleChange} required />
                    </div>
                    <button type="submit">인증 메일 받기</button>
                </form>
            ) : (
                /* 인증번호 입력 폼 */
                <form onSubmit={handleVerify}>
                    <p>메일로 전송된 인증번호 6자리를 입력하세요.</p>
                    <div style={{ marginBottom: '10px' }}>
                        <input
                            type="text"
                            placeholder="인증번호 6자리"
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white' }}>인증 완료</button>
                </form>
            )}

            <p style={{ marginTop: '15px' }}>
                이미 계정이 있으신가요? <a href="/login">로그인하러 가기</a>
            </p>
        </div>
    );
};

export default RegisterPage;