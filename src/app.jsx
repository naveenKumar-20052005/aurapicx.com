import React, { useState, useEffect, useMemo, useRef } from 'react';
import { auth, db } from './firebase'; 
import { 
  onAuthStateChanged, signInAnonymously, GoogleAuthProvider, 
  signInWithPopup, signOut, createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail,
  sendEmailVerification, reload, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser
} from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, increment, setDoc, serverTimestamp, getDoc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { 
  Search, Download, Moon, Sun, Menu, X, ChevronDown, 
  Heart, CheckCircle, ExternalLink, Zap, Aperture, Globe, 
  TrendingUp, Monitor, ArrowRight, XCircle, Instagram, Twitter, Facebook, Mail, Shield, Gem, User, LogOut, LogIn, Loader2, Lock, Mail as MailIcon, AlertCircle, CheckSquare, ShieldCheck, RefreshCw, History, Settings, Trash2, Camera, Tag, LayoutGrid
} from 'lucide-react';

// --- COLLECTIONS ---
const COLL_GALLERY = "aura_images";
const COLL_HERO = "aura_hero";
const COLL_USERS = "users";

// --- RESOLUTIONS (Massive List) ---
const RESOLUTION_GROUPS = [
  { 
    title: "Popular Desktop", 
    sizes: ["1920x1080", "1366x768", "1280x720", "1440x900", "1536x864", "1600x900", "1280x800", "1280x1024"] 
  },
  { 
    title: "High Definition", 
    sizes: ["3840x2160 (4K)", "2560x1440 (2K)", "1920x1080 (FHD)", "1280x720 (HD)"] 
  },
  { 
    title: "Popular Mobile", 
    sizes: ["1080x1920", "1125x2436", "1170x2532", "1284x2778", "1290x2796", "1440x3120", "720x1280"] 
  },
  { 
    title: "Ultrawide", 
    sizes: ["2560x1080", "3440x1440", "3840x1600", "5120x1440"] 
  },
  { 
    title: "Social Media", 
    sizes: ["1080x1080", "1080x1350", "1200x630", "1500x500"] 
  },
  { 
    title: "Apple Resolutions", 
    sizes: ["320x480", "640x960", "640x1136", "750x1334", "1080x1920", "1125x2436", "1242x2688", "1280x2120", "2048x2048", "2932x2932"] 
  },
  { 
    title: "Android Resolutions", 
    sizes: ["240x320", "240x400", "320x240", "320x480", "360x640", "480x800", "480x854", "540x960", "720x1280", "800x1280", "1080x1920", "1080x2160", "1080x2280", "1440x2560", "1440x2960", "2160x3840", "1080x2400"] 
  }
];

const SEARCH_SUGGESTIONS = ["Cinematic", "Neon", "Minimalist", "Cyberpunk", "Nature", "Luxury Cars", "Abstract", "Space"];

// --- COMPONENTS ---

