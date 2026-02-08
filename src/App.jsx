import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Lock, Unlock, Play, Book, Save, Trash2, PlusCircle, FolderPlus,
  Bold, Italic, Underline, List, Quote, Type, Eye, CheckCircle, ExternalLink, AlertTriangle,
  Image as ImageIcon, UploadCloud, Newspaper, Calendar, ArrowLeft, CloudOff, Cloud, Layout,
  ChevronRight, Hash, Terminal, Cpu, ShieldAlert, GripVertical, Wifi, WifiOff, Activity
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query 
} from 'firebase/firestore';

// --- ИНИЦИАЛИЗАЦИЯ FIREBASE (БЕЗОПАСНАЯ & VERCEL-READY) ---

const localConfig = {
  apiKey: "AIzaSyAW4YLD3JDmuPkUACrIW5HaU93l_U_cmno",
  authDomain: "blackleague.firebaseapp.com",
  projectId: "blackleague",
  storageBucket: "blackleague.firebasestorage.app",
  messagingSenderId: "627539415344",
  appId: "1:627539415344:web:99a7ee9bae62c825b9f8f5",
  measurementId: "G-RBNZYW4K1X"
};

let app, auth, db;
let IS_FIREBASE_INITIALIZED = false;

const getFirebaseConfig = () => {
  if (typeof __firebase_config !== 'undefined') return JSON.parse(__firebase_config);
  try { if (import.meta.env && import.meta.env.VITE_FIREBASE_CONFIG) return JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG); } catch (e) {}
  try { if (typeof process !== 'undefined' && process.env && process.env.REACT_APP_FIREBASE_CONFIG) return JSON.parse(process.env.REACT_APP_FIREBASE_CONFIG); } catch (e) {}
  return localConfig;
};

// FIX: Санитизация appId для предотвращения ошибок путей Firestore
const getAppId = () => {
  let id = 'default-app-id';
  if (typeof __app_id !== 'undefined') id = __app_id;
  else {
    try { if (import.meta.env && import.meta.env.VITE_APP_ID) id = import.meta.env.VITE_APP_ID; } catch(e) {}
  }
  return id.replace(/[./]/g, '_');
};

try {
  const config = getFirebaseConfig();
  const isLocalConfigValid = config.apiKey && !config.apiKey.includes("INSERT_YOUR_OWN");

  if (config && isLocalConfigValid) {
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    IS_FIREBASE_INITIALIZED = true;
  }
} catch (e) {
  console.error("Firebase init failed:", e);
  IS_FIREBASE_INITIALIZED = false;
}

const appId = getAppId();

// --- КОНСТАНТЫ ---
const CREDENTIALS = {
  user: "BOBBYNTNH",
  pass: "VOKI545545"
};

const DEFAULT_WIKI_DATA = [
  {
    id: '1',
    title: 'Правила Сервера',
    category: 'Основное',
    content: `<h2>1. Общие положения</h2><p>Незнание правил не освобождает от ответственности.</p>`
  }
];

const DEFAULT_NEWS_DATA = [
  {
    id: '1',
    title: 'Добро пожаловать',
    date: new Date().toLocaleDateString(),
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=2070',
    content: `<p>Сайт успешно запущен!</p>`
  }
];

// --- ВСПОМОГАТЕЛЬНЫЕ КОМПОНЕНТЫ ---

const NoiseOverlay = () => (
  <div className="fixed inset-0 pointer-events-none z-[5] opacity-[0.03]" 
       style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
  </div>
);

const ParticlesBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particlesArray = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() * 0.3) - 0.15;
        this.speedY = (Math.random() * 0.3) - 0.15;
        this.opacity = Math.random() * 0.3 + 0.1;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = `rgba(200, 200, 200, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < 60; i++) {
        particlesArray.push(new Particle());
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particlesArray.forEach(p => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };

    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0" />;
};

const Toast = ({ message, visible }) => {
  return (
    <div 
      className={`fixed bottom-8 right-8 bg-zinc-900 border border-green-500/30 text-white px-6 py-4 rounded-lg shadow-[0_0_30px_rgba(0,255,0,0.1)] z-[60] flex items-center gap-4 transition-all duration-500 transform ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
    >
      <div className="bg-green-500/10 p-2 rounded-full">
        <CheckCircle size={20} className="text-green-500" />
      </div>
      <div>
        <p className="text-sm text-green-500 font-mono font-bold uppercase tracking-wider">Система</p>
        <p className="text-zinc-300 text-sm">{typeof message === 'string' ? message : 'Уведомление'}</p>
      </div>
    </div>
  );
};

const CategoryModal = ({ isOpen, onClose, onCreate }) => {
  const [catName, setCatName] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-yellow-600/30 p-8 rounded-xl shadow-2xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"><X size={20} /></button>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <FolderPlus className="text-yellow-500" size={24} /> 
          <span className="uppercase tracking-wide">Новая секция</span>
        </h3>
        <input 
          type="text" 
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="Название категории..."
          className="w-full bg-black/50 border border-zinc-700 rounded-lg p-4 text-white focus:border-yellow-500 focus:outline-none transition mb-6 font-mono"
          autoFocus
        />
        <button onClick={() => { if(catName.trim()) { onCreate(catName); setCatName(''); onClose(); }}}
          className="w-full bg-yellow-600/90 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-yellow-900/20 uppercase tracking-widest text-sm">
          Создать
        </button>
      </div>
    </div>
  );
};

