import React, { useState, useEffect, useRef } from 'react'


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