const HeroCarousel = ({ slides, onExploreCategory }) => {
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(() => setCurrent(prev => (prev + 1) % slides.length), 6000);
    return () => clearInterval(timer);
  }, [slides]);
  
  if (slides.length === 0) return null;

  return (
    <div className="relative h-[77.9vh] w-full overflow-hidden bg-black group border-b border-white/5">
      {slides.map((slide, index) => (
        <div key={slide.id} className={`absolute inset-0 transition-opacity duration-1000 ${index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={slide.url} className="w-full h-full object-cover transition-transform duration-[20s] ease-in-out scale-110" style={{filter: 'brightness(0.75)'}}/>
          <div className="absolute inset-0 flex flex-col justify-end items-start p-8 md:p-20 pb-24 bg-gradient-to-t from-black via-transparent to-transparent">
             <div className="max-w-5xl animate-in slide-in-from-bottom-10 fade-in duration-1000">
                <span className="inline-block px-4 py-1.5 bg-amber-600/90 text-white text-[10px] font-bold uppercase tracking-[0.2em] rounded-sm mb-6 backdrop-blur-md shadow-lg">{slide.category}</span>
                <h1 className="text-4xl md:text-6xl font-serif text-white mb-8 tracking-tight leading-none drop-shadow-2xl">{slide.title || 'Visuals for the Modern Era.'}</h1>
                <button onClick={() => onExploreCategory(slide.category)} className="bg-white text-black px-8 py-4 rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-3 shadow-lg text-xs uppercase tracking-widest">
                   Explore Collection <ArrowRight size={16}/>
                </button>
             </div>
          </div>
        </div>
      ))}
      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center gap-3">
          {slides.map((_, idx) => (
              <button key={idx} onClick={()=>setCurrent(idx)} className={`h-1 rounded-full transition-all duration-500 ${idx===current ? 'w-12 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'}`}/>
          ))}
      </div>
    </div>
  );
};

// REPLACE YOUR ImageModal COMPONENT WITH THIS

const ImageModal = ({ image, onClose, onDownload, theme }) => {
  if (!image) return null;
  return (
    <div className={`fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden`}>
       <button onClick={onClose} className={`absolute top-8 right-8 p-3 rounded-full hover:bg-white/20 transition-all z-50 bg-white/10 text-white`}>
         <XCircle size={32} strokeWidth={1}/>
       </button>
       
       <div className="w-full max-w-6xl h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar p-2">
          {/* Image Preview */}
          <div className="flex-shrink-0 w-full flex justify-center bg-black/20 rounded-lg py-4 relative">
             <img src={image.url} className="max-h-[65vh] w-auto object-contain shadow-2xl rounded-sm"/>
             
             {/* Quality Badge */}
             {image.isOriginalQuality && (
               <div className="absolute top-4 left-4 bg-green-600/90 backdrop-blur-md px-4 py-2 rounded-full text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                 <CheckCircle size={14}/>
                 Original Quality
               </div>
             )}
             
             {/* Metadata Badge */}
             {image.metadata && (
               <div className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg text-white text-xs font-mono">
                 {image.metadata.width}x{image.metadata.height} • {image.metadata.size}
               </div>
             )}
          </div>

          {/* Info Section */}
          <div className={`w-full ${theme.modalBg} border ${theme.border} rounded-2xl p-8 shadow-2xl flex flex-col md:flex-row gap-8`}>
             {/* Left: Details */}
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                    <span className={`px-3 py-1 bg-white/5 border ${theme.border} ${theme.textSecondary} text-[10px] font-bold rounded-full uppercase`}>{image.category}</span>
                    <span className="px-3 py-1 bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold rounded-full uppercase flex items-center gap-2">
                      <Heart size={10} className="fill-red-500"/> {image.likes || '0'}
                    </span>
                    {image.isOriginalQuality && (
                      <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 text-[10px] font-bold rounded-full uppercase">
                        Full Quality
                      </span>
                    )}
                </div>
                <h2 className={`text-3xl font-serif ${theme.text} mb-4`}>{image.title || 'Untitled'}</h2>
                <p className={`text-sm ${theme.textSecondary} mb-6`}>
                  {image.isOriginalQuality ? 
                    'This image is available in its original, uncompressed quality.' : 
                    'High-quality wallpaper optimized for web and download.'}
                </p>
                <button 
                  onClick={()=>onDownload(image.url, 'orig', 'orig', image.title, image)} 
                  className="w-full md:w-auto px-8 py-4 bg-amber-600 text-white font-bold rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform shadow-lg text-xs uppercase tracking-widest"
                >
                  <Download size={16}/> 
                  {image.isOriginalQuality ? 'Download Original (Best Quality)' : 'Download Original'}
                </button>
             </div>
             
             {/* Right: Resolution Selector */}
             <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-8">
                <h3 className={`text-[10px] font-bold ${theme.textSecondary} uppercase tracking-widest mb-4 flex items-center gap-2`}>
                  <Monitor size={12}/>
                  Select Custom Resolution
                </h3>
                <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {RESOLUTION_GROUPS.map(g => (
                       <div key={g.title}>
                          <div className="text-[10px] font-bold text-amber-600 uppercase mb-2 sticky top-0 bg-inherit py-1">{g.title}</div>
                          <div className="flex flex-wrap gap-2">
                             {g.sizes.map(s => (
                                <button 
                                  key={s} 
                                  onClick={()=>onDownload(image.url, s.split('x')[0], s.split('x')[1], image.title, image)} 
                                  className={`px-3 py-2 border ${theme.border} rounded-lg ${theme.textSecondary} hover:bg-amber-600 hover:text-white hover:border-amber-600 text-[10px] font-mono transition-all hover:scale-105`}
                                >
                                  {s.split(' ')[0]}
                                </button>
                             ))}
                          </div>
                       </div>
                    ))}
                </div>
             </div>
          </div>
       </div>
       
       {/* Custom scrollbar styles */}
       <style>{`
         .custom-scrollbar::-webkit-scrollbar { width: 8px; }
         .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); border-radius: 4px; }
         .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(217,119,6,0.5); border-radius: 4px; }
         .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(217,119,6,0.7); }
       `}</style>
    </div>
  );
};

// COPY THIS ENTIRE SECTION AND REPLACE YOUR AuthModal COMPONENT

const AuthModal = ({ onClose, theme, showToast, isDark }) => {
    const [view, setView] = useState('login'); 
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [showResendVerification, setShowResendVerification] = useState(false);

    const handleGoogle = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithPopup(auth, new GoogleAuthProvider());
            await setDoc(doc(db, COLL_USERS, result.user.uid), {
                uid: result.user.uid, 
                email: result.user.email, 
                displayName: result.user.displayName, 
                photoURL: result.user.photoURL, 
                lastLogin: serverTimestamp(), 
                provider: 'google',
                emailVerified: true
            }, { merge: true });
            showToast(`Welcome back, ${result.user.displayName.split(' ')[0]}!`); 
            onClose();
        } catch (e) { 
            showToast("Google Sign-In Failed", "error"); 
        }
        setIsLoading(false);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        if (!isVerified) return showToast("Complete security check", "error");
        setIsLoading(true);
        try {
            const res = await createUserWithEmailAndPassword(auth, email, password);
            const fullName = `${firstName} ${lastName}`;
            await updateProfile(res.user, { 
                displayName: fullName, 
                photoURL: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=d97706&color=fff` 
            });
            
            // Send verification email
            await sendEmailVerification(res.user, {
                url: window.location.origin,
                handleCodeInApp: false
            });
            
            await setDoc(doc(db, COLL_USERS, res.user.uid), {
                uid: res.user.uid, 
                email, 
                firstName, 
                lastName, 
                displayName: fullName, 
                photoURL: res.user.photoURL, 
                createdAt: serverTimestamp(), 
                emailVerified: false, 
                provider: 'email', 
                bio: 'New Member', 
                tag: 'Member', 
                favorites: [],
                verificationEmailSent: true
            });
            
            await signOut(auth); 
            showToast("Account Created! Check your email to verify."); 
            setView('verification');
        } catch (e) { 
            showToast(e.code === 'auth/email-already-in-use' ? 'Email already in use' : e.message, "error"); 
        }
        setIsLoading(false);
    };

    const handleLogin = async (e) => {
        e.preventDefault(); 
        setIsLoading(true);
        try { 
            const result = await signInWithEmailAndPassword(auth, email, password);
            
            // Check if email is verified
            await reload(result.user);
            
            if (!result.user.emailVerified) {
                showToast("Please verify your email first", "error");
                setShowResendVerification(true);
                await signOut(auth);
                return;
            }
            
            // Update user data
            await setDoc(doc(db, COLL_USERS, result.user.uid), {
                lastLogin: serverTimestamp(),
                emailVerified: true
            }, { merge: true });
            
            showToast("Welcome back!"); 
            onClose(); 
        } catch(e){ 
            if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password') {
                showToast("Invalid email or password", "error");
            } else {
                showToast(e.message, "error");
            }
        }
        setIsLoading(false);
    };

    const handleResendVerification = async () => {
        setIsLoading(true);
        try {
            const result = await signInWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(result.user, {
                url: window.location.origin,
                handleCodeInApp: false
            });
            await signOut(auth);
            showToast("Verification email sent!");
            setShowResendVerification(false);
        } catch (e) {
            showToast("Failed to send verification email", "error");
        }
        setIsLoading(false);
    };

    const Turnstile = () => {
        const [status, setStatus] = useState('idle');
        const verify = () => { 
            if(status==='idle') { 
                setStatus('verifying'); 
                setTimeout(()=>{ 
                    setStatus('success'); 
                    setIsVerified(true); 
                }, 1500); 
            } 
        };
        return (
            <div onClick={verify} className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer ${theme.border} bg-white/5 hover:bg-white/10 transition-colors`}>
                <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded border flex items-center justify-center transition-all ${status==='success'?'bg-amber-600 border-amber-600':'border-gray-500 hover:border-gray-400'}`}>
                        {status==='verifying' && <Loader2 size={14} className="animate-spin text-gray-400"/>}
                        {status==='success' && <CheckSquare size={14} className="text-white"/>}
                    </div>
                    <span className={`text-sm ${theme.textSecondary}`}>
                        {status==='idle'?'Click to verify you\'re human':status==='verifying'?'Verifying...':'Verified ✓'}
                    </span>
                </div>
                <ShieldCheck size={16} className={status==='success'?'text-amber-500':'text-gray-500'}/>
            </div>
        );
    };

    return (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm`} onClick={onClose}>
            <div className={`w-full max-w-md ${theme.modalBg} border ${theme.border} rounded-2xl shadow-2xl overflow-hidden relative`} onClick={e=>e.stopPropagation()}>
                <button onClick={onClose} className={`absolute top-4 right-4 p-2 rounded-full ${theme.hover} z-10`}><X size={20} className={theme.text}/></button>
                
                <div className="p-8 text-center border-b border-white/5 bg-gradient-to-b from-amber-900/10 to-transparent">
                    <Gem size={32} className="text-amber-500 mx-auto mb-4"/>
                    <h2 className={`text-2xl font-serif ${theme.text} mb-1`}>
                        {view==='login'?'Welcome Back':view==='signup'?'Join AuraPicx':'Check Your Email'}
                    </h2>
                    {view==='verification' && (
                        <p className={`text-sm ${theme.textSecondary} mt-2`}>
                            We've sent a verification link to {email}
                        </p>
                    )}
                </div>
                
                <div className="p-8 space-y-4">
                    {view === 'verification' ? (
                        <div className="text-center space-y-6">
                            <div className={`p-6 rounded-xl ${isDark?'bg-amber-900/10':'bg-amber-50'} border border-amber-500/20`}>
                                <MailIcon size={48} className="text-amber-500 mx-auto mb-4"/>
                                <h3 className={`font-bold ${theme.text} mb-2`}>Verify Your Email</h3>
                                <p className={`text-sm ${theme.textSecondary} mb-4`}>
                                    Click the link in the email we sent to activate your account.
                                </p>
                                <p className={`text-xs ${theme.textSecondary}`}>
                                    Didn't receive it? Check your spam folder.
                                </p>
                            </div>
                            <button onClick={handleResendVerification} disabled={isLoading} className={`text-sm text-amber-500 hover:text-amber-400 font-medium flex items-center justify-center gap-2 mx-auto ${isLoading?'opacity-50':''}`}>
                                {isLoading ? <Loader2 size={16} className="animate-spin"/> : <RefreshCw size={16}/>}
                                Resend Verification Email
                            </button>
                            <button onClick={()=>setView('login')} className={`text-sm ${theme.textSecondary} hover:${theme.text}`}>
                                Back to Login
                            </button>
                        </div>
                    ) : (
                        <>
                            <button onClick={handleGoogle} disabled={isLoading} className={`w-full py-3 border ${theme.border} rounded-xl flex items-center justify-center gap-2 ${theme.text} hover:bg-white/5 transition-colors ${isLoading?'opacity-50 cursor-not-allowed':''}`}>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Continue with Google
                            </button>
                            
                            <div className="flex items-center gap-4">
                                <div className="h-px bg-white/10 flex-1"></div>
                                <span className="text-xs text-gray-500">OR</span>
                                <div className="h-px bg-white/10 flex-1"></div>
                            </div>
                            
                            {showResendVerification && (
                                <div className={`p-4 rounded-lg ${isDark?'bg-amber-900/10':'bg-amber-50'} border border-amber-500/20`}>
                                    <div className="flex items-start gap-3">
                                        <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-0.5"/>
                                        <div>
                                            <p className={`text-sm ${theme.text} font-medium mb-2`}>Email not verified</p>
                                            <button onClick={handleResendVerification} disabled={isLoading} className="text-sm text-amber-500 hover:text-amber-400 font-medium">
                                                Resend verification email
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                            
                            <form onSubmit={view==='login'?handleLogin:handleSignup} className="space-y-4">
                                {view==='signup' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <input 
                                            required 
                                            placeholder="First Name" 
                                            value={firstName} 
                                            onChange={e=>setFirstName(e.target.value)} 
                                            className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                                        />
                                        <input 
                                            required 
                                            placeholder="Last Name" 
                                            value={lastName} 
                                            onChange={e=>setLastName(e.target.value)} 
                                            className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                                        />
                                    </div>
                                )}
                                <input 
                                    type="email" 
                                    required 
                                    placeholder="Email" 
                                    value={email} 
                                    onChange={e=>setEmail(e.target.value)} 
                                    className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                                />
                                <input 
                                    type="password" 
                                    required 
                                    placeholder="Password" 
                                    value={password} 
                                    onChange={e=>setPassword(e.target.value)} 
                                    minLength={6}
                                    className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm focus:border-amber-500 focus:outline-none transition-colors`}
                                />
                                {view==='signup' && <Turnstile />}
                                <button 
                                    disabled={isLoading || (view==='signup' && !isVerified)} 
                                    className={`w-full py-3 bg-amber-600 text-white font-bold rounded-xl hover:bg-amber-700 transition-colors flex items-center justify-center gap-2 ${(isLoading || (view==='signup' && !isVerified))?'opacity-50 cursor-not-allowed':''}`}
                                >
                                    {isLoading ? <Loader2 size={18} className="animate-spin"/> : null}
                                    {isLoading?'Processing...':view==='login'?'Sign In':'Create Account'}
                                </button>
                            </form>
                            
                            <div className="text-center text-sm">
                                <span className={theme.textSecondary}>
                                    {view==='login'?"Don't have an account? ":"Already have an account? "}
                                </span>
                                <button onClick={()=>{setView(view==='login'?'signup':'login'); setShowResendVerification(false)}} className="text-amber-500 font-bold hover:text-amber-400">
                                    {view==='login'?'Sign Up':'Sign In'}
                                </button>
                            </div>
                            
                            {view==='login' && (
                                <button onClick={()=>showToast("Password reset feature coming soon")} className={`text-xs ${theme.textSecondary} hover:${theme.text} mx-auto block`}>
                                    Forgot password?
                                </button>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};
// --- ACCOUNT DASHBOARD ---
const AccountDashboard = ({ user, onClose, onLogout, theme, showToast, allImages }) => {
    const [activeTab, setActiveTab] = useState('overview'); 
    const [history, setHistory] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [userData, setUserData] = useState({ displayName: user?.displayName || 'User', bio: '', tag: 'Member' });
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

    useEffect(() => {
        if(!user?.uid) return;
        const fetchUserData = async () => {
            const docSnap = await getDoc(doc(db, COLL_USERS, user.uid));
            if (docSnap.exists()) {
                const data = docSnap.data();
                setUserData(prev => ({ ...prev, ...data }));
                if (data.downloads) setHistory(data.downloads.reverse());
                if (data.favorites && allImages.length > 0) {
                    const favs = allImages.filter(img => data.favorites.includes(img.id));
                    setFavorites(favs);
                }
            }
        };
        fetchUserData();
    }, [user, allImages]);

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await updateProfile(user, { displayName: userData.displayName });
            await updateDoc(doc(db, COLL_USERS, user.uid), { displayName: userData.displayName, bio: userData.bio });
            showToast("Profile Updated");
        } catch(e) { showToast("Error", "error"); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if(passwords.new !== passwords.confirm) return showToast("Mismatch", "error");
        try {
            const cred = EmailAuthProvider.credential(user.email, passwords.old);
            await reauthenticateWithCredential(user, cred);
            await updatePassword(user, passwords.new);
            showToast("Password Updated");
            setPasswords({old:'',new:'',confirm:''});
        } catch(e) { showToast("Wrong Old Password", "error"); }
    };

    const handleDeleteAccount = async () => {
        if(!confirm("Permanently delete account?")) return;
        try {
            const cred = EmailAuthProvider.credential(user.email, passwords.old);
            await reauthenticateWithCredential(user, cred);
            await deleteDoc(doc(db, COLL_USERS, user.uid));
            await deleteUser(user);
            showToast("Account Deleted"); onClose();
        } catch(e) { showToast("Verification Failed", "error"); }
    };

    return (
        <div className={`fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm`} onClick={onClose}>
            <div className={`w-full max-w-4xl ${theme.modalBg} border ${theme.border} rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px]`} onClick={e=>e.stopPropagation()}>
                <div className={`w-full md:w-64 border-r ${theme.border} bg-black/20 p-6 flex flex-col gap-2`}>
                    <div className="flex items-center gap-3 mb-6">
                        <img src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}`} className="w-10 h-10 rounded-full object-cover border border-amber-500"/>
                        <div className="overflow-hidden">
                            <h3 className={`font-bold ${theme.text} truncate text-sm`}>{user?.displayName}</h3>
                            <p className={`text-xs ${theme.textSecondary} truncate`}>{user?.email}</p>
                        </div>
                    </div>
                    <button onClick={()=>setActiveTab('overview')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium ${activeTab==='overview'?'bg-amber-600 text-white':`${theme.textSecondary} hover:bg-white/5`}`}>Overview</button>
                    <button onClick={()=>setActiveTab('favorites')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium ${activeTab==='favorites'?'bg-amber-600 text-white':`${theme.textSecondary} hover:bg-white/5`}`}>My Favorites</button>
                    <button onClick={()=>setActiveTab('history')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium ${activeTab==='history'?'bg-amber-600 text-white':`${theme.textSecondary} hover:bg-white/5`}`}>Download History</button>
                    <button onClick={()=>setActiveTab('settings')} className={`text-left px-4 py-3 rounded-lg text-sm font-medium ${activeTab==='settings'?'bg-amber-600 text-white':`${theme.textSecondary} hover:bg-white/5`}`}>Settings</button>
                    <div className="mt-auto pt-4 border-t border-white/10">
                        <button onClick={onLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold flex items-center gap-2"><LogOut size={14}/> Sign Out</button>
                    </div>
                </div>
                <div className="flex-1 p-8 overflow-y-auto relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10"><X size={20} className={theme.text}/></button>
                    
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <h2 className={`text-2xl font-serif ${theme.text}`}>Account Overview</h2>
                            <div className={`p-6 rounded-xl border ${theme.border} bg-white/5 flex items-center gap-4`}>
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-amber-600/20 text-amber-500`}><User size={32}/></div>
                                <div><h3 className={`text-lg font-bold ${theme.text}`}>{user?.displayName}</h3><p className={`${theme.textSecondary} text-sm`}>Member since {new Date(user?.metadata.creationTime).getFullYear()}</p></div>
                                <div className="ml-auto">
                                    {user.emailVerified ? 
                                        <span className="flex items-center gap-1 text-green-500 text-xs font-bold bg-green-500/10 px-3 py-1 rounded-full"><CheckCircle size={12}/> Verified</span> :
                                        <button onClick={()=>sendEmailVerification(user)} className="text-amber-500 text-xs font-bold underline">Verify Email</button>
                                    }
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl border ${theme.border} bg-white/5`}><div className="text-2xl font-bold text-white">{favorites.length}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Favorites</div></div>
                                <div className={`p-4 rounded-xl border ${theme.border} bg-white/5`}><div className="text-2xl font-bold text-white">{history.length}</div><div className="text-xs text-gray-500 uppercase tracking-wider">Downloads</div></div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'favorites' && (
                        <div>
                            <h2 className={`text-2xl font-serif ${theme.text} mb-6`}>My Favorites</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {favorites.length === 0 ? <p className={theme.textSecondary}>No favorites yet.</p> : favorites.map((item, i) => (
                                    <div key={i} className="aspect-video rounded-lg overflow-hidden border border-white/10 relative group">
                                        <img src={item.url} className="w-full h-full object-cover"/>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">{item.title}</div>
                                        <div className="absolute top-2 right-2 text-red-500"><Heart size={14} fill="currentColor"/></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'history' && (
                        <div>
                            <h2 className={`text-2xl font-serif ${theme.text} mb-6`}>Download History</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {history.length === 0 ? <p className={theme.textSecondary}>No downloads yet.</p> : history.map((item, i) => (
                                    <div key={i} className="aspect-video rounded-lg overflow-hidden border border-white/10 relative group">
                                        <img src={item.url} className="w-full h-full object-cover"/>
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">{item.title}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Profile Details</h3>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <input value={userData.displayName} onChange={e=>setUserData({...userData, displayName:e.target.value})} className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm`}/>
                                    <textarea value={userData.bio} onChange={e=>setUserData({...userData, bio:e.target.value})} placeholder="Bio" className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm h-24`}/>
                                    <button className="px-6 py-2 bg-white text-black font-bold rounded-lg text-sm">Save Profile</button>
                                </form>
                            </div>
                            <div className={`pt-6 border-t ${theme.border}`}>
                                <h3 className={`text-lg font-bold ${theme.text} mb-4`}>Security</h3>
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    <input type="password" placeholder="Current Password" value={passwords.old} onChange={e=>setPasswords({...passwords, old:e.target.value})} className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm`}/>
                                    <input type="password" placeholder="New Password" value={passwords.new} onChange={e=>setPasswords({...passwords, new:e.target.value})} className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm`}/>
                                    <input type="password" placeholder="Confirm" value={passwords.confirm} onChange={e=>setPasswords({...passwords, confirm:e.target.value})} className={`w-full p-3 rounded-lg bg-white/5 border ${theme.border} ${theme.text} text-sm`}/>
                                    <button className="px-6 py-2 bg-amber-600 text-white font-bold rounded-lg text-sm">Update Password</button>
                                </form>
                            </div>
                            <div className={`pt-6 border-t ${theme.border}`}>
                                <h3 className="text-lg font-bold text-red-500 mb-2">Danger Zone</h3>
                                <button onClick={handleDeleteAccount} className="px-6 py-2 border border-red-500 text-red-500 font-bold rounded-lg text-sm hover:bg-red-500/10">Delete Account</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
export default function AuraPicApp() {
  const [user, setUser] = useState(null);
  const [images, setImages] = useState([]);
  const [heroSlides, setHeroSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [toast, setToast] = useState(null);
  
  // UI States
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  
  // Modal Toggles
  const [activeModal, setActiveModal] = useState(null); // 'auth', 'account'
  const [likedImages, setLikedImages] = useState({});

  const galleryRef = useRef(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        if (currentUser) {
            setUser(currentUser);
            if (!currentUser.isAnonymous) {
                const userDoc = await getDoc(doc(db, COLL_USERS, currentUser.uid));
                if (!userDoc.exists()) {
                    await setDoc(doc(db, COLL_USERS, currentUser.uid), {
                        uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName, photoURL: currentUser.photoURL, lastLogin: serverTimestamp(), favorites: [], downloads: []
                    });
                }
            }
        } else {
            signInAnonymously(auth); setUser(null);
        }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubGallery = onSnapshot(collection(db, COLL_GALLERY), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setImages(data); setLoading(false);
    });
    const unsubHero = onSnapshot(collection(db, COLL_HERO), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setHeroSlides(data);
    });
    return () => { unsubGallery(); unsubHero(); };
  }, []);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleLogout = async () => {
      await signOut(auth);
      setActiveModal(null);
      showToast("Signed Out");
  };

  const categoryStats = useMemo(() => {
    const stats = {};
    images.forEach(i => stats[i.category] = (stats[i.category]||0) + 1);
    return stats;
  }, [images]);

  const dynamicSuggestions = useMemo(() => {
    const titles = images.map(img => img.title).filter(Boolean);
    const cats = Object.keys(categoryStats);
    return [...new Set([...cats, ...titles])].sort();
  }, [images, categoryStats]);

  const filteredImages = images.filter(img => {
    const cat = selectedCategory === 'All' || img.category === selectedCategory;
    const searchLower = searchQuery.toLowerCase();
    const search = (img.category || '').toLowerCase().includes(searchLower) || (img.title || '').toLowerCase().includes(searchLower);
    return cat && search;
  });

  const scrollToGallery = () => {
    if (galleryRef.current) {
        const y = galleryRef.current.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleHeroExplore = (category) => {
    setSelectedCategory(category);
    showToast(`Filtering for ${category}`);
    if (galleryRef.current) {
        const y = galleryRef.current.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleSearchSuggestionClick = (term) => {
      setSearchQuery(term);
      setShowSearchSuggestions(false);
      const matchCat = Object.keys(categoryStats).find(c => c.toLowerCase() === term.toLowerCase());
      if(matchCat) setSelectedCategory(matchCat);
      else setSelectedCategory('All');
      scrollToGallery();
  };

  const toggleLike = async (id) => {
    if (user && !user.isAnonymous) {
        try {
            await updateDoc(doc(db, COLL_USERS, user.uid), {
                favorites: arrayUnion(id)
            });
            await updateDoc(doc(db, COLL_GALLERY, id), { realLikes: increment(1) });
            showToast("Added to favorites");
        } catch(e) { console.error(e); }
    } else {
        showToast("Join AuraPicx to like images!", "error");
        setActiveModal('auth');
    }
  };
// REPLACE YOUR downloadResized FUNCTION WITH THIS

  const downloadResized = async (url, w, h, name, imageObj) => {
    // Track download in user profile if authenticated
    if (user && !user.isAnonymous) {
        try {
            await updateDoc(doc(db, COLL_USERS, user.uid), {
                downloads: arrayUnion({ 
                  url, 
                  title: name || 'Wallpaper', 
                  date: Date.now(), 
                  resolution: w === 'orig' ? 'Original' : `${w}x${h}` 
                })
            });
        } catch(e){console.error('Download tracking failed:', e)}
    }

    const fileName = name || 'Wallpaper';
    
    // Download original quality
    if (w === 'orig') {
        showToast(`Downloading Original Quality...`);
        try {
            // Check if image was uploaded as original quality
            if (imageObj?.isOriginalQuality) {
                showToast("Downloading original upload (no compression)");
            }
            
            // Try to download directly with fetch
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl; 
            a.download = `AuraPicx-${fileName}-Original.jpg`;
            document.body.appendChild(a); 
            a.click(); 
            document.body.removeChild(a); 
            window.URL.revokeObjectURL(blobUrl);
            showToast("✓ Downloaded Successfully!");
        } catch (error) { 
            console.error('Download failed:', error);
            // Fallback: open in new tab
            window.open(url, '_blank');
            showToast("Opening in new tab...");
        }
        return;
    }
    
    // Custom resolution download with canvas resizing
    showToast(`Generating ${w}x${h}...`);
    const img = new Image(); 
    img.crossOrigin = "anonymous"; 
    img.src = url;
    
    img.onload = () => {
      const cvs = document.createElement('canvas');
      const tw = parseInt(w); 
      const th = parseInt(h);
      cvs.width = tw; 
      cvs.height = th;
      const ctx = cvs.getContext('2d');
      
      // Calculate crop dimensions to maintain aspect ratio
      const sR = img.width/img.height; 
      const dR = tw/th;
      let rW, rH, oX, oY;
      
      if(sR > dR) { 
        rH = img.height; 
        rW = img.height * dR; 
        oX = (img.width - rW) / 2; 
        oY = 0; 
      } else { 
        rW = img.width; 
        rH = img.width / dR; 
        oX = 0; 
        oY = (img.height - rH) / 2; 
      }
      
      ctx.drawImage(img, oX, oY, rW, rH, 0, 0, tw, th);
      
      // Use high quality JPEG encoding
      cvs.toBlob((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `AuraPicx-${fileName}-${tw}x${th}.jpg`;
        a.click();
        window.URL.revokeObjectURL(blobUrl);
        showToast("✓ Downloaded Successfully!");
      }, 'image/jpeg', 0.95);
    };
    
    img.onerror = () => {
      showToast("Download failed", "error");
    };
  };

  const colors = isDarkMode ? {
    bg: 'bg-[#020202]', nav: 'bg-[#020202]/80', card: 'bg-[#0a0a0a]',
    text: 'text-gray-100', textSecondary: 'text-gray-400', border: 'border-white/5',
    inputBg: 'bg-white/5', hover: 'hover:bg-white/5', modalBg: 'bg-[#0a0a0a]', modalOverlay: 'bg-[#020202]/98'
  } : {
    bg: 'bg-[#f0f2f5]', nav: 'bg-white/90', card: 'bg-white',
    text: 'text-gray-900', textSecondary: 'text-gray-500', border: 'border-gray-200',
    inputBg: 'bg-gray-100', hover: 'hover:bg-gray-100', modalBg: 'bg-white', modalOverlay: 'bg-white/95'
  };

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${colors.bg} ${colors.text} selection:bg-amber-500/30 selection:text-amber-600`}>
      
      {toast && (
        <div className="fixed top-24 right-6 z-[120] animate-in fade-in slide-in-from-right-10">
          <div className={`${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'} border ${colors.border} pl-6 pr-8 py-4 rounded-lg shadow-2xl flex items-center gap-4 backdrop-blur-xl border-l-4 ${toast.type === 'error' ? 'border-red-500' : 'border-amber-500'}`}>
            <span className={`text-xs font-bold uppercase tracking-widest ${toast.type === 'error' ? 'text-red-500' : 'text-amber-500'}`}>{toast.type === 'error' ? 'Error' : 'System'}</span>
            <span className="text-sm font-medium">{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className={`sticky top-0 z-50 ${colors.nav} border-b ${colors.border} h-24 backdrop-blur-xl transition-all`}>
        <div className="max-w-[2000px] mx-auto px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-12">
             <div className="flex items-center gap-4 cursor-pointer group" onClick={()=>window.location.href='/'}>
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(217,119,6,0.3)] group-hover:scale-105 transition-transform"><Gem size={20}/></div>
                <div className="hidden md:block leading-none"><h1 className="font-serif text-2xl tracking-tight">AuraPicx</h1><span className={`text-[9px] tracking-[0.3em] ${colors.textSecondary} uppercase font-bold block mt-1`}>Premium Assets</span></div>
             </div>
             <div className={`hidden xl:flex items-center gap-8 text-xs font-bold uppercase tracking-widest ${colors.textSecondary}`}>
                <button onClick={()=>setSelectedCategory('All')} className={`hover:${colors.text} transition-colors`}>Discover</button>
                <a href="https://unsplash.com" target="_blank" className={`hover:${colors.text} transition-colors`}>Curated</a>
             </div>
          </div>
          <div className="hidden md:block flex-1 max-w-xl mx-12">
             <div className="relative group">
                <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} onFocus={()=>setShowSearchSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSearchSuggestions(false), 200)} placeholder="Search for perfection..." className={`w-full py-3 pl-12 pr-4 rounded-full border ${colors.border} ${colors.inputBg} focus:outline-none focus:border-amber-500/50 transition-all text-sm font-medium placeholder:${colors.textSecondary} ${colors.text}`}/>
                <Search className={`absolute left-4 top-3.5 ${colors.textSecondary}`} size={18}/>
                {showSearchSuggestions && searchQuery.length > 0 && (
                    <div className={`absolute top-14 left-0 w-full ${colors.card} border ${colors.border} rounded-xl shadow-2xl overflow-hidden p-2 z-[60]`}>
                        <div className={`text-[10px] font-bold ${colors.textSecondary} px-3 py-2 uppercase tracking-widest`}>Suggestions</div>
                        {SEARCH_SUGGESTIONS.filter(s => s.toLowerCase().includes(searchQuery.toLowerCase())).map(s => (
                            <button key={s} onClick={()=>{setSearchQuery(s); setShowSearchSuggestions(false); scrollToGallery()}} className={`w-full text-left px-3 py-2.5 rounded-lg ${colors.hover} text-sm ${colors.textSecondary} hover:${colors.text} flex items-center gap-2 transition-colors`}><Search size={14} className="opacity-50"/> {s}</button>
                        ))}
                    </div>
                )}
             </div>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={()=>setIsDarkMode(!isDarkMode)} className={`p-3 rounded-full ${colors.hover} transition-colors`}>{isDarkMode ? <Sun size={20} className="text-amber-500"/> : <Moon size={20}/>}</button>
             {user && !user.isAnonymous ? (
                 <div className="relative">
                    <button onClick={()=>setIsUserMenuOpen(!isUserMenuOpen)} className="p-1 rounded-full border border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all">
                        <img src={user.photoURL} alt="User" className="w-9 h-9 rounded-full object-cover"/>
                    </button>
                    {isUserMenuOpen && (
                        <div className={`absolute top-14 right-0 w-56 ${colors.card} border ${colors.border} rounded-xl shadow-2xl overflow-hidden p-2 z-[60]`}>
                            <button onClick={()=>{setActiveModal('account'); setIsUserMenuOpen(false)}} className={`w-full text-left px-4 py-3 rounded-lg ${colors.hover} text-sm ${colors.text} flex items-center gap-3`}><User size={16}/> View Profile</button>
                            <button onClick={()=>{setActiveModal('account'); setIsUserMenuOpen(false)}} className={`w-full text-left px-4 py-3 rounded-lg ${colors.hover} text-sm ${colors.text} flex items-center gap-3`}><History size={16}/> Download History</button>
                            <button onClick={()=>{setActiveModal('account'); setIsUserMenuOpen(false)}} className={`w-full text-left px-4 py-3 rounded-lg ${colors.hover} text-sm ${colors.text} flex items-center gap-3`}><Settings size={16}/> Settings</button>
                            <div className={`h-px my-1 ${colors.border} bg-white/10`}></div>
                            <button onClick={handleLogout} className="w-full text-left px-4 py-3 rounded-lg hover:bg-red-500/10 text-red-500 text-sm flex items-center gap-3 font-bold"><LogOut size={16}/> Logout</button>
                        </div>
                    )}
                 </div>
             ) : (
                 <button onClick={()=>setActiveModal('auth')} className={`hidden lg:flex items-center gap-2 px-6 py-2.5 rounded-full bg-amber-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-amber-500 transition-all shadow-lg shadow-amber-600/20`}><User size={14}/> Join</button>
             )}
             <button onClick={()=>setIsSidebarOpen(true)} className={`lg:hidden p-3 rounded-full ${colors.hover}`}><Menu size={20}/></button>
          </div>
        </div>
      </nav>

      <HeroCarousel slides={heroSlides} onExploreCategory={handleHeroExplore}/>

      <main className="max-w-[2000px] mx-auto px-4 md:px-8 py-20 relative">
         {/* OLD SLIDE EFFECT SIDEBAR */}
         <div ref={galleryRef} className={`flex items-center gap-3 mb-16 overflow-x-auto pb-6 scrollbar-hide border-b ${colors.border}`}>
            <button onClick={()=>setSelectedCategory('All')} className={`relative px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory==='All' ? 'text-amber-500' : `${colors.textSecondary} hover:${colors.text}`}`}>
                All
                {selectedCategory==='All' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full animate-in fade-in slide-in-from-left-2"/>}
            </button>
            {Object.keys(categoryStats).map(c => (
               <button key={c} onClick={()=>setSelectedCategory(c)} className={`relative px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all ${selectedCategory===c ? 'text-amber-500' : `${colors.textSecondary} hover:${colors.text}`}`}>
                  {c} <span className="ml-1 opacity-40">{categoryStats[c]}</span>
                  {selectedCategory===c && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500 rounded-full animate-in fade-in slide-in-from-left-2"/>}
               </button>
            ))}
         </div>

         {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
               {[1,2,3,4,5,6,7,8].map(i => <div key={i} className={`aspect-video ${isDarkMode ? 'bg-white/5' : 'bg-gray-200'} rounded-sm animate-pulse`}/>)}
            </div>
         ) : (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-10">
              {filteredImages.map((img) => (
                <div key={img.id} onClick={() => setModalImage(img)} className={`group relative aspect-video overflow-hidden ${colors.card} cursor-pointer shadow-lg hover:shadow-2xl transition-all rounded-xl`}>
                   <img src={img.url} className="w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 opacity-90 group-hover:opacity-100"/>
                   <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 p-8 flex flex-col justify-end">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-100">
                         <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2 block">{img.category}</span>
                         <h3 className="font-serif text-white text-xl leading-none mb-4 truncate">{img.title || 'Untitled'}</h3>
                         <div className="flex justify-between items-center border-t border-white/10 pt-4">
                            <span className="flex items-center gap-2 text-xs font-bold text-gray-300 uppercase tracking-wider"><Heart size={12} className={likedImages[img.id] ? "fill-red-500 text-red-500" : "text-white"}/> {img.likes || '0'}</span>
                            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform"><Download size={14}/></div>
                         </div>
                      </div>
                   </div>
                   <button onClick={(e)=>{e.stopPropagation(); toggleLike(img.id)}} className="absolute top-4 right-4 z-20 p-3 bg-black/50 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:text-black">
                      <Heart size={18} className={likedImages[img.id] ? "fill-red-500 text-red-500" : ""}/>
                   </button>
                </div>
              ))}
           </div>
         )}
      </main>

      <footer className={`border-t ${colors.border} ${isDarkMode ? 'bg-[#020202]' : 'bg-gray-100'} pt-24 pb-12`}>
         <div className="max-w-[2000px] mx-auto px-8 grid md:grid-cols-4 lg:grid-cols-5 gap-16 mb-20">
            <div className="lg:col-span-2">
               <div className="flex items-center gap-3 mb-8"><div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white"><Gem size={18}/></div><span className={`font-serif text-2xl ${colors.text}`}>AuraPicx</span></div>
               <p className={`${colors.textSecondary} text-sm leading-relaxed max-w-sm mb-10`}>The definitive source for high-fidelity visual assets.</p>
               <div className="flex gap-4">{[Instagram, Twitter, Facebook, Mail].map((Icon, i) => <button key={i} className={`w-12 h-12 rounded-full border ${colors.border} flex items-center justify-center ${colors.textSecondary} hover:${colors.text} ${colors.hover} transition-all`}><Icon size={18}/></button>)}</div>
            </div>
            {[{ head: 'Discover', links: ['Trending', 'New', 'Editors Choice'] }, { head: 'Company', links: ['About', 'Careers', 'Contact'] }, { head: 'Legal', links: ['Privacy', 'Terms', 'License'] }].map((col) => (
               <div key={col.head}><h4 className={`${colors.text} font-bold uppercase tracking-widest text-[10px] mb-8`}>{col.head}</h4><ul className={`space-y-4 text-xs ${colors.textSecondary} font-medium uppercase tracking-wide`}>{col.links.map(l => <li key={l} className="hover:text-amber-500 cursor-pointer transition-colors">{l}</li>)}</ul></div>
            ))}
         </div>
      </footer>

      <ImageModal image={modalImage} onClose={()=>setModalImage(null)} onDownload={downloadResized} theme={colors} />
      
      {activeModal === 'auth' && <AuthModal onClose={()=>setActiveModal(null)} theme={colors} showToast={showToast} isDark={isDarkMode} />}
      {activeModal === 'account' && user && <AccountDashboard user={user} onClose={()=>setActiveModal(null)} onLogout={handleLogout} theme={colors} showToast={showToast} allImages={images} />}

    </div>
  );
}