import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MainPage.css';


import logoImg from '../assets/logo.png';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const MainPage = () => {
    const [user, setUser] = useState(null);
    const [todos, setTodos] = useState([]);
    const [ranking, setRanking] = useState([]);
    const [friends, setFriends] = useState([]);
    const [newTodo, setNewTodo] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isLevelUpModalOpen, setIsLevelUpModalOpen] = useState(false);
    const [previousLevel, setPreviousLevel] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [friendEmailInput, setFriendEmailInput] = useState('');
    const [friendNicknameInput, setFriendNicknameInput] = useState('');

    const chartData = [
        { name: '월', 성공: 2, 실패: 1 },
        { name: '화', 성공: 4, 실패: 0 },
        { name: '수', 성공: 3, 실패: 2 },
        { name: '목', 성공: 5, 실패: 0 },
        { name: '금', 성공: 1, 실패: 1 },
        { name: '토', 성공: 0, 실패: 0 },
        { name: '일', 성공: 0, 실패: 0 },
    ];

    const email = localStorage.getItem('userEmail');

    const handleLogout = () => {
        if (!window.confirm("정말 로그아웃하시겠습니까?")) return;

        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');

        window.location.href = '/login';
    };

    const getCharacterInfo = (level = 1) => {
        if (level >= 10) return { img: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero", rank: "전설의 용사" };
        if (level >= 5) return { img: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Knight", rank: "숙련된 기사" };
        if (level >= 2) return { img: "https://api.dicebear.com/7.x/bottts/svg?seed=BabySlime", rank: "로봇이" };
        return { img: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Egg", rank: "초보 모험가(알)" };
    };

    const getLocalDateString = (date) => {
        if (!date) return "";
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchData = async () => {
        if (!email) return;
        try {
            const [userRes, todoRes, rankingRes, friendRes] = await Promise.all([
                axios.get(`http://localhost:8080/api/user/info?email=${email}`),
                axios.get(`http://localhost:8080/api/todo/list?email=${email}`),
                axios.get(`http://localhost:8080/api/user/ranking`),
                axios.get(`http://localhost:8080/api/user/friend/list?email=${email}`)
            ]);

            const userData = userRes.data || {};
            setUser(userData);
            setTodos(Array.isArray(todoRes.data) ? todoRes.data : []);
            setRanking(Array.isArray(rankingRes.data) ? rankingRes.data : []);
            setFriends(Array.isArray(friendRes.data) ? friendRes.data : []);

            if (previousLevel !== null && userData.level > previousLevel) {
                setIsLevelUpModalOpen(true);
            }
            setPreviousLevel(userData.level || 1);
        } catch (error) {
            console.error("데이터 로딩 실패:", error);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token || !email) { window.location.href = '/login'; return; }
        fetchData();
    }, []);

    const handleUpdateTitle = async (id) => {
        if (!editTitle.trim()) { setEditingId(null); return; }
        try {
            await axios.put(`http://localhost:8080/api/todo/${id}/update`, { title: editTitle });
            setEditingId(null);
            fetchData();
        } catch (error) { alert("수정에 실패했습니다."); }
    };

    const handleComplete = async (id) => {
        try { await axios.put(`http://localhost:8080/api/todo/${id}/complete`); fetchData(); }
        catch (error) { alert("완료 처리 오류"); }
    };

    const handleAddFriend = async (e) => {
        e.preventDefault();
        if (!friendEmailInput.trim() || !friendNicknameInput.trim()) {
            return alert("감시자의 이름과 이메일을 모두 입력해주세요!");
        }
        try {
            await axios.post(`http://localhost:8080/api/user/friend/add`, {
                email: email,
                friendEmail: friendEmailInput,
                nickname: friendNicknameInput
            });
            alert(`${friendNicknameInput}님이 감시자로 소환되었습니다!`);
            setFriendEmailInput('');
            setFriendNicknameInput('');
            fetchData();
        } catch (error) {
            alert("감시자 소환 실패");
        }
    };

    const handleDeleteFriend = async (id, nickname) => {
        if (!window.confirm(`정말 ${nickname}님을 목록에서 삭제하시겠습니까?`)) return;
        try {
            await axios.delete(`http://localhost:8080/api/user/friend/${id}`);
            alert("목록에서 삭제되었습니다.");
            fetchData();
        } catch (error) {
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    if (!user) return <div className="loading">월드 데이터를 불러오는 중...</div>;

    const activeQuests = todos.filter(t => !t.completed);
    const charInfo = getCharacterInfo(user.level);
    const calculateProgress = (l, e) => {
        const requiredXp = 100 + (l - 1) * 62;
        return Math.min((e / requiredXp) * 100, 100);
    };

    return (
        <div style={{ backgroundColor: '#1e272e', minHeight: '100vh' }}>

            <header className="main-header" style={{ textAlign: 'center', padding: '20px 0', borderBottom: '4px solid #f1c40f', background: '#2c3e50', marginBottom: '30px' }}>
                <div className="main-logo-container" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    <img src={logoImg} alt="고자질 캘린더" className="main-header-logo" style={{ maxWidth: '350px', width: '100%', height: 'auto' }} />
                </div>
                <p style={{ color: '#bdc3c7', marginTop: '5px', fontSize: '1.1rem' }}>
                    모험가 <span style={{ color: '#00cec9', fontWeight: 'bold' }}>{user.nickname}</span>님의 퀘스트 보드

                    {/* 🌟 [추가] 로그아웃 버튼 */}
                    <button
                        onClick={handleLogout}
                        style={{
                            marginLeft: '20px',
                            padding: '6px 14px',
                            background: '#e74c3c',
                            color: 'white',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '5px',
                            fontSize: '0.85rem',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                            transition: '0.3s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#c0392b'}
                        onMouseOut={(e) => e.target.style.background = '#e74c3c'}
                    >
                        로그아웃
                    </button>
                </p>
            </header>

            <div className="main-container" style={{ display: 'flex', gap: '25px', padding: '0 20px', alignItems: 'flex-start' }}>

                {/* 왼쪽 + 중간 묶음 (그래프 확장 레이아웃) */}
                <div style={{ flex: 2.2, display: 'flex', flexDirection: 'column', gap: '20px' }}>

                    <div style={{ display: 'flex', gap: '25px' }}>
                        {/* 왼쪽: 달력 섹션 */}
                        <div style={{ flex: 1 }} className="calendar-section">
                            <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📅 퀘스트 달력</h2>
                            <Calendar
                                onChange={setSelectedDate}
                                value={selectedDate}
                                formatDay={(locale, date) => date.getDate()}
                                tileContent={({ date, view }) => {
                                    if (view === 'month') {
                                        const dateString = getLocalDateString(date);
                                        const dailyTodos = todos.filter(t => t.deadline?.split('T')[0] === dateString);
                                        if (dailyTodos.length > 0) {
                                            const hasUncompleted = dailyTodos.some(t => !t.completed);
                                            const dotColor = hasUncompleted ? '#ff7675' : '#007bff';
                                            return (
                                                <div className="quest-indicator-wrapper">
                                                    <div className="quest-dot" style={{ backgroundColor: dotColor }}></div>
                                                    <div className="quest-tooltip-box">
                                                        <div className="tooltip-title">{hasUncompleted ? "❌ 미완료" : "✅ 완료"}</div>
                                                        <div className="tooltip-list">
                                                            {dailyTodos.map((t, idx) => (<div key={idx} className="tooltip-todo">{t.completed ? "✔️" : "🔥"} {t.title}</div>))}
                                                        </div>
                                                        <div className="tooltip-tail"></div>
                                                    </div>
                                                </div>
                                            );
                                        }
                                    }
                                    return null;
                                }}
                            />
                            <p style={{ textAlign: 'center', marginTop: '15px', color: '#00cec9', fontWeight: 'bold' }}>
                                📍 선택된 날짜: {getLocalDateString(selectedDate)}
                            </p>
                        </div>

                        {/* 중간: 캐릭터 & 퀘스트 입력 */}
                        <div style={{ flex: 1.2 }}>
                            <div className="character-container">
                                <img src={charInfo.img} alt="Char" className="character-img" />
                                <div className="character-rank">{charInfo.rank}</div>
                            </div>
                            <div className="stats-box" style={{ background: '#2c3e50', border: '2px solid #f1c40f', padding: '15px', marginBottom: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontWeight: 'bold' }}>Lv. {user.level}</span>
                                    <span>{user.nickname}</span>
                                </div>
                                <div className="progress-bar-bg" style={{ width: '100%', height: '12px', background: '#1e272e', overflow: 'hidden' }}>
                                    <div className="progress-bar-fill" style={{ width: `${calculateProgress(user.level, user.experience)}%`, height: '100%', background: '#00cec9', transition: '0.8s' }}></div>
                                </div>
                            </div>
                            <form className="quest-add-form" onSubmit={(e) => {
                                e.preventDefault();
                                if (!newTodo.trim()) return alert("내용을 입력하세요!");
                                const formattedDate = getLocalDateString(selectedDate) + "T00:00:00";
                                axios.post(`http://localhost:8080/api/todo/add?email=${email}`, { title: newTodo, deadline: formattedDate }).then(() => { setNewTodo(''); fetchData(); });
                            }}>
                                <input type="text" className="quest-input" value={newTodo} onChange={(e) => setNewTodo(e.target.value)} placeholder="새로운 퀘스트를 수락하시겠습니까?" />
                                <button type="submit" className="quest-add-btn">수락</button>
                            </form>
                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                {activeQuests.map(todo => (
                                    <li key={todo.id} className="todo-item">
                                        <div style={{ flex: 1 }}>
                                            {editingId === todo.id ? (
                                                <input type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle(todo.id)} autoFocus className="edit-input" />
                                            ) : (
                                                <div onClick={() => { setEditingId(todo.id); setEditTitle(todo.title); }} style={{ cursor: 'pointer' }}>
                                                    <div style={{ fontWeight: 'bold' }}>{todo.title}</div>
                                                    <div style={{ fontSize: '0.8rem', color: '#bdc3c7' }}>마감: {todo.deadline?.split('T')[0]}</div>
                                                </div>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => editingId === todo.id ? handleUpdateTitle(todo.id) : (setEditingId(todo.id), setEditTitle(todo.title))} className="btn-edit">수정</button>
                                            <button onClick={() => handleComplete(todo.id)} className="btn-complete">완료</button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* 하단: 가로로 긴 주간 전투 통계 그래프 */}
                    <div className="side-card" style={{ height: '400px', border: '3px solid #f1c40f', background: '#2c3e50', padding: '20px' }}>
                        <h3 style={{ textAlign: 'center', marginBottom: '20px', color: '#f1c40f' }}>📊 주간 퀘스트 통계</h3>
                        <ResponsiveContainer width="100%" height="85%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                                <XAxis dataKey="name" stroke="#bdc3c7" fontSize={12} />
                                <YAxis stroke="#bdc3c7" fontSize={12} />
                                <Tooltip contentStyle={{ backgroundColor: '#2d3436', border: '1px solid #f1c40f' }} />
                                <Legend />
                                <Line type="monotone" dataKey="성공" stroke="#00cec9" strokeWidth={3} dot={{ r: 5 }} />
                                <Line type="monotone" dataKey="실패" stroke="#e74c3c" strokeWidth={3} dot={{ r: 5 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* 오른쪽: 감시자 & 랭킹 */}
                <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="side-card">
                        <h3>⚔️ 감시자 소환</h3>
                        <form className="friend-add-form" onSubmit={handleAddFriend}>
                            <div className="friend-input-group">
                                <label>닉네임</label>
                                <input type="text" value={friendNicknameInput} onChange={(e) => setFriendNicknameInput(e.target.value)} />
                            </div>
                            <div className="friend-input-group">
                                <label>이메일</label>
                                <input type="email" value={friendEmailInput} onChange={(e) => setFriendEmailInput(e.target.value)} />
                            </div>
                            <button type="submit" className="friend-add-btn">소환하기</button>
                        </form>
                    </div>

                    <div className="side-card">
                        <h3>👥 내 감시자들 ({friends.length})</h3>
                        {friends.map(f => (
                            <div key={f.id} className="friend-item-wrapper">
                                <div className="friend-item">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="friend-name">{f.friendNickname || f.email.split('@')[0]}</span>
                                        <span className="friend-level">Lv.{f.user?.level || 0}</span>
                                    </div>
                                    <button onClick={() => handleDeleteFriend(f.id, f.friendNickname || f.email.split('@')[0])} className="btn-delete-friend" style={{ padding: '5px', background: '#e74c3c', color: 'white', border: 'none', cursor: 'pointer' }}>추방</button>
                                </div>
                                <div className="friend-tooltip-box">
                                    <div className="tooltip-title">📧 식별 정보</div>
                                    <div className="tooltip-email">{f.email}</div>
                                    <div className="tooltip-tail"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="side-card">
                        <h3 style={{ textAlign: 'center' }}>🏆 명예의 전당</h3>
                        {ranking.slice(0, 10).map((r, i) => (
                            <div key={r.id} className={`rank-item ${r.email === email ? 'my-rank' : ''}`} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{i + 1}. {r.nickname}</span>
                                <span style={{ color: '#f1c40f' }}>Lv.{r.level}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 레벨업 모달 */}
            {isLevelUpModalOpen && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div className="modal-content" style={{ background: '#2c3e50', border: '5px solid #f1c40f', padding: '40px', textAlign: 'center' }}>
                        <h1>🎉 LEVEL UP!</h1>
                        <h2>Lv. {user.level} 달성!</h2>
                        <button onClick={() => setIsLevelUpModalOpen(false)} className="quest-add-btn" style={{ padding: '10px 30px' }}>확인</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainPage;