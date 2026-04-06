import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './MainPage.css';

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

    const email = localStorage.getItem('userEmail');

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
            return alert("지인의 이름과 이메일을 모두 입력해주세요!");
        }
        try {
            await axios.post(`http://localhost:8080/api/user/friend/add`, {
                email: email,
                friendEmail: friendEmailInput,
                nickname: friendNicknameInput
            });
            alert(`${friendNicknameInput}님이 지인으로 추가되었습니다!`);
            setFriendEmailInput('');
            setFriendNicknameInput('');
            fetchData();
        } catch (error) {
            alert("지인 추가 실패");
        }
    };

    const handleDeleteFriend = async (id, nickname) => {
        if (!window.confirm(`정말 ${nickname}님을 목록에서 삭제하시겠습니까?`)) return;
        try {
            await axios.delete(`http://localhost:8080/api/user/friend/${id}`);
            alert("지인이 삭제되었습니다.");
            fetchData();
        } catch (error) {
            alert("지인 삭제 중 오류가 발생했습니다.");
        }
    };

    if (!user) return <div className="loading">데이터를 불러오는 중입니다...</div>;

    const activeQuests = todos.filter(t => !t.completed);
    const charInfo = getCharacterInfo(user.level);
    const calculateProgress = (l, e) => {
        const requiredXp = 100 + (l - 1) * 62;
        return Math.min((e / requiredXp) * 100, 100);
    };

    return (
        <div className="main-container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '25px' }}>

            {/* 왼쪽: 달력 */}
            <div style={{ flex: 1 }}>
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
                                            <div className="tooltip-title">
                                                {hasUncompleted ? "❌ 미완료 퀘스트" : "✅ 완료된 퀘스트"}
                                            </div>
                                            <div className="tooltip-list">
                                                {dailyTodos.map((t, idx) => (
                                                    <div key={idx} className="tooltip-todo">
                                                        {t.completed ? "✔️" : "🔥"} {t.title}
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="tooltip-tail"></div>
                                        </div>
                                    </div>
                                );
                            }
                        }
                        return null;
                    }}
                    tileClassName={null}
                />
                <p style={{ textAlign: 'center', marginTop: '15px', color: '#00cec9', fontWeight: 'bold', fontSize: '1.1rem' }}>
                    📍 선택된 날짜: {getLocalDateString(selectedDate)}
                </p>
            </div>

            {/* 중간: 캐릭터 & 퀘스트 입력 */}
            <div style={{ flex: 1.2 }}>
                <div className="character-container">
                    <img src={charInfo.img} alt="Char" className="character-img" />
                    <div className="character-rank">{charInfo.rank}</div>
                </div>

                <div className="stats-box" style={{ backgroundColor: '#2d3436', color: 'white', padding: '20px', borderRadius: '15px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 'bold' }}>Lv. {user.level}</span>
                        <span>{user.nickname}님</span>
                    </div>
                    <div className="progress-bar-bg" style={{ width: '100%', height: '12px', backgroundColor: '#636e72', borderRadius: '6px', overflow: 'hidden' }}>
                        <div className="progress-bar-fill" style={{ width: `${calculateProgress(user.level, user.experience)}%`, height: '100%', backgroundColor: '#00cec9', transition: '0.8s ease-in-out' }}></div>
                    </div>
                </div>

                {/* 🌟 [수정 포인트] 새 퀘스트 입력 폼 디자인 개선 */}
                <form className="quest-add-form" onSubmit={(e) => {
                    e.preventDefault();
                    if (!newTodo.trim()) return alert("내용을 입력하세요!");
                    const formattedDate = getLocalDateString(selectedDate) + "T00:00:00";
                    axios.post(`http://localhost:8080/api/todo/add?email=${email}`, { title: newTodo, deadline: formattedDate }).then(() => { setNewTodo(''); fetchData(); });
                }}>
                    <input
                        type="text"
                        className="quest-input"
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="새로운 모험(퀘스트)을 입력하세요..."
                    />
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
                                        <div style={{ fontWeight: 'bold', fontSize: '1.05rem' }}>{todo.title}</div>
                                        <div style={{ fontSize: '0.85rem', color: '#636e72', marginTop: '3px' }}>📅 마감: {todo.deadline?.split('T')[0]}</div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={() => editingId === todo.id ? handleUpdateTitle(todo.id) : (setEditingId(todo.id), setEditTitle(todo.title))} className="btn-edit">저장</button>
                                <button onClick={() => handleComplete(todo.id)} className="btn-complete">완료</button>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>

            {/* 오른쪽: 지인 추가 & 랭킹 */}
            <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="side-card">
                    <h3 style={{ marginBottom: '15px' }}>⚔️ 감시자(지인) 등록</h3>
                    {/* 🌟 [수정 포인트] 지인 추가 폼 디자인 개선 */}
                    <form className="friend-add-form" onSubmit={handleAddFriend}>
                        <div className="friend-input-group">
                            <label>닉네임</label>
                            <input type="text" placeholder="별명 (예: 감시자1)" value={friendNicknameInput} onChange={(e) => setFriendNicknameInput(e.target.value)} />
                        </div>
                        <div className="friend-input-group">
                            <label>이메일</label>
                            <input type="email" placeholder="example@mail.com" value={friendEmailInput} onChange={(e) => friendEmailInput(e.target.value)} />
                        </div>
                        <button type="submit" className="friend-add-btn">소환하기</button>
                    </form>
                </div>

                <div className="side-card">
                    <h3 style={{ color: '#0984e3', marginBottom: '15px' }}>👥 내 지인 목록 ({friends.length})</h3>
                    <div className="friend-list">
                        {friends.map(f => (
                            <div key={f.id} className="friend-item-wrapper">
                                <div className="friend-item">
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span className="friend-name">{f.friendNickname || f.email.split('@')[0]}</span>
                                        <span className="friend-level">Lv.{f.user?.level || 0}</span>
                                    </div>
                                    <button onClick={() => handleDeleteFriend(f.id, f.friendNickname || f.email.split('@')[0])} className="btn-delete-friend">삭제</button>
                                </div>
                                <div className="friend-tooltip-box">
                                    <div className="tooltip-title">📧 지인 이메일</div>
                                    <div className="tooltip-email">{f.email}</div>
                                    <div className="tooltip-tail"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="side-card ranking-card">
                    <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>🏆 명예의 전당</h3>
                    {ranking.slice(0, 10).map((r, i) => (
                        <div key={r.id} className={`rank-item ${r.email === email ? 'my-rank' : ''}`} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', marginBottom: '8px', borderRadius: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ fontWeight: 'bold', color: i < 3 ? '#f1c40f' : '#333', fontSize: '1.1rem' }}>{i + 1}.</span>
                                <span style={{ fontWeight: r.email === email ? 'bold' : 'normal' }}>{r.nickname}</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', color: '#0984e3', fontWeight: 'bold' }}>Lv.{r.level}</span>
                        </div>
                    ))}
                </div>
            </div>

            {isLevelUpModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h1>🎉 LEVEL UP!</h1>
                        <h2>Lv. {user.level} 달성!</h2>
                        <button onClick={() => setIsLevelUpModalOpen(false)}>확인</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainPage;