import React, { useState, useEffect, useRef } from 'react'
import { Trophy, Shield, RotateCcw, Plus, LogOut } from 'lucide-react'
import bgImg from '../public/bg.png.png'
import logoImg from '../public/logo.png.png'

// Constants
const CLASSES = [
  { id: 'he', name: '和班', teams: 9, password: '0001' },
  { id: 'ping', name: '平班', teams: 8, password: '0002' }
];
// 備用 API 網址 (當 GitHub Secrets 沒設好時使用)
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbwYZxjKwm6YK4G0auFUtoQ6i0z22GA0touzv7JbGfTg5YXG5JF9QD9xH45B45sAt0z0/exec';

function App() {
  const [currentPage, setCurrentPage] = useState('scoreboard');
  const [selectedClass, setSelectedClass] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPwd, setResetPwd] = useState('');
  
  const isUpdatingRef = useRef(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  const setUpdateLock = (val) => {
    isUpdatingRef.current = val;
    setIsUpdatingState(val);
  };

  const fetchScores = async (force = false) => {
    if (isUpdatingRef.current && !force) return;
    
    setLoading(true);
    try {
      const url = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || DEFAULT_URL;
      
      const response = await fetch(`${url}?t=${Date.now()}&r=${Math.random()}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setScores(data);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    let interval;
    if (currentPage === 'scoreboard' || currentPage === 'gm') {
      const ms = currentPage === 'scoreboard' ? 8000 : 10000;
      interval = setInterval(() => fetchScores(), ms);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPage]);

  const handleUpdateScore = async (teamName, increment) => {
    if (isUpdatingRef.current) return;
    
    setUpdateLock(true);
    // 立即本地更新
    setScores(prev => prev.map(t => 
      t.team === teamName ? { ...t, score: (t.score || 0) + increment } : t
    ));

    const url = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || DEFAULT_URL;
    if (url) {
      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'update', team: teamName, amount: increment })
      }).catch(() => {});
    }

    // 3秒後強制刷新並解鎖，確保看到同步後的結果
    setTimeout(async () => {
      await fetchScores(true);
      setUpdateLock(false);
    }, 3000);
  };

  const executeReset = async () => {
    if (resetPwd !== '0508') {
      alert('密碼錯誤！');
      return;
    }
    setShowResetModal(false);
    setResetPwd('');
    setUpdateLock(true);
    
    try {
      const url = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || DEFAULT_URL;
      setScores(prev => prev.map(t => ({ ...t, score: 0 })));
      if (url) {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'reset' })
        });
      }
      setTimeout(async () => {
        await fetchScores(true);
        setUpdateLock(false);
      }, 3000);
    } catch (error) {
      setUpdateLock(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start py-10 px-4 w-full overflow-x-hidden">
      <div className="main-bg" style={{ backgroundImage: `url(${bgImg})` }}></div>
      <div className="comic-halftone"></div>

      {/* Header - 修正置中佈局 */}
      <header className="fixed-header w-full left-0 right-0 flex justify-center">
        <h1 className="title-container w-full max-w-6xl flex flex-col md:flex-row items-center justify-center text-center text-6xl md:text-9xl text-white font-black tracking-tighter uppercase leading-none px-4">
          <img 
            src={logoImg} 
            alt="Logo" 
            style={{ height: '1.4em', width: 'auto' }}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] md:mr-6 mb-4 md:mb-0" 
          />
          <span className="whitespace-nowrap">復興實中 新加坡交流 <small className="text-xs opacity-30">v1.2.3</small></span>
        </h1>
      </header>
      
      {/* 懸浮同步按鈕 */}
      <button 
        onClick={() => fetchScores(true)}
        className={`comic-sync-btn ${loading ? 'loading' : ''}`}
      >
        <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
        <span>{loading ? '同步中...' : '同步分數'}</span>
      </button>

      {/* Content */}
      <main className="spacer-top z-10 flex-grow w-full max-w-4xl">
        {currentPage === 'scoreboard' && (
          <ScoreboardView scores={scores} loading={loading} />
        )}
        
        {currentPage === 'login' && (
          <LoginView onLogin={(cls) => {
            setSelectedClass(cls);
            setCurrentPage('gm');
          }} />
        )}

        {currentPage === 'gm' && selectedClass && (
          <GMView 
            cls={selectedClass} 
            scores={scores.filter(s => s.team.includes(selectedClass.name))}
            onUpdate={handleUpdateScore} 
            onReset={() => setShowResetModal(true)} 
            isUpdating={isUpdatingState}
          />
        )}
      </main>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="comic-box" style={{ width: '90%', maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>管理員重置驗證</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '15px' }}>請輸入重置密碼以清空全班分數</p>
            <input 
              type="password"
              placeholder="請輸入密碼"
              value={resetPwd}
              onChange={(e) => setResetPwd(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: '#222', border: '2px solid #444',
                borderRadius: '8px', color: 'white', textAlign: 'center', fontSize: '20px',
                marginBottom: '20px', position: 'relative', zIndex: 11, pointerEvents: 'auto'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setShowResetModal(false); setResetPwd(''); }}
                style={{ flex: 1, padding: '12px', background: '#444', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
              >
                取消
              </button>
              <button 
                onClick={executeReset}
                style={{ flex: 1, padding: '12px', background: '#facc15', color: 'black', borderRadius: '8px', fontWeight: 'bold' }}
              >
                確認重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer GM Login */}
      <footer className="gm-footer">
        {currentPage === 'scoreboard' ? (
          <div 
            onClick={() => setCurrentPage('login')}
            className="gm-link"
          >
            <Shield size={14} /> GM 管理員登入
          </div>
        ) : (
          <div 
            onClick={() => { setCurrentPage('scoreboard'); setSelectedClass(null); }}
            className="gm-link"
          >
            <LogOut size={14} /> 返回記分板首頁
          </div>
        )}
      </footer>
    </div>
  )
}

function ScoreboardView({ scores, loading }) {
  const top4 = [...scores]
    .filter(t => (t.score || 0) > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full text-center mb-12">
        <h2 className="text-4xl md:text-7xl gold-text font-black flex items-center justify-center gap-4">
          🏆 SDGs 機智問答優勝榜 🏆
        </h2>
      </div>

      {loading && scores.length === 0 ? (
        <div className="text-center py-20 text-2xl animate-pulse text-white">數據載入中...</div>
      ) : (
        <div className="flex flex-wrap justify-center items-end gap-6 w-full">
          {top4.map((team, index) => {
            const isFirst = index === 0;
            return (
              <div 
                key={team.team} 
                className={`comic-box flex flex-col items-center transition-all duration-500 ${
                  isFirst ? 'winner-card' : 'rank-card'
                }`}
                style={{
                  width: isFirst ? '350px' : '220px',
                  padding: isFirst ? '40px 20px' : '20px 15px',
                  background: isFirst ? 'linear-gradient(135deg, #facc15 0%, #a16207 100%)' : 'rgba(255,255,255,0.05)',
                  border: isFirst ? '6px solid #000' : '3px solid #000',
                  boxShadow: isFirst ? '10px 10px 0px #000' : '6px 6px 0px #000',
                  order: isFirst ? 2 : (index === 1 ? 1 : (index === 2 ? 3 : 4)), // 第一名置中佈局
                  transform: isFirst ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isFirst ? 10 : 1
                }}
              >
                <div style={{
                  fontSize: isFirst ? '120px' : '60px',
                  marginBottom: '10px',
                  filter: isFirst ? 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' : 'none'
                }}>
                  {index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : '🎖️'))}
                </div>
                
                <div className="rank-badge" style={{
                  fontSize: isFirst ? '24px' : '16px',
                  background: '#000',
                  color: '#fff',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  marginBottom: '15px',
                  fontWeight: '900'
                }}>
                  RANK #{index + 1}
                </div>

                <div style={{
                  fontSize: isFirst ? '32px' : '18px',
                  fontWeight: '900',
                  color: isFirst ? '#000' : '#fff',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  marginBottom: '15px',
                  height: isFirst ? 'auto' : '50px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {team.team}
                </div>

                <div style={{
                  background: '#000',
                  color: isFirst ? '#facc15' : '#fff',
                  padding: isFirst ? '15px 30px' : '10px 20px',
                  borderRadius: '10px',
                  fontSize: isFirst ? '48px' : '28px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  border: '3px solid #333',
                  textShadow: isFirst ? '0 0 10px rgba(250,204,21,0.5)' : 'none'
                }}>
                  {team.score}
                  <span style={{ fontSize: '14px', marginLeft: '5px' }}>PTS</span>
                </div>
              </div>
            );
          })}
          {top4.length === 0 && <div className="text-center py-10 text-white text-xl">尚無計分紀錄</div>}
        </div>
      )}
      
      <style>{`
        .winner-card {
          animation: winnerPulse 2s infinite alternate;
        }
        @keyframes winnerPulse {
          from { transform: scale(1.1); box-shadow: 10px 10px 0px #000; }
          to { transform: scale(1.15); box-shadow: 15px 15px 20px rgba(250,204,21,0.4), 10px 10px 0px #000; }
        }
        @media (max-width: 768px) {
          .winner-card, .rank-card {
            width: 100% !important;
            order: unset !important;
            transform: none !important;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function LoginView({ onLogin }) {
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const foundClass = CLASSES.find(c => c.password === password);
    if (foundClass) {
      onLogin(foundClass);
    } else {
      alert('密碼錯誤！請重新輸入。');
    }
  };

  return (
    <div className="comic-box" style={{ maxWidth: '400px', margin: '40px auto', padding: '30px' }}>
      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>
        GM 管理員登入
      </h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input 
          type="password" 
          placeholder="請輸入班級密碼"
          style={{
            width: '100%', padding: '12px', background: 'rgba(255,255,255,0.2)',
            border: '2px solid #000', color: 'white', fontSize: '18px',
            position: 'relative', zIndex: 99999, cursor: 'text'
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          type="submit" 
          style={{
            width: '100%', padding: '15px', background: '#facc15', color: 'black',
            fontWeight: '900', fontSize: '20px', border: '3px solid #000',
            boxShadow: '4px 4px 0px #000', cursor: 'pointer'
          }}
        >
          確認登入
        </button>
      </form>
    </div>
  );
}

const TeamCard = ({ name, score, onUpdate, isUpdating }) => {
  return (
    <div style={{
      padding: '15px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      opacity: isUpdating ? 0.7 : 1,
      transition: 'opacity 0.3s'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>{name}</div>
        <div style={{
          background: '#000',
          color: '#ff3e3e',
          fontFamily: 'monospace',
          padding: '5px 15px',
          borderRadius: '5px',
          fontSize: '24px',
          fontWeight: 'bold',
          border: '2px solid #333',
          textShadow: '0 0 8px #ff3e3e',
          boxShadow: 'inset 0 0 10px #000'
        }}>
          {String(score).padStart(3, '0')}
        </div>
      </div>
      <button 
        onClick={() => onUpdate(name, 2)} 
        disabled={isUpdating}
        style={{
          background: isUpdating 
            ? 'linear-gradient(#666, #444)' 
            : 'radial-gradient(circle at 30% 30%, #ff4d4d, #cc0000)',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: '4px solid #800000',
          color: 'white',
          fontSize: '20px',
          fontWeight: '900',
          cursor: isUpdating ? 'not-allowed' : 'pointer',
          boxShadow: isUpdating ? 'none' : '0 6px 0 #800000, 0 10px 15px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isUpdating ? 'translateY(4px)' : 'none',
          transition: 'all 0.1s'
        }}
      >
        {isUpdating ? '...' : '+2'}
      </button>
    </div>
  );
};

function GMView({ cls, scores, onUpdate, onReset, isUpdating }) {
  const teamNames = Array.from({ length: cls.teams }, (_, i) => `${cls.name} 第${i + 1}小隊`);
  const firstRow = teamNames.slice(0, 5);
  const secondRow = teamNames.slice(5);

  const renderTeam = (name) => {
    const teamData = scores.find(s => s.team === name) || { team: name, score: 0 };
    return (
      <TeamCard 
        key={name}
        name={name}
        score={teamData.score}
        onUpdate={onUpdate}
        isUpdating={isUpdating}
      />
    );
  };

  return (
    <div className="comic-box" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '30px', position: 'relative' }}>
      <div style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', fontStyle: 'italic' }}>
          {cls.name} <span style={{ color: '#facc15' }}>MISSION CONTROL</span>
import { Trophy, Shield, RotateCcw, Plus, LogOut } from 'lucide-react'
import bgImg from '../public/bg.png.png'
import logoImg from '../public/logo.png.png'

// Constants
const CLASSES = [
  { id: 'he', name: '和班', teams: 9, password: '0001' },
  { id: 'ping', name: '平班', teams: 8, password: '0002' }
];
// 備用 API 網址 (當 GitHub Secrets 沒設好時使用)
const DEFAULT_URL = 'https://script.google.com/macros/s/AKfycbwYZxjKwm6YK4G0auFUtoQ6i0z22GA0touzv7JbGfTg5YXG5JF9QD9xH45B45sAt0z0/exec';

function App() {
  const [currentPage, setCurrentPage] = useState('scoreboard');
  const [selectedClass, setSelectedClass] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPwd, setResetPwd] = useState('');
  
  const isUpdatingRef = useRef(false);
  const [isUpdatingState, setIsUpdatingState] = useState(false);

  const setUpdateLock = (val) => {
    isUpdatingRef.current = val;
    setIsUpdatingState(val);
  };

  const fetchScores = async (force = false) => {
    if (isUpdatingRef.current && !force) return;
    
    setLoading(true);
    try {
      const url = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || DEFAULT_URL;
      
      const response = await fetch(`${url}?t=${Date.now()}&r=${Math.random()}`, {
        cache: 'no-store'
      });
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        setScores(data);
      }
    } catch (error) {
      console.error('Fetch failed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
    let interval;
    if (currentPage === 'scoreboard' || currentPage === 'gm') {
      const ms = currentPage === 'scoreboard' ? 8000 : 10000;
      interval = setInterval(() => fetchScores(), ms);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentPage]);

  const handleUpdateScore = async (teamName, increment) => {
    if (isUpdatingRef.current) return;
    
    setUpdateLock(true);
    // 立即本地更新
    setScores(prev => prev.map(t => 
      t.team === teamName ? { ...t, score: (t.score || 0) + increment } : t
    ));

    const url = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || DEFAULT_URL;
    if (url) {
      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ action: 'update', team: teamName, amount: increment })
      }).catch(() => {});
    }

    // 3秒後強制刷新並解鎖，確保看到同步後的結果
    setTimeout(async () => {
      await fetchScores(true);
      setUpdateLock(false);
    }, 3000);
  };

  const executeReset = async () => {
    if (resetPwd !== '0508') {
      alert('密碼錯誤！');
      return;
    }
    setShowResetModal(false);
    setResetPwd('');
    setUpdateLock(true);
    
    try {
      const url = import.meta.env.VITE_GOOGLE_APP_SCRIPT_URL || DEFAULT_URL;
      setScores(prev => prev.map(t => ({ ...t, score: 0 })));
      if (url) {
        await fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ action: 'reset' })
        });
      }
      setTimeout(async () => {
        await fetchScores(true);
        setUpdateLock(false);
      }, 3000);
    } catch (error) {
      setUpdateLock(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-start py-10 px-4 w-full overflow-x-hidden">
      <div className="main-bg" style={{ backgroundImage: `url(${bgImg})` }}></div>
      <div className="comic-halftone"></div>

      {/* Header - 修正置中佈局 */}
      <header className="fixed-header w-full left-0 right-0 flex justify-center">
        <h1 className="title-container w-full max-w-6xl flex flex-col md:flex-row items-center justify-center text-center text-6xl md:text-9xl text-white font-black tracking-tighter uppercase leading-none px-4">
          <img 
            src={logoImg} 
            alt="Logo" 
            style={{ height: '1.4em', width: 'auto' }}
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] md:mr-6 mb-4 md:mb-0" 
          />
          <span className="whitespace-nowrap">復興實中 新加坡交流 <small className="text-xs opacity-30">v1.2.3</small></span>
        </h1>
      </header>
      
      {/* 懸浮同步按鈕 */}
      <button 
        onClick={() => fetchScores(true)}
        className={`comic-sync-btn ${loading ? 'loading' : ''}`}
      >
        <RotateCcw size={20} className={loading ? 'animate-spin' : ''} />
        <span>{loading ? '同步中...' : '同步分數'}</span>
      </button>

      {/* Content */}
      <main className="spacer-top z-10 flex-grow w-full max-w-4xl">
        {currentPage === 'scoreboard' && (
          <ScoreboardView scores={scores} loading={loading} />
        )}
        
        {currentPage === 'login' && (
          <LoginView onLogin={(cls) => {
            setSelectedClass(cls);
            setCurrentPage('gm');
          }} />
        )}

        {currentPage === 'gm' && selectedClass && (
          <GMView 
            cls={selectedClass} 
            scores={scores.filter(s => s.team.includes(selectedClass.name))}
            onUpdate={handleUpdateScore} 
            onReset={() => setShowResetModal(true)} 
            isUpdating={isUpdatingState}
          />
        )}
      </main>

      {/* Reset Password Modal */}
      {showResetModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 10000,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)'
        }}>
          <div className="comic-box" style={{ width: '90%', maxWidth: '400px', padding: '30px', textAlign: 'center' }}>
            <h3 style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>管理員重置驗證</h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '15px' }}>請輸入重置密碼以清空全班分數</p>
            <input 
              type="password"
              placeholder="請輸入密碼"
              value={resetPwd}
              onChange={(e) => setResetPwd(e.target.value)}
              style={{
                width: '100%', padding: '12px', background: '#222', border: '2px solid #444',
                borderRadius: '8px', color: 'white', textAlign: 'center', fontSize: '20px',
                marginBottom: '20px', position: 'relative', zIndex: 11, pointerEvents: 'auto'
              }}
              autoFocus
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => { setShowResetModal(false); setResetPwd(''); }}
                style={{ flex: 1, padding: '12px', background: '#444', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
              >
                取消
              </button>
              <button 
                onClick={executeReset}
                style={{ flex: 1, padding: '12px', background: '#facc15', color: 'black', borderRadius: '8px', fontWeight: 'bold' }}
              >
                確認重置
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer GM Login */}
      <footer className="gm-footer">
        {currentPage === 'scoreboard' ? (
          <div 
            onClick={() => setCurrentPage('login')}
            className="gm-link"
          >
            <Shield size={14} /> GM 管理員登入
          </div>
        ) : (
          <div 
            onClick={() => { setCurrentPage('scoreboard'); setSelectedClass(null); }}
            className="gm-link"
          >
            <LogOut size={14} /> 返回記分板首頁
          </div>
        )}
      </footer>
    </div>
  )
}