const ImageModal = ({ isOpen, onClose, onInsert, targetType = 'content' }) => {
  const [activeTab, setActiveTab] = useState('url');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  useEffect(() => {
    if (isOpen) { setUrl(''); setFile(null); setPreview(''); setActiveTab('url'); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 800 * 1024) { alert("Файл слишком большой! (макс 800KB)"); return; }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'url' && url.trim()) { onInsert(url); onClose(); } 
    else if (activeTab === 'file' && preview) { onInsert(preview); onClose(); }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-zinc-900 border border-blue-600/30 p-8 rounded-xl shadow-2xl max-w-md w-full relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"><X size={20} /></button>
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <ImageIcon className="text-blue-500" size={24} /> 
          <span className="uppercase tracking-wide">{targetType === 'cover' ? 'Обложка' : 'Медиа'}</span>
        </h3>

        <div className="flex gap-2 mb-6 bg-black/40 p-1.5 rounded-lg border border-zinc-800">
          {['url', 'file'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`flex-1 py-2 rounded-md text-xs font-bold uppercase tracking-wider transition ${activeTab === tab ? 'bg-blue-600 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}>
              {tab === 'url' ? 'Ссылка' : 'Загрузка'}
            </button>
          ))}
        </div>

        {activeTab === 'url' ? (
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-black/50 border border-zinc-700 rounded-lg p-4 text-white focus:border-blue-500 focus:outline-none transition mb-6 font-mono text-sm" autoFocus />
        ) : (
          <div className="mb-6">
            <label className="block w-full cursor-pointer bg-black/50 border border-dashed border-zinc-700 rounded-xl p-8 text-center hover:border-blue-500 hover:bg-zinc-900 transition group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded shadow-lg object-contain" />
              ) : (
                <div className="text-zinc-500 text-sm flex flex-col items-center"><UploadCloud size={32} className="mb-3 text-zinc-600 group-hover:text-blue-500 transition" /><span>Нажмите для выбора</span></div>
              )}
            </label>
          </div>
        )}

        <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm" disabled={activeTab === 'file' && !preview}>
          Применить
        </button>
      </div>
    </div>
  );
};

const LoginModal = ({ isOpen, onClose, onLogin, error }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-fadeIn">
      <div className="bg-zinc-900 border border-red-900/50 p-10 rounded-2xl shadow-[0_0_50px_rgba(220,38,38,0.2)] max-w-sm w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent"></div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-600 hover:text-white transition"><X size={20} /></button>
        <div className="text-center mb-8">
          <ShieldAlert className="mx-auto text-red-600 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-white uppercase tracking-widest">Доступ <span className="text-red-600">Admin</span></h2>
          <p className="text-zinc-500 text-xs mt-2 font-mono">AUTHORIZED PERSONNEL ONLY</p>
        </div>
        <div className="space-y-5">
          <div>
            <label className="block text-[10px] font-mono font-bold text-red-500/70 mb-1 tracking-widest uppercase">Идентификатор</label>
            <input type="text" value={user} onChange={(e) => setUser(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-900 transition font-mono" />
          </div>
          <div>
            <label className="block text-[10px] font-mono font-bold text-red-500/70 mb-1 tracking-widest uppercase">Ключ доступа</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:border-red-600 focus:ring-1 focus:ring-red-900 transition font-mono" />
          </div>
          {error && <div className="bg-red-900/20 border border-red-900/50 text-red-500 text-xs text-center font-bold p-2 rounded animate-pulse">ОШИБКА АВТОРИЗАЦИИ</div>}
          <button onClick={() => onLogin(user, pass)} className="w-full bg-gradient-to-r from-red-800 to-red-700 hover:from-red-700 hover:to-red-600 text-white font-bold py-3 rounded-lg transition shadow-lg shadow-red-900/30 uppercase tracking-widest text-sm mt-2">Войти</button>
        </div>
      </div>
    </div>
  );
};

// --- ОСНОВНОЙ КОМПОНЕНТ APP ---
export default function App() {
  const [view, setView] = useState('landing');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageModalTarget, setImageModalTarget] = useState('content');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const [wikiPages, setWikiPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [newsItems, setNewsItems] = useState([]);
  const [activeNewsId, setActiveNewsId] = useState(null);

  const [editorTitle, setEditorTitle] = useState('');
  const [editorCategory, setEditorCategory] = useState('');
  const [editorImage, setEditorImage] = useState('');
  const [saveStatus, setSaveStatus] = useState('SYNCED');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  // DRAG AND DROP STATE
  const [draggedPageId, setDraggedPageId] = useState(null);
  const [dragOverCategory, setDragOverCategory] = useState(null);

  // SERVER STATUS STATE
  const [serverStatus, setServerStatus] = useState({ online: false, players: 0, max: 0, loading: true });

  const editorContentRef = useRef(null);
  const selectionRangeRef = useRef(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [authUser, setAuthUser] = useState(null);
  const [dataSource, setDataSource] = useState(IS_FIREBASE_INITIALIZED ? 'firebase' : 'local');

  // --- 0. SERVER CHECKER EFFECT ---
  useEffect(() => {
    const checkServerStatus = async () => {
      setServerStatus(prev => ({ ...prev, loading: true }));
      try {
        // Использование api.mcsrvstat.us для проверки статуса (работает с CORS)
        const response = await fetch('https://api.mcsrvstat.us/2/play.blackleague.net');
        const data = await response.json();
        
        if (data.online) {
          setServerStatus({
            online: true,
            players: data.players.online,
            max: data.players.max,
            loading: false
          });
        } else {
          setServerStatus({ online: false, players: 0, max: 0, loading: false });
        }
      } catch (error) {
        console.error("Server check failed", error);
        setServerStatus({ online: false, players: 0, max: 0, loading: false });
      }
    };

    checkServerStatus();
    // Проверка каждую минуту
    const interval = setInterval(checkServerStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  // --- 1. АВТОРИЗАЦИЯ И ЗАГРУЗКА ---
  useEffect(() => {
    const token = localStorage.getItem('bl_admin_token');
    if (token === 'true') setIsAdmin(true);

    if (dataSource === 'firebase') {
      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (e) {
          console.error("Auth error:", e);
          setDataSource('local');
        }
      };
      initAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => setAuthUser(user));
      return () => unsubscribe();
    }
  }, [dataSource]);

  // --- 2. СИНХРОНИЗАЦИЯ ДАННЫХ ---
  useEffect(() => {
    if (dataSource === 'firebase' && authUser) {
      const qWiki = query(collection(db, 'artifacts', appId, 'public', 'data', 'wiki'));
      const unsubWiki = onSnapshot(qWiki, 
        (snapshot) => {
          const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          pages.sort((a, b) => a.category?.localeCompare(b.category) || a.title?.localeCompare(b.title));
          setWikiPages(pages);
          if (activePageId && !pages.find(p => p.id === activePageId)) setActivePageId(null);
        }, 
        (err) => { setDataSource('local'); }
      );

      const qNews = query(collection(db, 'artifacts', appId, 'public', 'data', 'news'));
      const unsubNews = onSnapshot(qNews, 
        (snapshot) => {
          const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          news.sort((a, b) => new Date(b.id) - new Date(a.id)); 
          setNewsItems(news);
          if (activeNewsId && !news.find(n => n.id === activeNewsId)) setActiveNewsId(null);
        }, 
        (err) => { setDataSource('local'); }
      );

      return () => { unsubWiki(); unsubNews(); };
    } 
    
    if (dataSource === 'local') {
      const storedWiki = localStorage.getItem('bl_wiki_data');
      const storedNews = localStorage.getItem('bl_news_data');
      const loadedWiki = storedWiki ? JSON.parse(storedWiki) : DEFAULT_WIKI_DATA;
      setWikiPages(loadedWiki);
      setNewsItems(storedNews ? JSON.parse(storedNews) : DEFAULT_NEWS_DATA);
      if (loadedWiki.length > 0 && !activePageId) setActivePageId(loadedWiki[0].id);
      showToast("Режим: LOCAL STORAGE");
    }
  }, [authUser, dataSource]);

  // --- 3. РЕДАКТОР ---
  useEffect(() => {
    setShowDeleteConfirm(false);
    let targetItem = null;
    if (view === 'wiki' && activePageId) targetItem = wikiPages.find(p => p.id === activePageId);
    else if (view === 'news' && activeNewsId) targetItem = newsItems.find(n => n.id === activeNewsId);

    if (targetItem) {
      setEditorTitle(targetItem.title || '');
      setEditorCategory(view === 'wiki' ? (targetItem.category || '') : (targetItem.date || ''));
      setEditorImage(view === 'news' ? (targetItem.image || '') : '');
      if (editorContentRef.current && document.activeElement !== editorContentRef.current) {
        editorContentRef.current.innerHTML = targetItem.content || '';
      }
    } else {
      setEditorTitle(''); setEditorCategory(''); setEditorImage('');
      if (editorContentRef.current) editorContentRef.current.innerHTML = '';
    }
  }, [activePageId, activeNewsId, view, wikiPages, newsItems]);

  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const copyIP = () => {
    navigator.clipboard.writeText("play.blackleague.net").then(() => showToast("IP АДРЕС СКОПИРОВАН"));
  };

  const handleLogin = (u, p) => {
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
      setIsAdmin(true);
      localStorage.setItem('bl_admin_token', 'true');
      setIsLoginModalOpen(false);
      setLoginError(false);
      showToast("ДОБРО ПОЖАЛОВАТЬ, ADMIN");
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('bl_admin_token');
    showToast("СЕССИЯ ЗАВЕРШЕНА");
  };

  const saveDataLocally = (type, data) => {
    if (type === 'wiki') localStorage.setItem('bl_wiki_data', JSON.stringify(data));
    else localStorage.setItem('bl_news_data', JSON.stringify(data));
  };

  const createPage = async () => {
    if (!isAdmin) return;
    const newPageData = { title: 'UNTITLED_DOC', category: 'Черновики', content: '<p>Начало записи...</p>' };
    if (dataSource === 'firebase' && authUser) {
      try {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wiki'), newPageData);
        setActivePageId(docRef.id);
        showToast("ДОКУМЕНТ СОЗДАН (CLOUD)");
      } catch(e) { setDataSource('local'); }
    } else {
      const newPage = { id: Date.now().toString(), ...newPageData };
      const updated = [...wikiPages, newPage];
      setWikiPages(updated);
      setActivePageId(newPage.id);
      saveDataLocally('wiki', updated);
      showToast("ДОКУМЕНТ СОЗДАН (LOCAL)");
    }
  };

  const createNews = async () => {
    if (!isAdmin) return;
    const newNewsData = { title: 'СВЕЖАЯ СВОДКА', date: new Date().toLocaleDateString('ru-RU'), image: '', content: '<p>Текст новости...</p>' };
    if (dataSource === 'firebase' && authUser) {
      try {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'news'), newNewsData);
        setActiveNewsId(docRef.id);
        showToast("НОВОСТЬ СОЗДАНА (CLOUD)");
      } catch(e) { setDataSource('local'); }
    } else {
      const newNews = { id: Date.now().toString(), ...newNewsData };
      const updated = [newNews, ...newsItems];
      setNewsItems(updated);
      setActiveNewsId(newNews.id);
      saveDataLocally('news', updated);
      showToast("НОВОСТЬ СОЗДАНА (LOCAL)");
    }
  };

  const handleCreateCategory = async (catName) => {
    if (!isAdmin) return;
    const newPageData = { title: 'INDEX', category: catName.trim(), content: `<p>Секция: <strong>${catName}</strong>.</p>` };
    if (dataSource === 'firebase' && authUser) {
      try {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wiki'), newPageData);
        setActivePageId(docRef.id);
        showToast("СЕКЦИЯ СОЗДАНА");
      } catch(e) { setDataSource('local'); }
    } else {
      const newPage = { id: Date.now().toString(), ...newPageData };
      const updated = [...wikiPages, newPage];
      setWikiPages(updated);
      setActivePageId(newPage.id);
      saveDataLocally('wiki', updated);
      showToast("СЕКЦИЯ СОЗДАНА");
    }
  };

  const handleSave = async (silent = false) => {
    if (!isAdmin) return;
    const content = editorContentRef.current.innerHTML;
    setSaveStatus("SAVING...");

    if (dataSource === 'firebase' && authUser) {
      try {
        if (view === 'wiki' && activePageId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wiki', activePageId), { title: editorTitle, category: editorCategory, content });
        } else if (view === 'news' && activeNewsId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', activeNewsId), { title: editorTitle, date: editorCategory, image: editorImage, content });
        }
        setSaveStatus("SYNCED");
        if (!silent) showToast("СОХРАНЕНО");
      } catch (e) { setSaveStatus("ERR"); showToast("ОШИБКА СОХРАНЕНИЯ"); }
    } else {
      if (view === 'wiki' && activePageId) {
        const updated = wikiPages.map(p => p.id === activePageId ? { ...p, title: editorTitle, category: editorCategory, content } : p);
        setWikiPages(updated);
        saveDataLocally('wiki', updated);
      } else if (view === 'news' && activeNewsId) {
        const updated = newsItems.map(n => n.id === activeNewsId ? { ...n, title: editorTitle, date: editorCategory, image: editorImage, content } : n);
        setNewsItems(updated);
        saveDataLocally('news', updated);
      }
      setSaveStatus("LOCAL");
      if (!silent) showToast("СОХРАНЕНО (LOCAL)");
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!showDeleteConfirm) { setShowDeleteConfirm(true); setTimeout(() => setShowDeleteConfirm(false), 3000); return; }
    if (dataSource === 'firebase' && authUser) {
      try {
        if (view === 'wiki' && activePageId) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wiki', activePageId)); setActivePageId(null); } 
        else if (view === 'news' && activeNewsId) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', activeNewsId)); setActiveNewsId(null); }
        showToast("УДАЛЕНО");
      } catch (e) { showToast("ОШИБКА"); }
    } else {
      if (view === 'wiki' && activePageId) {
        const updated = wikiPages.filter(p => p.id !== activePageId);
        setWikiPages(updated);
        setActivePageId(updated.length > 0 ? updated[0].id : null);
        saveDataLocally('wiki', updated);
      } else if (view === 'news' && activeNewsId) {
        const updated = newsItems.filter(n => n.id !== activeNewsId);
        setNewsItems(updated);
        setActiveNewsId(null);
        saveDataLocally('news', updated);
      }
      showToast("УДАЛЕНО");
    }
    setShowDeleteConfirm(false);
  };

  // --- DRAG AND DROP HANDLERS ---
  const handlePageDrop = async (targetCategory) => {
    if (!draggedPageId || !isAdmin) return;
    
    // Find the page being dragged
    const pageToMove = wikiPages.find(p => p.id === draggedPageId);
    if (!pageToMove || pageToMove.category === targetCategory) {
      setDraggedPageId(null);
      setDragOverCategory(null);
      return;
    }

    // Update Category
    if (dataSource === 'firebase' && authUser) {
      try {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wiki', draggedPageId), { 
          category: targetCategory 
        });
        showToast(`ПЕРЕМЕЩЕНО В ${targetCategory.toUpperCase()}`);
      } catch (e) {
        showToast("ОШИБКА ПЕРЕМЕЩЕНИЯ");
      }
    } else {
      const updated = wikiPages.map(p => 
        p.id === draggedPageId ? { ...p, category: targetCategory } : p
      );
      setWikiPages(updated);
      saveDataLocally('wiki', updated);
      showToast(`ПЕРЕМЕЩЕНО В ${targetCategory.toUpperCase()}`);
    }

    // Reset Drag State
    setDraggedPageId(null);
    setDragOverCategory(null);
  };

  const formatDoc = (cmd, val = null) => {
    if (!isAdmin) return;
    document.execCommand(cmd, false, val);
    editorContentRef.current.focus();
  };

  const openImageModal = (target = 'content') => {
    setImageModalTarget(target);
    if (target === 'content') {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) selectionRangeRef.current = selection.getRangeAt(0);
    }
    setIsImageModalOpen(true);
  };

  const handleInsertImage = (url) => {
    if (imageModalTarget === 'cover') { setEditorImage(url); } 
    else {
      if (editorContentRef.current) editorContentRef.current.focus();
      if (selectionRangeRef.current) {
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(selectionRangeRef.current);
      }
      document.execCommand('insertImage', false, url);
    }
  };

  const uniqueCategories = [...new Set(wikiPages.map(p => p.category))].filter(Boolean).sort();

  // --- RENDER FUNCTIONS ---

  const renderNavbar = () => (
    <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0 cursor-pointer group" onClick={() => setView('landing')}>
            <span className="text-2xl font-black tracking-tighter uppercase text-white flex items-center gap-2 group-hover:scale-105 transition-transform duration-300">
                <span className="text-red-600 bg-red-600/10 p-1 rounded border border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.4)]">BL</span>
                <span className="hidden sm:inline">Black League</span>
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-2">
              {[
                { id: 'landing', label: 'Главная', icon: Terminal },
                { id: 'news', label: 'Новости', icon: Newspaper },
                { id: 'wiki', label: 'База Знаний', icon: Book }
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => { setView(item.id); if(item.id==='news') setActiveNewsId(null); }} 
                  className={`relative px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center gap-2 overflow-hidden
                    ${view === item.id 
                      ? 'text-white bg-white/5 border border-white/10 shadow-[0_0_20px_rgba(255,255,255,0.05)]' 
                      : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <item.icon size={16} className={view === item.id ? 'text-red-500' : ''} />
                  {item.label}
                  {view === item.id && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-red-600 shadow-[0_0_10px_red]"></div>}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            
            {/* SERVER STATUS WIDGET */}
            <div className="hidden lg:flex items-center gap-3 bg-black/50 border border-zinc-800 rounded-full pl-3 pr-4 py-1 mr-2" title="play.blackleague.net">
               <div className={`w-2.5 h-2.5 rounded-full ${serverStatus.loading ? 'bg-yellow-500 animate-pulse' : (serverStatus.online ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]')}`}></div>
               <div className="flex flex-col leading-none">
                 <span className={`text-[9px] font-bold tracking-widest uppercase ${serverStatus.online ? 'text-green-500' : 'text-zinc-500'}`}>
                    {serverStatus.loading ? 'CHECKING...' : (serverStatus.online ? 'ONLINE' : 'OFFLINE')}
                 </span>
                 {serverStatus.online && (
                   <span className="text-[10px] font-mono text-zinc-300 font-bold">
                     {serverStatus.players} / {serverStatus.max}
                   </span>
                 )}
               </div>
            </div>

            {isAdmin && (
              <button onClick={handleLogout} className="text-zinc-600 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-500/10" title="Выйти">
                <Unlock size={18} />
              </button>
            )}
            <a href="https://discord.gg/zbTMvD6ud2" target="_blank" className="bg-[#5865F2] hover:bg-[#4752c4] text-white px-5 py-2 rounded-lg font-bold transition transform hover:scale-105 flex items-center gap-2 text-xs uppercase tracking-widest shadow-lg shadow-[#5865F2]/20">
              <ExternalLink size={14} /> Discord
            </a>
            <div className="flex gap-2 text-xs font-mono text-zinc-600 border-l border-zinc-800 pl-4">
              {isAdmin && dataSource === 'local' && <CloudOff size={16} title="Local Mode" className="text-yellow-600" />}
              {isAdmin && dataSource === 'firebase' && <Cloud size={16} title="Cloud Mode" className="text-green-600" />}
            </div>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-zinc-300 hover:text-white p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-zinc-800 animate-slideDown">
          <div className="px-4 pt-4 pb-6 space-y-2 text-center">
            {/* Mobile Server Status */}
             <div className="flex items-center justify-center gap-3 bg-zinc-900/50 rounded-lg py-2 mb-4 border border-zinc-800">
               <div className={`w-2 h-2 rounded-full ${serverStatus.loading ? 'bg-yellow-500 animate-pulse' : (serverStatus.online ? 'bg-green-500' : 'bg-red-500')}`}></div>
               <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                  {serverStatus.loading ? 'CHECKING...' : (serverStatus.online ? `${serverStatus.players}/${serverStatus.max} ONLINE` : 'SERVER OFFLINE')}
               </span>
             </div>

            <button onClick={() => { setView('landing'); setIsMobileMenuOpen(false); }} className="text-zinc-300 block w-full px-3 py-3 rounded-lg text-lg font-bold border border-zinc-800 bg-zinc-900/50">ГЛАВНАЯ</button>
            <button onClick={() => { setView('news'); setActiveNewsId(null); setIsMobileMenuOpen(false); }} className="text-zinc-300 block w-full px-3 py-3 rounded-lg text-lg font-bold border border-zinc-800 bg-zinc-900/50">НОВОСТИ</button>
            <button onClick={() => { setView('wiki'); setIsMobileMenuOpen(false); }} className="text-zinc-300 block w-full px-3 py-3 rounded-lg text-lg font-bold border border-zinc-800 bg-zinc-900/50">БАЗА ЗНАНИЙ</button>
          </div>
        </div>
      )}
    </nav>
  );

  const renderLanding = () => (
    <div className="pt-20 min-h-screen relative">
      <header className="relative h-[90vh] flex items-center justify-center text-center px-4 overflow-hidden">
         <div className="absolute inset-0 z-[-1]" style={{
           background: `radial-gradient(circle at center, rgba(0,0,0,0) 0%, rgba(5,5,5,1) 90%), url('https://images.unsplash.com/photo-1605806616949-1e87b487bc2a?q=80&w=2574&auto=format&fit=crop')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
         }}>
           <div className="absolute inset-0 bg-black/50 backdrop-contrast-125"></div>
         </div>

        <div className="relative z-10 max-w-5xl mx-auto animate-fadeInUp">
          <div className="mb-6 inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-red-500/20 bg-red-950/30 text-red-400 text-xs font-mono tracking-widest backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            СЕЗОН 1: ВЕЛИКОЕ ОТРЕЗВЛЕНИЕ
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-6 uppercase tracking-tighter leading-[0.9] drop-shadow-2xl">
            Тотальный <br /><span className="text-red-600 drop-shadow-[0_0_30px_rgba(220,38,38,0.5)]">Ужас</span>
          </h1>
          
          <p className="text-lg md:text-2xl text-zinc-400 mb-12 max-w-3xl mx-auto font-light leading-relaxed">
            Black League - Это приватный майнкрафт сервер с элементами RP и необыкновенными механиками..
          </p>
          
          <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
            <button onClick={copyIP} className="group relative w-full md:w-auto overflow-hidden rounded-xl bg-white text-black px-8 py-4 font-bold uppercase tracking-widest transition-all hover:bg-zinc-200 hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Play size={20} fill="currentColor" />
                <div className="flex flex-col items-start leading-none">
                  <span className="text-xs font-normal opacity-60">IP ADRESS:</span>
                  <span>play.blackleague.net</span>
                </div>
              </div>
            </button>
            <button onClick={() => setView('wiki')} className="w-full md:w-auto px-8 py-4 rounded-xl border border-white/20 bg-white/5 backdrop-blur-md text-white font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/40 transition-all flex items-center justify-center gap-3">
              <Book size={20} />
              <span>База Знаний</span>
            </button>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50 animate-bounce">
          <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Scroll</span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-zinc-500 to-transparent"></div>
        </div>
      </header>

      <section className="py-32 bg-[#050505] relative border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-end justify-between mb-16 border-b border-zinc-800 pb-4">
             <div>
                <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
                  Сводка <span className="text-red-600">Новостей</span>
                </h2>
                <div className="h-1 w-24 bg-red-600 mt-4 shadow-[0_0_15px_red]"></div>
             </div>
             <button onClick={() => setView('news')} className="hidden md:flex items-center gap-2 text-zinc-500 hover:text-white transition uppercase text-xs font-bold tracking-widest">
               Все записи <ArrowLeft className="rotate-180" size={14} />
             </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {newsItems.slice(0, 3).map(news => (
              <div key={news.id} className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col h-full" onClick={() => { setView('news'); setActiveNewsId(news.id); }}>
                {news.image && (
                  <div className="h-56 overflow-hidden relative">
                    <img src={news.image} alt="cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:grayscale-0 grayscale-[50%]" />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-80"></div>
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur border border-white/10 px-3 py-1 rounded text-xs font-mono text-zinc-300">
                      {news.date}
                    </div>
                  </div>
                )}
                <div className="p-8 flex-1 flex flex-col relative">
                  <div className="absolute -top-6 left-8 bg-red-600 w-12 h-1 group-hover:w-24 transition-all duration-500 shadow-[0_0_15px_red]"></div>
                  <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-red-500 transition-colors">{news.title}</h3>
                  <div className="text-zinc-500 text-sm line-clamp-3 mb-6 flex-1 font-light" dangerouslySetInnerHTML={{ __html: news.content ? news.content.replace(/<img[^>]*>/g, "") : '' }}></div>
                  <div className="text-xs font-bold text-zinc-600 group-hover:text-white uppercase tracking-widest flex items-center gap-2 transition-colors">
                      Подробнее <div className="w-4 h-[1px] bg-current"></div>
                  </div>
                </div>
              </div>
            ))}
            {newsItems.length === 0 && <div className="text-zinc-600 col-span-3 text-center py-20 font-mono">НЕТ АКТИВНЫХ ЗАПИСЕЙ В БАЗЕ ДАННЫХ</div>}
          </div>
          
          <button onClick={() => setView('news')} className="md:hidden mt-12 w-full py-4 border border-zinc-800 text-zinc-400 uppercase font-bold tracking-widest text-sm hover:bg-white/5 transition">
            Читать все
          </button>
        </div>
      </section>

      <footer className="bg-black border-t border-zinc-900 py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-8">
             <span className="text-2xl font-black uppercase text-zinc-800">Black League</span>
          </div>
          <p className="text-zinc-600 text-xs font-mono mb-8">&copy; 2026 Black League Project. All rights reserved.</p>
          <div className="flex justify-center gap-6">
            <a href="#" className="text-zinc-600 hover:text-white transition"></a>
            <a href="#" className="text-zinc-600 hover:text-white transition"></a>
            <a href="#" className="text-zinc-600 hover:text-white transition"></a>
          </div>
          {/* Secret Admin Area */}
          <div className="w-8 h-8 mx-auto mt-20 opacity-0 cursor-default" onClick={() => !isAdmin && setIsLoginModalOpen(true)}></div>
        </div>
      </footer>
    </div>
  );

  const renderNewsList = () => (
    <div className="pt-28 min-h-screen px-4 pb-20 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 border-b border-white/10 pb-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-2">Архив <span className="text-zinc-600">Событий</span></h2>
          <p className="text-zinc-500 font-mono text-sm">ХРОНОЛОГИЯ СЕРВЕРА BLACK LEAGUE</p>
        </div>
        {isAdmin && (
          <button onClick={createNews} className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition shadow-[0_0_20px_rgba(220,38,38,0.3)] uppercase tracking-wider text-sm">
            <PlusCircle size={18} /> Создать запись
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {newsItems.length === 0 && <div className="text-zinc-700 text-xl text-center py-20 font-light">База данных пуста.</div>}
        {newsItems.map(news => (
          <div 
            key={news.id} 
            onClick={() => setActiveNewsId(news.id)}
            className="group flex flex-col md:flex-row bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden hover:border-red-900/50 transition-all duration-300 cursor-pointer h-full md:h-64"
          >
            <div className="w-full md:w-1/3 bg-zinc-900 relative overflow-hidden">
               {news.image ? (
                 <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center bg-zinc-900/50 text-zinc-800"><Newspaper size={48} /></div>
               )}
               <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition"></div>
            </div>

            <div className="p-8 md:w-2/3 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                   <span className="text-red-500 text-[10px] font-mono font-bold border border-red-900/30 bg-red-950/20 px-2 py-1 rounded uppercase tracking-widest">{news.date}</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-red-500 transition-colors leading-none">{news.title}</h3>
                <div className="text-zinc-500 text-sm line-clamp-2 prose prose-invert">
                   <div dangerouslySetInnerHTML={{ __html: news.content ? news.content.replace(/<img[^>]*>/g, "") : '' }} />
                </div>
              </div>
              <div className="mt-6 flex items-center gap-2 text-zinc-600 text-xs font-bold uppercase tracking-widest group-hover:text-white transition-colors">
                Читать полностью <ChevronRight size={14} className="text-red-600" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="pt-20 h-screen flex flex-col md:flex-row overflow-hidden bg-[#050505] relative">
      {/* Sidebar Wiki */}
      {view === 'wiki' && (
        <aside className="w-full md:w-80 bg-[#0a0a0a] border-r border-white/5 flex flex-col h-[35vh] md:h-full shrink-0 z-20 shadow-2xl relative">
          <div className="p-6 border-b border-white/5 bg-zinc-900/20">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
              <Book size={12} /> Навигация
            </h2>
            <div className="text-xl font-bold text-white">WIKI.DATABASE</div>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
            {isAdmin && (
              <div className="grid grid-cols-2 gap-2 mb-6">
                <button onClick={() => setIsCategoryModalOpen(true)} className="flex items-center justify-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-yellow-600/50 hover:text-yellow-500 text-zinc-400 rounded-lg text-xs font-bold transition uppercase tracking-wider">
                  <FolderPlus size={14} /> Секция
                </button>
                <button onClick={createPage} className="flex items-center justify-center gap-2 p-3 bg-zinc-900 border border-zinc-800 hover:border-green-600/50 hover:text-green-500 text-zinc-400 rounded-lg text-xs font-bold transition uppercase tracking-wider">
                  <PlusCircle size={14} /> Статья
                </button>
              </div>
            )}

            {Object.keys(wikiPages).length === 0 && <div className="text-xs text-zinc-700 text-center font-mono py-10">NO DATA FOUND</div>}
            
            {Object.entries(wikiPages.reduce((acc, page) => {
                const cat = page.category || 'Unsorted';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(page);
                return acc;
              }, {})).map(([category, pages]) => (
              <div 
                key={category} 
                className={`mb-6 transition-all rounded-lg p-2 ${dragOverCategory === category ? 'bg-yellow-900/10 border border-dashed border-yellow-500/50' : 'border border-transparent'}`}
                onDragOver={(e) => {
                   if (!isAdmin) return;
                   e.preventDefault();
                   setDragOverCategory(category);
                }}
                onDragLeave={() => setDragOverCategory(null)}
                onDrop={(e) => {
                   e.preventDefault();
                   handlePageDrop(category);
                }}
              >
                <div className="flex items-center gap-3 px-2 mb-3">
                  <span className={`w-1 h-1 rounded-full shadow-[0_0_5px] ${dragOverCategory === category ? 'bg-yellow-500 shadow-yellow-500' : 'bg-red-600 shadow-red-600'}`}></span>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${dragOverCategory === category ? 'text-yellow-500' : 'text-zinc-500'}`}>{category}</span>
                </div>
                <div className="space-y-1 relative">
                  <div className="absolute left-[5px] top-0 bottom-0 w-[1px] bg-zinc-800"></div>
                  {pages.map(page => (
                    <div 
                      key={page.id}
                      draggable={isAdmin}
                      onDragStart={(e) => {
                        if (!isAdmin) return;
                        setDraggedPageId(page.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => {
                        setDraggedPageId(null);
                        setDragOverCategory(null);
                      }}
                      className="group/item relative"
                    >
                      <button 
                        onClick={() => setActivePageId(page.id)}
                        className={`w-full text-left pl-6 pr-4 py-2.5 text-sm transition-all duration-200 relative rounded-r-lg flex items-center justify-between
                          ${page.id === activePageId 
                            ? 'bg-gradient-to-r from-red-900/20 to-transparent text-white border-l-2 border-red-600' 
                            : 'text-zinc-500 hover:text-zinc-300 border-l-2 border-transparent hover:border-zinc-700'
                          }
                          ${draggedPageId === page.id ? 'opacity-50' : ''}
                          `}
                      >
                        <span className="truncate">{page.title || 'Untitled'}</span>
                        {isAdmin && <GripVertical size={12} className="opacity-0 group-hover/item:opacity-50 cursor-grab active:cursor-grabbing" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Main Content / Editor Area */}
      <main className="flex-1 flex flex-col bg-[#050505] overflow-hidden relative z-10">
        
        {/* Toolbar */}
        <div className="h-16 border-b border-white/5 bg-[#0a0a0a]/90 backdrop-blur flex items-center justify-between px-6 shrink-0 z-30">
            <div className="flex items-center gap-4">
               {view === 'news' && (
                 <button onClick={() => setActiveNewsId(null)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition text-xs font-bold uppercase tracking-wider">
                   <ArrowLeft size={14} /> Назад
                 </button>
               )}
               {isAdmin ? (
                 <>
                   <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>
                   <div className="flex gap-1">
                      <button onClick={() => formatDoc('bold')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition"><Bold size={16} /></button>
                      <button onClick={() => formatDoc('italic')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition"><Italic size={16} /></button>
                      <button onClick={() => formatDoc('underline')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition"><Underline size={16} /></button>
                   </div>
                   <div className="h-6 w-[1px] bg-zinc-800 mx-2"></div>
                   <div className="flex gap-1">
                      <button onClick={() => formatDoc('formatBlock', 'H2')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition"><Type size={16} /></button>
                      <button onClick={() => formatDoc('formatBlock', 'blockquote')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition"><Quote size={16} /></button>
                      <button onClick={() => openImageModal('content')} className="p-2 text-zinc-500 hover:text-white hover:bg-white/5 rounded transition"><ImageIcon size={16} /></button>
                   </div>
                 </>
               ) : (
                 <div className="text-zinc-500 text-xs font-mono flex items-center gap-2"><Eye size={14} /> РЕЖИМ ЧТЕНИЯ</div>
               )}
            </div>

            <div className="flex items-center gap-4">
               <span className="text-[10px] font-mono text-zinc-600 hidden md:inline uppercase tracking-widest">{saveStatus}</span>
               {isAdmin && (
                 <>
                   <button 
                     onClick={handleDelete} 
                     className={`flex items-center gap-2 px-3 py-1.5 rounded border transition-all text-xs font-bold uppercase tracking-wider ${showDeleteConfirm ? 'border-red-600 bg-red-600/10 text-red-500 animate-pulse' : 'border-zinc-800 text-zinc-500 hover:text-red-500 hover:border-red-900/50'}`}
                   >
                     {showDeleteConfirm ? 'ПОДТВЕРДИТЬ' : <Trash2 size={16} />}
                   </button>
                   <button onClick={() => handleSave(false)} className="bg-white text-black px-4 py-2 rounded font-bold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:bg-zinc-200 transition uppercase tracking-widest">
                     <Save size={14} /> Сохранить
                   </button>
                 </>
               )}
            </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-[#050505] p-0 md:p-8">
           <div className="max-w-4xl mx-auto min-h-[90vh] bg-[#080808] border-x border-zinc-900 shadow-2xl relative p-8 md:p-16">
              
              {/* Header Info */}
              <div className="mb-12 border-b border-zinc-800 pb-8">
                  <div className="flex flex-col gap-4 mb-6">
                     <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-mono text-red-500 uppercase tracking-widest border border-red-900/30 bg-red-950/10 px-3 py-1 rounded-full">
                           <Hash size={10} />
                           {isAdmin ? (
                             <input 
                               type="text" 
                               value={editorCategory}
                               onChange={(e) => setEditorCategory(e.target.value)}
                               placeholder="CATEGORY"
                               list={view === 'wiki' ? "category-list" : undefined}
                               className="bg-transparent border-none text-red-500 focus:ring-0 p-0 w-auto min-w-[50px] placeholder-red-900/50 uppercase"
                             />
                           ) : (
                             <span>{editorCategory || 'GENERAL'}</span>
                           )}
                        </div>
                        {/* Cover Image Input (News Only) */}
                        {view === 'news' && isAdmin && (
                           <div className="flex-1 flex items-center gap-2 bg-zinc-900 px-3 py-1 rounded border border-zinc-800 focus-within:border-zinc-600">
                              <Layout size={12} className="text-zinc-600" />
                              <input type="text" value={editorImage} onChange={(e) => setEditorImage(e.target.value)} placeholder="URL обложки..." className="bg-transparent text-xs text-zinc-400 w-full focus:outline-none" />
                              <button onClick={() => openImageModal('cover')} className="text-blue-500 hover:text-white"><UploadCloud size={12} /></button>
                           </div>
                        )}
                     </div>
                     
                     <input 
                       type="text" 
                       value={editorTitle}
                       onChange={(e) => setEditorTitle(e.target.value)}
                       readOnly={!isAdmin}
                       placeholder="ЗАГОЛОВОК"
                       className={`w-full bg-transparent border-none text-4xl md:text-6xl font-black text-white focus:ring-0 focus:outline-none placeholder-zinc-800 leading-none uppercase tracking-tight ${!isAdmin && 'pointer-events-none'}`}
                     />
                  </div>
                  
                  {view === 'news' && editorImage && (
                     <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden relative mb-8 border border-zinc-800">
                        <img src={editorImage} alt="Cover" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] to-transparent"></div>
                     </div>
                  )}
              </div>

              <div 
                ref={editorContentRef}
                contentEditable={isAdmin}
                onInput={() => isAdmin && setSaveStatus('TYPING...')}
                className="wiki-content prose prose-invert prose-lg max-w-none text-zinc-300 focus:outline-none pb-32"
                style={{ fontFamily: 'Exo 2, sans-serif' }}
              />
           </div>
           
           {/* Datalist for Categories */}
           {view === 'wiki' && (
             <datalist id="category-list">
               {uniqueCategories.map(cat => <option key={cat} value={cat} />)}
             </datalist>
           )}
        </div>
      </main>
    </div>
  );

  return (
    <div className="font-exo bg-[#050505] text-slate-200 min-h-screen relative overflow-x-hidden selection:bg-red-500/30 selection:text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@300;400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-exo { font-family: 'Exo 2', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        
        /* Wiki Typography */
        .wiki-content h2 { font-size: 2em; font-weight: 900; color: #fff; margin-top: 2em; margin-bottom: 0.8em; text-transform: uppercase; letter-spacing: -0.03em; border-left: 4px solid #dc2626; padding-left: 0.5em; line-height: 1; }
        .wiki-content h3 { font-size: 1.5em; font-weight: 700; color: #e4e4e7; margin-top: 1.5em; }
        .wiki-content p { line-height: 1.8; color: #a1a1aa; font-weight: 300; margin-bottom: 1.5em; }
        .wiki-content ul { padding-left: 1.5em; margin-bottom: 1.5em; list-style: none; }
        .wiki-content ul li { position: relative; margin-bottom: 0.5em; padding-left: 1.5em; }
        .wiki-content ul li::before { content: ""; position: absolute; left: 0; top: 0.6em; width: 6px; height: 6px; background: #dc2626; transform: rotate(45deg); }
        .wiki-content blockquote { border-left: 2px solid #3f3f46; padding: 1em 2em; color: #71717a; font-style: italic; background: #0f0f10; }
        .wiki-content img { border-radius: 8px; border: 1px solid #27272a; margin: 2em 0; }
        .wiki-content a { color: #dc2626; text-decoration: none; border-bottom: 1px dashed #dc2626; transition: 0.2s; }
        .wiki-content a:hover { color: #fff; border-bottom-style: solid; }
        .wiki-content strong { color: white; font-weight: 700; }

        /* Animations */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out forwards; }
        .animate-fadeInUp { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-slideDown { animation: slideDown 0.3s ease-out forwards; }
        
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #050505; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #3f3f46; border-radius: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #ef4444; }
      `}</style>
      
      <NoiseOverlay />
      <ParticlesBackground />
      <Toast message={toast.message} visible={toast.visible} />
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} error={loginError} />
      <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} onCreate={handleCreateCategory} />
      <ImageModal isOpen={isImageModalOpen} onClose={() => setIsImageModalOpen(false)} onInsert={handleInsertImage} targetType={imageModalTarget} />

      {renderNavbar()}
      {view === 'landing' && renderLanding()}
      {view === 'wiki' && renderEditor()}
      {view === 'news' && !activeNewsId && renderNewsList()}
      {view === 'news' && activeNewsId && renderEditor()}
    </div>
  );
}