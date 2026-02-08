import React, { useState, useEffect, useRef } from 'react';
import { 
  Menu, X, Lock, Unlock, Play, Book, Save, Trash2, PlusCircle, FolderPlus,
  Bold, Italic, Underline, List, Quote, Type, Eye, CheckCircle, ExternalLink, AlertTriangle,
  Image as ImageIcon, UploadCloud, Newspaper, Calendar, ArrowLeft, CloudOff, Cloud, Layout
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

// --- ИНИЦИАЛИЗАЦИЯ FIREBASE (БЕЗОПАСНАЯ) ---

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
let USE_FIREBASE = false;
let FIREBASE_ERROR = null;

try {
  const isEnvConfig = typeof __firebase_config !== 'undefined';
  const isLocalConfigValid = localConfig.apiKey && !localConfig.apiKey.includes("ВСТАВЬТЕ_СВОЙ");

  if (isEnvConfig || isLocalConfigValid) {
    const config = isEnvConfig ? JSON.parse(__firebase_config) : localConfig;
    app = initializeApp(config);
    auth = getAuth(app);
    db = getFirestore(app);
    USE_FIREBASE = true;
  } else {
    console.warn("Firebase config is missing or placeholder. Falling back to LocalStorage.");
  }
} catch (e) {
  console.error("Firebase init failed:", e);
  FIREBASE_ERROR = e.message;
  USE_FIREBASE = false;
}

const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

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
        this.size = Math.random() * 2;
        this.speedX = (Math.random() * 0.5) - 0.25;
        this.speedY = (Math.random() * 0.5) - 0.25;
        this.opacity = Math.random() * 0.5;
      }
      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.speedX *= 0.99; // Slight friction
        this.speedY *= 0.99;
        
        // Random slight impulse
        if(Math.random() > 0.95) {
             this.speedX += (Math.random() * 0.2) - 0.1;
             this.speedY += (Math.random() * 0.2) - 0.1;
        }

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }
      draw() {
        ctx.fillStyle = `rgba(150, 150, 150, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const init = () => {
      particlesArray = [];
      for (let i = 0; i < 40; i++) {
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

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 opacity-30" />;
};

const Toast = ({ message, visible }) => {
  return (
    <div 
      className={`fixed bottom-5 right-5 bg-green-600 text-white px-6 py-3 rounded shadow-2xl z-[60] flex items-center gap-3 transition-transform duration-300 ${visible ? 'translate-y-0' : 'translate-y-32'}`}
    >
      <CheckCircle size={20} />
      <span>{typeof message === 'string' ? message : 'Уведомление'}</span>
    </div>
  );
};

const CategoryModal = ({ isOpen, onClose, onCreate }) => {
  const [catName, setCatName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (catName.trim()) {
      onCreate(catName);
      setCatName('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-yellow-600/50 p-6 rounded-lg shadow-2xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <FolderPlus className="text-yellow-500" size={24} /> Новая категория
        </h3>
        <input 
          type="text" 
          value={catName}
          onChange={(e) => setCatName(e.target.value)}
          placeholder="Название категории..."
          className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-yellow-500 focus:outline-none transition mb-4"
          autoFocus
        />
        <button 
          onClick={handleSubmit}
          className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded transition shadow-lg shadow-yellow-900/20"
        >
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
    if (isOpen) {
      setUrl('');
      setFile(null);
      setPreview('');
      setActiveTab('url');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 800 * 1024) { 
        alert("Файл слишком большой! (макс 800KB)");
        return;
      }
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selected);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'url' && url.trim()) {
      onInsert(url);
      onClose();
    } else if (activeTab === 'file' && preview) {
      onInsert(preview);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-blue-600/50 p-6 rounded-lg shadow-2xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-white">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <ImageIcon className="text-blue-500" size={24} /> 
          {targetType === 'cover' ? 'Обложка новости' : 'Вставить изображение'}
        </h3>

        <div className="flex gap-2 mb-4 bg-black/30 p-1 rounded-lg">
          <button onClick={() => setActiveTab('url')} className={`flex-1 py-1.5 rounded text-sm font-bold transition ${activeTab === 'url' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Ссылка</button>
          <button onClick={() => setActiveTab('file')} className={`flex-1 py-1.5 rounded text-sm font-bold transition ${activeTab === 'file' ? 'bg-blue-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}>Файл</button>
        </div>

        {activeTab === 'url' ? (
          <input type="text" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="URL..." className="w-full bg-black/50 border border-gray-700 rounded p-3 text-white focus:border-blue-500 focus:outline-none transition mb-4" autoFocus />
        ) : (
          <div className="mb-4">
            <label className="block w-full cursor-pointer bg-black/50 border border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 hover:bg-gray-900 transition relative overflow-hidden group">
              <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              {preview ? (
                <img src={preview} alt="Preview" className="max-h-32 mx-auto rounded object-contain" />
              ) : (
                <div className="text-gray-400 text-sm flex flex-col items-center py-2"><UploadCloud size={32} className="mb-2 text-gray-500" /><span>Выбрать файл</span></div>
              )}
            </label>
          </div>
        )}

        <button onClick={handleSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded transition shadow-lg shadow-blue-900/20 disabled:opacity-50" disabled={activeTab === 'file' && !preview}>
          {targetType === 'cover' ? 'Установить обложку' : 'Вставить'}
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-[#0f172a] border border-red-900/50 p-8 rounded-lg shadow-2xl max-w-sm w-full relative">
        <button onClick={onClose} className="absolute top-2 right-3 text-gray-500 hover:text-white">
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold text-white mb-6 text-center uppercase">Вход <span className="text-red-600">Admin</span></h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">USERNAME</label>
            <input type="text" value={user} onChange={(e) => setUser(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-red-600 focus:outline-none transition" />
          </div>
          <div>
            <label className="block text-xs font-mono text-gray-400 mb-1">PASSWORD</label>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full bg-black/50 border border-gray-700 rounded p-2 text-white focus:border-red-600 focus:outline-none transition" />
          </div>
          {error && <div className="text-red-500 text-xs text-center font-bold">Неверные данные!</div>}
          <button onClick={() => onLogin(user, pass)} className="w-full bg-red-700 hover:bg-red-800 text-white font-bold py-2 rounded transition shadow-lg shadow-red-900/20">ВОЙТИ</button>
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
  const [imageModalTarget, setImageModalTarget] = useState('content'); // 'content' or 'cover'
  const [isAdmin, setIsAdmin] = useState(false);
  const [loginError, setLoginError] = useState(false);
  
  const [wikiPages, setWikiPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  
  const [newsItems, setNewsItems] = useState([]);
  const [activeNewsId, setActiveNewsId] = useState(null);

  const [editorTitle, setEditorTitle] = useState('');
  const [editorCategory, setEditorCategory] = useState('');
  const [editorImage, setEditorImage] = useState(''); // Для обложки новости
  const [saveStatus, setSaveStatus] = useState('Сохранено');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const editorContentRef = useRef(null);
  const selectionRangeRef = useRef(null);
  const [toast, setToast] = useState({ message: '', visible: false });
  const [authUser, setAuthUser] = useState(null);

  // --- 1. АВТОРИЗАЦИЯ И ЗАГРУЗКА ---
  useEffect(() => {
    const token = localStorage.getItem('bl_admin_token');
    if (token === 'true') setIsAdmin(true);

    if (USE_FIREBASE) {
      const initAuth = async () => {
        try {
          if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (e) {
          console.error("Auth error:", e);
        }
      };
      initAuth();
      const unsubscribe = onAuthStateChanged(auth, (user) => setAuthUser(user));
      return () => unsubscribe();
    } else {
      const storedWiki = localStorage.getItem('bl_wiki_data');
      const storedNews = localStorage.getItem('bl_news_data');
      
      setWikiPages(storedWiki ? JSON.parse(storedWiki) : DEFAULT_WIKI_DATA);
      setNewsItems(storedNews ? JSON.parse(storedNews) : DEFAULT_NEWS_DATA);
      
      const initialWiki = storedWiki ? JSON.parse(storedWiki) : DEFAULT_WIKI_DATA;
      if (initialWiki.length > 0) setActivePageId(initialWiki[0].id);
    }
  }, []);

  // --- 2. СИНХРОНИЗАЦИЯ ДАННЫХ (FIREBASE ONLY) ---
  useEffect(() => {
    if (!USE_FIREBASE || !authUser) return;

    try {
      const qWiki = query(collection(db, 'artifacts', appId, 'public', 'data', 'wiki'));
      const unsubWiki = onSnapshot(qWiki, (snapshot) => {
        const pages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        pages.sort((a, b) => a.category?.localeCompare(b.category) || a.title?.localeCompare(b.title));
        setWikiPages(pages);
        if (activePageId && !pages.find(p => p.id === activePageId)) setActivePageId(null);
      }, (err) => console.error("Wiki sync error", err));

      const qNews = query(collection(db, 'artifacts', appId, 'public', 'data', 'news'));
      const unsubNews = onSnapshot(qNews, (snapshot) => {
        const news = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Sort by date (simple string comparison works for ISO, but for DD.MM.YYYY it might be weird, 
        // relying on creation order for now or manual sorting if needed)
        setNewsItems(news);
        if (activeNewsId && !news.find(n => n.id === activeNewsId)) setActiveNewsId(null);
      }, (err) => console.error("News sync error", err));

      return () => {
        unsubWiki();
        unsubNews();
      };
    } catch (e) {
      console.error("Sync setup failed", e);
    }
  }, [authUser, activePageId, activeNewsId]);

  // --- 3. РЕДАКТОР: СИНХРОНИЗАЦИЯ ПОЛЕЙ ---
  useEffect(() => {
    setShowDeleteConfirm(false);
    let targetItem = null;

    if (view === 'wiki' && activePageId) {
      targetItem = wikiPages.find(p => p.id === activePageId);
    } else if (view === 'news' && activeNewsId) {
      targetItem = newsItems.find(n => n.id === activeNewsId);
    }

    if (targetItem) {
      setEditorTitle(targetItem.title || '');
      setEditorCategory(view === 'wiki' ? (targetItem.category || '') : (targetItem.date || ''));
      setEditorImage(view === 'news' ? (targetItem.image || '') : '');
      if (editorContentRef.current && document.activeElement !== editorContentRef.current) {
        editorContentRef.current.innerHTML = targetItem.content || '';
      }
    } else {
      setEditorTitle('');
      setEditorCategory('');
      setEditorImage('');
      if (editorContentRef.current) editorContentRef.current.innerHTML = '';
    }
  }, [activePageId, activeNewsId, view, wikiPages, newsItems]);

  // --- ФУНКЦИИ ---
  const showToast = (msg) => {
    setToast({ message: msg, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  };

  const copyIP = () => {
    navigator.clipboard.writeText("play.blackleague.net").then(() => showToast("IP скопирован!"));
  };

  const handleLogin = (u, p) => {
    if (u === CREDENTIALS.user && p === CREDENTIALS.pass) {
      setIsAdmin(true);
      localStorage.setItem('bl_admin_token', 'true');
      setIsLoginModalOpen(false);
      setLoginError(false);
      showToast("Вход выполнен: BOBBYNTNH");
    } else {
      setLoginError(true);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('bl_admin_token');
    showToast("Выход из системы");
  };

  // --- CRUD ---
  const saveDataLocally = (type, data) => {
    if (type === 'wiki') localStorage.setItem('bl_wiki_data', JSON.stringify(data));
    else localStorage.setItem('bl_news_data', JSON.stringify(data));
  };

  const createPage = async () => {
    if (!isAdmin) return;
    const newPageData = { title: 'Новая Страница', category: 'Черновики', content: '<p>Начните писать здесь...</p>' };
    if (USE_FIREBASE && authUser) {
      try {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wiki'), newPageData);
        setActivePageId(docRef.id);
      } catch(e) { console.error(e); showToast("Ошибка создания"); }
    } else {
      const newPage = { id: Date.now().toString(), ...newPageData };
      const updated = [...wikiPages, newPage];
      setWikiPages(updated);
      setActivePageId(newPage.id);
      saveDataLocally('wiki', updated);
    }
    showToast("Страница создана");
  };

  const createNews = async () => {
    if (!isAdmin) return;
    const newNewsData = { 
      title: 'Новая Новость', 
      date: new Date().toLocaleDateString('ru-RU'), 
      image: '', 
      content: '<p>Текст новости...</p>' 
    };
    if (USE_FIREBASE && authUser) {
      try {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'news'), newNewsData);
        setActiveNewsId(docRef.id);
      } catch(e) { console.error(e); showToast("Ошибка создания"); }
    } else {
      const newNews = { id: Date.now().toString(), ...newNewsData };
      const updated = [newNews, ...newsItems];
      setNewsItems(updated);
      setActiveNewsId(newNews.id);
      saveDataLocally('news', updated);
    }
    showToast("Новость создана");
  };

  const handleCreateCategory = async (catName) => {
    if (!isAdmin) return;
    const newPageData = { title: 'Введение', category: catName.trim(), content: `<p>Добро пожаловать в раздел <strong>${catName}</strong>.</p>` };
    if (USE_FIREBASE && authUser) {
      try {
        const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'wiki'), newPageData);
        setActivePageId(docRef.id);
      } catch(e) { console.error(e); showToast("Ошибка создания"); }
    } else {
      const newPage = { id: Date.now().toString(), ...newPageData };
      const updated = [...wikiPages, newPage];
      setWikiPages(updated);
      setActivePageId(newPage.id);
      saveDataLocally('wiki', updated);
    }
    showToast(`Категория "${catName}" создана`);
  };

  const handleSave = async (silent = false) => {
    if (!isAdmin) return;
    const content = editorContentRef.current.innerHTML;
    setSaveStatus("Сохранение...");

    if (USE_FIREBASE && authUser) {
      try {
        if (view === 'wiki' && activePageId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wiki', activePageId), { title: editorTitle, category: editorCategory, content });
        } else if (view === 'news' && activeNewsId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', activeNewsId), { title: editorTitle, date: editorCategory, image: editorImage, content });
        }
      } catch (e) {
        console.error(e);
        setSaveStatus("Ошибка");
        return;
      }
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
    }
    setSaveStatus("Сохранено " + new Date().toLocaleTimeString());
    if (!silent) showToast("Сохранено!");
  };

  const handleDelete = async () => {
    if (!isAdmin) return;
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
      return;
    }

    if (USE_FIREBASE && authUser) {
      try {
        if (view === 'wiki' && activePageId) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'wiki', activePageId));
          setActivePageId(null);
        } else if (view === 'news' && activeNewsId) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'news', activeNewsId));
          setActiveNewsId(null);
        }
      } catch (e) { console.error(e); showToast("Ошибка удаления"); }
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
    }
    setShowDeleteConfirm(false);
    showToast("Удалено");
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
    if (imageModalTarget === 'cover') {
      setEditorImage(url);
    } else {
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
    <nav className="fixed w-full z-50 top-0 bg-black/90 backdrop-blur-md shadow-lg border-b border-red-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 cursor-pointer" onClick={() => setView('landing')}>
            <span className="text-xl font-bold tracking-wider uppercase text-white border-l-4 border-red-600 pl-3 font-exo">
              Black <span className="text-red-600">League</span>
            </span>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => setView('landing')} className={`transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wide ${view === 'landing' ? 'text-red-500' : 'text-gray-300 hover:text-white'}`}>О сервере</button>
              <button onClick={() => { setView('news'); setActiveNewsId(null); }} className={`transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wide border ${view === 'news' ? 'text-red-500 bg-red-900/20 border-red-900/50' : 'text-gray-300 border-transparent hover:text-white'}`}>Новости</button>
              <button onClick={() => setView('wiki')} className={`transition-colors px-3 py-2 rounded-md text-sm font-medium uppercase tracking-wide border ${view === 'wiki' ? 'text-red-500 bg-red-900/20 border-red-900/50' : 'text-gray-300 border-transparent hover:text-white'}`}>База Знаний</button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button onClick={isAdmin ? handleLogout : () => setIsLoginModalOpen(true)} className="text-gray-500 hover:text-white transition" title={isAdmin ? "Выйти" : "Вход для админа"}>
              {isAdmin ? <Unlock className="text-green-500" size={20} /> : <Lock size={20} />}
            </button>
            <a href="https://discord.gg/zbTMvD6ud2" target="_blank" className="bg-red-700 hover:bg-red-800 text-white px-4 py-1.5 rounded font-bold transition transform hover:scale-105 flex items-center gap-2 text-sm">
              <ExternalLink size={16} /> Discord
            </a>
          </div>

          <div className="-mr-2 flex md:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white p-2">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-b border-red-900/30">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 text-center">
            <button onClick={() => { setView('landing'); setIsMobileMenuOpen(false); }} className="text-gray-300 block w-full px-3 py-2 rounded-md text-base font-medium">О сервере</button>
            <button onClick={() => { setView('news'); setActiveNewsId(null); setIsMobileMenuOpen(false); }} className="text-gray-300 block w-full px-3 py-2 rounded-md text-base font-medium">Новости</button>
            <button onClick={() => { setView('wiki'); setIsMobileMenuOpen(false); }} className="text-gray-300 block w-full px-3 py-2 rounded-md text-base font-medium">База Знаний</button>
            <button onClick={() => { if(isAdmin) handleLogout(); else setIsLoginModalOpen(true); setIsMobileMenuOpen(false); }} className="text-gray-500 block w-full px-3 py-2 rounded-md text-base font-medium">
               {isAdmin ? "Выйти (Админ)" : "Админ-панель"}
            </button>
          </div>
        </div>
      )}
    </nav>
  );

  const renderLanding = () => (
    <div className="pt-16 min-h-screen">
      <header className="relative h-[calc(100vh-4rem)] flex items-center justify-center text-center px-4 overflow-hidden">
         <div className="absolute inset-0 z-[-1]" style={{
           background: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('https://images.unsplash.com/photo-1607988795628-9ca65b0c90f5?q=80&w=2070&auto=format&fit=crop')`,
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}></div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="mb-4 inline-block px-4 py-1 rounded-full border border-red-500/30 bg-red-900/20 text-red-400 text-sm font-mono animate-pulse">
            СЕЗОН 1: ВЕЛИКОЕ ИСПЫТАНИЕ
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 uppercase tracking-tighter leading-tight drop-shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            Тотальная <br /><span className="text-red-600">Битва</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto font-light">
            Хардкорный сервер выживания. Исследуй опасный мир, сражайся с монстрами и выживай в мрачной атмосфере постапокалипсиса.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <button onClick={copyIP} className="group relative px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-lg uppercase tracking-widest hover:bg-white hover:text-black transition-all duration-300 w-full md:w-auto overflow-hidden">
              <span className="relative z-10 flex items-center gap-3 justify-center">
                <Play size={20} /> play.blackleague.net
              </span>
              <div className="absolute inset-0 h-full w-full scale-0 rounded-2xl transition-all duration-300 group-hover:scale-100 group-hover:bg-white/10"></div>
            </button>
            <button onClick={() => setView('wiki')} className="px-8 py-4 bg-red-700 text-white font-bold text-lg uppercase tracking-widest hover:bg-red-800 transition-all duration-300 w-full md:w-auto shadow-lg shadow-red-900/50 flex items-center justify-center gap-2">
               База Знаний <Book size={20} />
            </button>
          </div>
        </div>
      </header>

      <section className="py-24 bg-zinc-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-red-900/5 skew-x-12 pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mt-2 mb-4 uppercase">
            Последние <span className="text-red-600">Новости</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mt-12 text-left">
            {newsItems.slice(0, 2).map(news => (
              <div key={news.id} className="bg-[#0f172a]/80 border border-gray-800 rounded-lg overflow-hidden hover:border-red-600/50 transition cursor-pointer group flex flex-col" onClick={() => { setView('news'); setActiveNewsId(news.id); }}>
                {news.image && (
                   <div className="h-48 overflow-hidden relative">
                      <img src={news.image} alt="cover" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
                   </div>
                )}
                <div className="p-6 flex-1 flex flex-col">
                   <div className="flex justify-between items-start mb-2">
                       <span className="text-red-500 text-xs font-mono bg-red-900/20 px-2 py-0.5 rounded">{news.date}</span>
                   </div>
                   <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">{news.title}</h3>
                   <div className="text-gray-400 text-sm line-clamp-3 mb-4" dangerouslySetInnerHTML={{ __html: news.content ? news.content.replace(/<img[^>]*>/g, "") : '' }}></div>
                   <div className="mt-auto text-sm font-bold text-gray-500 group-hover:text-white flex items-center gap-1 transition-colors">
                      Читать полностью <ArrowLeft className="rotate-180" size={14} />
                   </div>
                </div>
              </div>
            ))}
            {newsItems.length === 0 && <div className="text-gray-500 col-span-2 text-center">Новостей пока нет</div>}
          </div>
          <button onClick={() => setView('news')} className="mt-12 px-8 py-3 border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition-all uppercase font-bold tracking-wider rounded">
            Читать все новости
          </button>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-900 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-600 text-sm">
          <p>&copy; 2026 Black League. Not affiliated with Mojang AB.</p>
        </div>
      </footer>
    </div>
  );

  const renderNewsList = () => (
    <div className="pt-24 min-h-screen px-4 pb-20">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-12 border-b border-gray-800 pb-6">
          <h2 className="text-3xl md:text-5xl font-bold text-white uppercase">Новости <span className="text-red-600">Проекта</span></h2>
          {isAdmin && (
            <button onClick={createNews} className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded font-bold flex items-center gap-2 transition shadow-lg shadow-red-900/30">
              <PlusCircle size={20} /> <span className="hidden sm:inline">Добавить</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.length === 0 && <div className="text-gray-500 text-lg col-span-full text-center py-10">Новостей пока нет.</div>}
          {newsItems.map(news => (
            <div 
              key={news.id} 
              onClick={() => setActiveNewsId(news.id)}
              className="bg-[#0f172a] border border-gray-800 rounded-xl overflow-hidden hover:border-red-600/50 hover:shadow-2xl hover:shadow-red-900/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col h-full"
            >
              {/* Cover Image Area */}
              <div className="h-48 bg-gray-900 relative overflow-hidden">
                 {news.image ? (
                   <img src={news.image} alt={news.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-700">
                     <Newspaper size={48} opacity={0.2} />
                   </div>
                 )}
                 <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                 <div className="absolute bottom-2 left-4">
                    <span className="bg-red-700 text-white text-xs font-mono font-bold px-2 py-1 rounded shadow-lg">
                       {news.date}
                    </span>
                 </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-red-500 transition-colors leading-tight">{news.title}</h3>
                <div className="text-gray-400 text-sm line-clamp-3 prose prose-invert prose-sm mb-4">
                   <div dangerouslySetInnerHTML={{ __html: news.content ? news.content.replace(/<img[^>]*>/g, "") : '' }} />
                </div>
                <div className="mt-auto pt-4 border-t border-gray-800 text-sm font-bold text-gray-500 group-hover:text-white flex items-center gap-2 transition-colors">
                  Подробнее <ArrowLeft className="rotate-180" size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEditor = () => (
    <div className="pt-16 h-screen flex flex-col md:flex-row overflow-hidden bg-[#0a0a0a]">
      {/* Sidebar только для Wiki */}
      {view === 'wiki' && (
        <aside className="w-full md:w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col h-[30vh] md:h-full shrink-0">
          <div className="p-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="font-bold text-white uppercase tracking-wide">Статьи</h2>
            {isAdmin && (
              <div className="flex gap-2">
                <button onClick={() => setIsCategoryModalOpen(true)} className="text-yellow-500 hover:text-yellow-400 transition-colors" title="Создать категорию">
                  <FolderPlus size={20} />
                </button>
                <button onClick={createPage} className="text-green-500 hover:text-green-400 transition-colors" title="Создать страницу">
                  <PlusCircle size={20} />
                </button>
              </div>
            )}
          </div>
          <div className="p-2 overflow-y-auto flex-1 space-y-1">
            {Object.keys(wikiPages).length === 0 && <div className="p-4 text-sm text-gray-500 text-center">Загрузка или пусто...</div>}
            {Object.entries(
              wikiPages.reduce((acc, page) => {
                const cat = page.category || 'Без категории';
                if (!acc[cat]) acc[cat] = [];
                acc[cat].push(page);
                return acc;
              }, {})
            ).map(([category, pages]) => (
              <div key={category}>
                <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase mt-2">{category}</div>
                {pages.map(page => (
                  <button 
                    key={page.id}
                    onClick={() => setActivePageId(page.id)}
                    className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition flex items-center ${page.id === activePageId ? 'bg-red-900/30 text-red-400 border-l-2 border-red-500' : 'text-gray-300 hover:bg-gray-800'}`}
                  >
                    {page.title || 'Без названия'}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </aside>
      )}

      <main className="flex-1 flex flex-col bg-[#050505] overflow-hidden relative">
        
        {isAdmin ? (
          <div className="h-14 border-b border-gray-800 bg-[#0f172a] flex items-center justify-between px-4 shrink-0">
              <div className="flex items-center space-x-2">
               {view === 'news' && (
                 <button onClick={() => setActiveNewsId(null)} className="mr-2 text-gray-400 hover:text-white" title="Назад к списку">
                   <ArrowLeft size={20} />
                 </button>
               )}
               <button onClick={() => formatDoc('bold')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Жирный"><Bold size={18} /></button>
               <button onClick={() => formatDoc('italic')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Курсив"><Italic size={18} /></button>
               <button onClick={() => formatDoc('underline')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Подчеркнутый"><Underline size={18} /></button>
               <div className="w-px h-6 bg-gray-700 mx-2"></div>
               <button onClick={() => formatDoc('formatBlock', 'H2')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white font-bold" title="Заголовок"><Type size={18} /></button>
               <button onClick={() => formatDoc('insertUnorderedList')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Список"><List size={18} /></button>
               <button onClick={() => formatDoc('formatBlock', 'blockquote')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Цитата"><Quote size={18} /></button>
               <button onClick={() => openImageModal('content')} className="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white" title="Вставить изображение в текст"><ImageIcon size={18} /></button>
              </div>
              <div className="flex items-center space-x-3">
               <span className="text-xs text-gray-500 italic mr-2 hidden md:inline">{saveStatus}</span>
               <button 
                onClick={handleDelete} 
                className={`flex items-center gap-2 p-2 rounded transition-colors ${showDeleteConfirm ? 'bg-red-600 text-white hover:bg-red-700' : 'text-red-500 hover:bg-red-900/20'}`}
                title="Удалить"
               >
                 {showDeleteConfirm ? <span className="text-xs font-bold px-1">ПОДТВЕРДИТЬ?</span> : <Trash2 size={18} />}
               </button>
               <button onClick={() => handleSave(false)} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-bold flex items-center gap-1 shadow-lg shadow-blue-900/20">
                 <Save size={16} /> <span className="hidden md:inline">Сохранить</span>
               </button>
              </div>
          </div>
        ) : (
          <div className="h-12 border-b border-gray-800 bg-[#0f172a]/50 flex items-center justify-between px-4 shrink-0">
             {view === 'news' && (
               <button onClick={() => setActiveNewsId(null)} className="text-gray-400 hover:text-white flex items-center gap-2 text-sm font-bold">
                 <ArrowLeft size={16} /> Назад к новостям
               </button>
             )}
             <span className="text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-auto"><Eye size={14} /> Режим чтения</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
           <div className="max-w-4xl mx-auto">
             
             {view === 'wiki' && (
                <datalist id="category-list">
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
             )}

             <div className="flex flex-col gap-4 mb-2">
               <div className="flex gap-4 items-center">
                 <input 
                   type="text" 
                   value={editorCategory}
                   onChange={(e) => setEditorCategory(e.target.value)}
                   readOnly={!isAdmin}
                   placeholder={view === 'wiki' ? "КАТЕГОРИЯ" : "ДАТА (ДД.ММ.ГГГГ)"}
                   list={view === 'wiki' ? "category-list" : undefined}
                   className={`bg-transparent border-none text-red-500 font-mono text-sm uppercase tracking-widest focus:ring-0 focus:outline-none placeholder-red-900/50 ${!isAdmin && 'pointer-events-none'}`}
                 />
                 
                 {/* Поле для обложки (только новости и только админ) */}
                 {view === 'news' && isAdmin && (
                    <div className="flex-1 flex items-center gap-2 bg-[#0f172a] rounded px-2 py-1 border border-gray-800 focus-within:border-gray-600 transition">
                      <Layout size={14} className="text-gray-500" />
                      <input 
                        type="text"
                        value={editorImage}
                        onChange={(e) => setEditorImage(e.target.value)}
                        placeholder="Ссылка на обложку..."
                        className="bg-transparent border-none text-gray-300 text-xs w-full focus:outline-none placeholder-gray-600"
                      />
                      <button 
                        onClick={() => openImageModal('cover')} 
                        className="text-blue-500 hover:text-white transition"
                        title="Загрузить/Выбрать"
                      >
                        <UploadCloud size={14} />
                      </button>
                    </div>
                 )}
               </div>
             </div>

             <input 
               type="text" 
               value={editorTitle}
               onChange={(e) => setEditorTitle(e.target.value)}
               readOnly={!isAdmin}
               placeholder="Заголовок"
               className={`w-full bg-transparent border-none text-3xl md:text-5xl font-extrabold text-white mb-6 focus:ring-0 focus:outline-none placeholder-gray-800 ${!isAdmin && 'pointer-events-none'}`}
             />

             {view === 'news' && editorImage && (
                <div className="mb-8 w-full h-64 md:h-80 rounded-lg overflow-hidden relative shadow-2xl border border-gray-800">
                  <img src={editorImage} alt="Cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20"></div>
                </div>
             )}
             
             <div 
               ref={editorContentRef}
               contentEditable={isAdmin}
               onInput={() => isAdmin && setSaveStatus('Редактирование...')}
               className="wiki-content min-h-[50vh] text-gray-300 outline-none pb-24 prose prose-invert max-w-none"
               style={{ fontFamily: 'Exo 2, sans-serif' }}
             />
           </div>
        </div>
      </main>
    </div>
  );

  return (
    <div className="font-exo bg-[#050505] text-slate-200 min-h-screen relative">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Exo+2:wght@400;600;800&family=JetBrains+Mono:wght@400;700&display=swap');
        .font-exo { font-family: 'Exo 2', sans-serif; }
        .font-mono { font-family: 'JetBrains Mono', monospace; }
        .wiki-content h2 { font-size: 1.5em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; color: #f87171; }
        .wiki-content ul { list-style-type: disc; padding-left: 1.5em; margin-bottom: 1em; }
        .wiki-content blockquote { border-left: 4px solid #dc2626; padding-left: 1em; margin: 1em 0; color: #94a3b8; font-style: italic; background: rgba(220, 38, 38, 0.1); padding: 10px; border-radius: 0 4px 4px 0; }
        .wiki-content code { background: #1e293b; padding: 2px 5px; border-radius: 3px; font-family: 'JetBrains Mono', monospace; color: #fca5a5; }
        .wiki-content img { max-width: 100%; height: auto; border-radius: 8px; margin: 1em 0; border: 1px solid #333; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #dc2626; }
      `}</style>
      
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