function ScoreboardView({ scores, loading }) {
  const top4 = [...scores]
    .filter(t => (t.score || 0) > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full text-center mb-12">
        <h2 className="text-4xl md:text-7xl gold-text font-black flex items-center justify-center gap-4">
          🏆 SDGs 機智問答優勝榜 🏆
        </h2>
      </div>

      {loading && scores.length === 0 ? (
        <div className="text-center py-20 text-2xl animate-pulse text-white">數據載入中...</div>
      ) : (
        <div className="flex flex-wrap justify-center items-end gap-6 w-full">
          {top4.map((team, index) => {
            const isFirst = index === 0;
            return (
              <div 
                key={team.team} 
                className={`comic-box flex flex-col items-center transition-all duration-500 ${
                  isFirst ? 'winner-card' : 'rank-card'
                }`}
                style={{
                  width: isFirst ? '350px' : '220px',
                  padding: isFirst ? '40px 20px' : '20px 15px',
                  background: isFirst ? 'linear-gradient(135deg, #facc15 0%, #a16207 100%)' : 'rgba(255,255,255,0.05)',
                  border: isFirst ? '6px solid #000' : '3px solid #000',
                  boxShadow: isFirst ? '10px 10px 0px #000' : '6px 6px 0px #000',
                  order: isFirst ? 2 : (index === 1 ? 1 : (index === 2 ? 3 : 4)), // 第一名置中佈局
                  transform: isFirst ? 'scale(1.1)' : 'scale(1)',
                  zIndex: isFirst ? 10 : 1
                }}
              >
                <div style={{
                  fontSize: isFirst ? '120px' : '60px',
                  marginBottom: '10px',
                  filter: isFirst ? 'drop-shadow(0 0 15px rgba(255,255,255,0.8))' : 'none'
                }}>
                  {index === 0 ? '🥇' : (index === 1 ? '🥈' : (index === 2 ? '🥉' : '🎖️'))}
                </div>
                
                <div className="rank-badge" style={{
                  fontSize: isFirst ? '24px' : '16px',
                  background: '#000',
                  color: '#fff',
                  padding: '5px 15px',
                  borderRadius: '20px',
                  marginBottom: '15px',
                  fontWeight: '900'
                }}>
                  RANK #{index + 1}
                </div>

                <div style={{
                  fontSize: isFirst ? '32px' : '18px',
                  fontWeight: '900',
                  color: isFirst ? '#000' : '#fff',
                  textAlign: 'center',
                  lineHeight: '1.2',
                  marginBottom: '15px',
                  height: isFirst ? 'auto' : '50px',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {team.team}
                </div>

                <div style={{
                  background: '#000',
                  color: isFirst ? '#facc15' : '#fff',
                  padding: isFirst ? '15px 30px' : '10px 20px',
                  borderRadius: '10px',
                  fontSize: isFirst ? '48px' : '28px',
                  fontWeight: '900',
                  fontFamily: 'monospace',
                  border: '3px solid #333',
                  textShadow: isFirst ? '0 0 10px rgba(250,204,21,0.5)' : 'none'
                }}>
                  {team.score}
                  <span style={{ fontSize: '14px', marginLeft: '5px' }}>PTS</span>
                </div>
              </div>
            );
          })}
          {top4.length === 0 && <div className="text-center py-10 text-white text-xl">尚無計分紀錄</div>}
        </div>
      )}
      
      <style>{`
        .winner-card {
          animation: winnerPulse 2s infinite alternate;
        }
        @keyframes winnerPulse {
          from { transform: scale(1.1); box-shadow: 10px 10px 0px #000; }
          to { transform: scale(1.15); box-shadow: 15px 15px 20px rgba(250,204,21,0.4), 10px 10px 0px #000; }
        }
        @media (max-width: 768px) {
          .winner-card, .rank-card {
            width: 100% !important;
            order: unset !important;
            transform: none !important;
            margin-bottom: 20px;
          }
        }
      `}</style>
    </div>
  );
}

function LoginView({ onLogin }) {
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const foundClass = CLASSES.find(c => c.password === password);
    if (foundClass) {
      onLogin(foundClass);
    } else {
      alert('密碼錯誤！請重新輸入。');
    }
  };

  return (
    <div className="comic-box" style={{ maxWidth: '400px', margin: '40px auto', padding: '30px' }}>
      <h2 style={{ color: 'white', fontSize: '24px', fontWeight: '900', marginBottom: '20px', textAlign: 'center' }}>
        GM 管理員登入
      </h2>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <input 
          type="password" 
          placeholder="請輸入班級密碼"
          style={{
            width: '100%', padding: '12px', background: 'rgba(255,255,255,0.2)',
            border: '2px solid #000', color: 'white', fontSize: '18px',
            position: 'relative', zIndex: 99999, cursor: 'text'
          }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button 
          type="submit" 
          style={{
            width: '100%', padding: '15px', background: '#facc15', color: 'black',
            fontWeight: '900', fontSize: '20px', border: '3px solid #000',
            boxShadow: '4px 4px 0px #000', cursor: 'pointer'
          }}
        >
          確認登入
        </button>
      </form>
    </div>
  );
}

const TeamCard = ({ name, score, onUpdate, isUpdating }) => {
  return (
    <div style={{
      padding: '15px',
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '15px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '15px',
      opacity: isUpdating ? 0.7 : 1,
      transition: 'opacity 0.3s'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,255,255,0.6)', marginBottom: '5px' }}>{name}</div>
        <div style={{
          background: '#000',
          color: '#ff3e3e',
          fontFamily: 'monospace',
          padding: '5px 15px',
          borderRadius: '5px',
          fontSize: '24px',
          fontWeight: 'bold',
          border: '2px solid #333',
          textShadow: '0 0 8px #ff3e3e',
          boxShadow: 'inset 0 0 10px #000'
        }}>
          {String(score).padStart(3, '0')}
        </div>
      </div>
      <button 
        onClick={() => onUpdate(name, 2)} 
        disabled={isUpdating}
        style={{
          background: isUpdating 
            ? 'linear-gradient(#666, #444)' 
            : 'radial-gradient(circle at 30% 30%, #ff4d4d, #cc0000)',
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: '4px solid #800000',
          color: 'white',
          fontSize: '20px',
          fontWeight: '900',
          cursor: isUpdating ? 'not-allowed' : 'pointer',
          boxShadow: isUpdating ? 'none' : '0 6px 0 #800000, 0 10px 15px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: isUpdating ? 'translateY(4px)' : 'none',
          transition: 'all 0.1s'
        }}
      >
        {isUpdating ? '...' : '+2'}
      </button>
    </div>
  );
};

function GMView({ cls, scores, onUpdate, onReset, isUpdating }) {
  const teamNames = Array.from({ length: cls.teams }, (_, i) => `${cls.name} 第${i + 1}小隊`);
  const firstRow = teamNames.slice(0, 5);
  const secondRow = teamNames.slice(5);

  const renderTeam = (name) => {
    const teamData = scores.find(s => s.team === name) || { team: name, score: 0 };
    return (
      <TeamCard 
        key={name}
        name={name}
        score={teamData.score}
        onUpdate={onUpdate}
        isUpdating={isUpdating}
      />
    );
  };

  return (
    <div className="comic-box" style={{ width: '100%', maxWidth: '900px', margin: '0 auto', padding: '30px', position: 'relative' }}>
      <div style={{ marginBottom: '30px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '10px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: '900', color: 'white', fontStyle: 'italic' }}>
          {cls.name} <span style={{ color: '#facc15' }}>MISSION CONTROL</span>
        </h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* 第一排 1-5 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
          {firstRow.map(renderTeam)}
        </div>

        {/* 第二排 6-9 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '15px' }}>
          {secondRow.map(renderTeam)}
        </div>
      </div>

      {/* 右下方重置按鈕 */}
      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          onClick={onReset}
          style={{
            padding: '8px 15px',
            background: 'rgba(153, 27, 27, 0.5)',
            color: '#fca5a5',
            borderRadius: '5px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '11px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >          重置分數
        </button>
      </div>
    </div>
  );
}

export default App;
