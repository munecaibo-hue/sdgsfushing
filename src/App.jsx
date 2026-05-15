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
      
