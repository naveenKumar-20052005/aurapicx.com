// import React, { useState, useEffect, useMemo } from 'react';
// import { auth, db } from './firebase';
// import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
// import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
// import { 
//   Shield, Upload, X, Image as ImageIcon,
//   ArrowLeft, LayoutDashboard, Heart, CheckCircle, 
//   Edit2, Search, Crown, Zap, Gem
// } from 'lucide-react';

// // Collections
// const COLL_GALLERY = "aura_images";
// const COLL_HERO = "aura_hero";

// // --- UTILS ---
// const processFile = (file, preserveOriginal = true) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.readAsDataURL(file);
//     reader.onload = (e) => {
//       if (preserveOriginal) {
//         // Return original without any processing
//         resolve(e.target.result);
//       } else {
//         const img = new Image();
//         img.src = e.target.result;
//         img.onload = () => {
//           const canvas = document.createElement('canvas');
//           let w = img.width, h = img.height;
          
//           // 4K Resolution Cap (3840px) - only if not preserving original
//           const MAX = 3840; 
//           if (w > MAX || h > MAX) {
//              if (w > h) { h *= MAX/w; w = MAX; } else { w *= MAX/h; h = MAX; }
//           }
          
//           canvas.width = w; canvas.height = h;
//           const ctx = canvas.getContext('2d');
//           ctx.drawImage(img, 0, 0, w, h);
          
//           // Quality 0.95 for better quality
//           resolve(canvas.toDataURL('image/jpeg', 0.95));
//         };
//       }
//     };
//     reader.onerror = reject;
//   });
// };

// export default function AdminPanel() {
//   const [user, setUser] = useState(null);
//   const [galleryImages, setGalleryImages] = useState([]);
//   const [heroImages, setHeroImages] = useState([]);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [pin, setPin] = useState('');
//   const [toasts, setToasts] = useState([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [activeTab, setActiveTab] = useState('gallery'); 
  
//   // Form State
//  const [editingId, setEditingId] = useState(null);
//   const [newImageUrl, setNewImageUrl] = useState('');
//   const [newCategory, setNewCategory] = useState('');
//   const [newTitle, setNewTitle] = useState('');
//   const [customLikes, setCustomLikes] = useState('');
//   const [isCustomCategory, setIsCustomCategory] = useState(false);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [preserveOriginal, setPreserveOriginal] = useState(true);
//   const [imageMetadata, setImageMetadata] = useState(null);
//   useEffect(() => {
//     // Admin always needs explicit login, but we init auth to read DB if needed
//     const unsub = onAuthStateChanged(auth, (u) => {
//         if (!u) signInAnonymously(auth);
//         setUser(u);
//     });
//     return () => unsub();
//   }, []);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, COLL_GALLERY), (snap) => {
//       const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
//       data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
//       setGalleryImages(data);
//     });
//     return () => unsub();
//   }, []);

//   useEffect(() => {
//     const unsub = onSnapshot(collection(db, COLL_HERO), (snap) => {
//       const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
//       data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
//       setHeroImages(data);
//     });
//     return () => unsub();
//   }, []);

//   const totalRealLikes = useMemo(() => {
//     return galleryImages.reduce((acc, img) => acc + (img.realLikes || 0), 0);
//   }, [galleryImages]);

//   const categories = useMemo(() => {
//     const stats = {};
//     galleryImages.forEach(i => stats[i.category] = (stats[i.category]||0) + 1);
//     return stats;
//   }, [galleryImages]);

//   const addToast = (msg, type='success') => {
//     const id = Date.now();
//     setToasts(p => [...p, {id, msg, type}]);
//     setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
//   };

//   const displayImages = activeTab === 'gallery' ? galleryImages : heroImages;
//   const filteredImages = displayImages.filter(img => 
//     (img.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
//     (img.category || '').toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const handleLogin = (e) => {
//     e.preventDefault();
//     if(pin === 'Aura#2025') {
//         setIsAuthenticated(true);
//         addToast("Welcome, Executive");
//     } else {
//         addToast("Invalid Credentials", "error");
//     }
//   };

//   const startEdit = (img) => {
//     setEditingId(img.id);
//     setNewImageUrl(img.url);
//     setNewCategory(img.category || '');
//     setNewTitle(img.title || '');
//     setCustomLikes(img.likes || '');
//     window.scrollTo({ top: 0, behavior: 'smooth' });
//     addToast("Editing Asset");
//   };

//   const cancelEdit = () => {
//     setEditingId(null);
//     setNewImageUrl('');
//     setNewCategory('');
//     setNewTitle('');
//     setCustomLikes('');
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if(!newImageUrl) return;
//     setIsSubmitting(true);
    
//     const targetCollection = activeTab === 'gallery' ? COLL_GALLERY : COLL_HERO;

//     try {
//       const payload = {
//         url: newImageUrl, 
//         category: newCategory || 'Showcase', 
//         title: newTitle || 'Untitled',
//         likes: customLikes || '0', 
//         updatedAt: serverTimestamp(),
//         isOriginalQuality: preserveOriginal,
//         metadata: imageMetadata
//       };

//       if (!editingId) {
//           payload.createdAt = serverTimestamp();
//           payload.realLikes = 0; 
//       }

//       if (editingId) {
//         await updateDoc(doc(db, targetCollection, editingId), payload);
//         addToast("Asset Updated");
//         cancelEdit();
//       } else {
//         await addDoc(collection(db, targetCollection), payload);
//         addToast(activeTab === 'gallery' ? "Added to Gallery" : "Added to Slider");
//         setNewImageUrl('');
//         setNewTitle('');
//         setCustomLikes('');
//       }
//     } catch(e) { 
//         console.error(e);
//         addToast("Error: Image might be too large for DB (Limit 1MB)", "error");
//     }
//     setIsSubmitting(false);
//   };
// const handleFile = async (e) => {
//     if(e.target.files?.[0]) {
//        const f = e.target.files[0];
       
//        // Get image metadata
//        const img = new Image();
//        const reader = new FileReader();
//        reader.onload = (event) => {
//          img.src = event.target.result;
//          img.onload = () => {
//            setImageMetadata({
//              width: img.width,
//              height: img.height,
//              size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
//              type: f.type
//            });
//          };
//        };
//        reader.readAsDataURL(f);
       
//        if(f.size > 100000000) return addToast("File too large (Max 100MB)", "error");
       
//        setUploadProgress(10);
//        addToast(preserveOriginal ? "Processing Original Quality..." : "Optimizing for Web...");
       
//        try {
//          setUploadProgress(50);
//          const b64 = await processFile(f, preserveOriginal);
//          setUploadProgress(90);
//          setNewImageUrl(b64);
//          setUploadProgress(100);
//          addToast("Ready to Upload");
//          setTimeout(() => setUploadProgress(0), 1000);
//        } catch (err) {
//          addToast("Processing Failed", "error");
//          setUploadProgress(0);
//        }
//     }
//   };
  

//   const deleteAsset = async (id) => {
//       if(confirm('Permanently delete this asset?')) {
//           const targetCollection = activeTab === 'gallery' ? COLL_GALLERY : COLL_HERO;
//           await deleteDoc(doc(db, targetCollection, id));
//           addToast("Asset Removed");
//       }
//   };

//   if (!isAuthenticated) {
//     return (
//       <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 font-serif relative overflow-hidden">
//         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#020202] to-[#020202]"></div>
//         <div className="bg-[#0a0a0a] border border-amber-900/20 p-12 rounded-2xl w-full max-w-sm text-center relative z-10 shadow-2xl shadow-amber-900/5">
//           <Gem className="w-12 h-12 text-amber-500 mx-auto mb-6" strokeWidth={1.5}/>
//           <h1 className="text-white text-3xl font-serif mb-2 tracking-tight">AuraPicx</h1>
//           <p className="text-amber-500/50 text-xs tracking-[0.3em] uppercase mb-8 font-sans">Executive Gateway</p>
//           <form onSubmit={handleLogin} className="space-y-6">
//             <input 
//                 type="password" 
//                 placeholder="PASSKEY" 
//                 value={pin} 
//                 onChange={e=>setPin(e.target.value)} 
//                 className="w-full bg-[#050505] border border-white/10 rounded-lg p-4 text-white text-center tracking-[0.5em] outline-none focus:border-amber-600 transition-all font-mono text-sm placeholder:tracking-normal placeholder:text-gray-800"
//             />
//             <button className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium p-4 rounded-lg transition-all tracking-widest text-xs uppercase shadow-lg shadow-amber-900/20">Enter Dashboard</button>
//           </form>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-[#020202] text-white flex font-sans selection:bg-amber-500/30 selection:text-amber-100">
//       <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
//          {toasts.map(t => (
//             <div key={t.id} className={`pointer-events-auto backdrop-blur-xl px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right border-l-2 ${t.type==='error' ? 'bg-red-950/90 border-red-500' : 'bg-zinc-900/90 border-amber-500'}`}>
//                <span className={`text-xs font-bold uppercase tracking-wider ${t.type==='error'?'text-red-400':'text-amber-400'}`}>{t.type === 'error' ? 'Error' : 'System'}</span>
//                <span className="text-sm text-gray-300">{t.msg}</span>
//             </div>
//          ))}
//       </div>

//       <aside className="w-80 border-r border-white/5 bg-[#050505] hidden md:flex flex-col sticky top-0 h-screen">
//         <div className="p-10 border-b border-white/5">
//             <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(217,119,6,0.2)]">
//                     <Gem size={20}/>
//                 </div>
//                 <div>
//                     <h1 className="font-serif text-2xl tracking-tight text-white">AuraPicx</h1>
//                     <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-bold">Admin Console</p>
//                 </div>
//             </div>
//         </div>
        
//         <div className="p-8 space-y-3 flex-1">
//           <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6 px-1">Navigation</div>
//           <button onClick={()=>setActiveTab('gallery')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-sm font-medium ${activeTab === 'gallery' ? 'bg-white/5 text-white border border-white/5 shadow-inner' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
//             <ImageIcon size={18}/> Global Gallery
//           </button>
//           <button onClick={()=>setActiveTab('hero')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-sm font-medium ${activeTab === 'hero' ? 'bg-amber-900/10 text-amber-500 border border-amber-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
//             <LayoutDashboard size={18}/> Hero Slider 
//             <span className="ml-auto text-[10px] bg-white/5 px-2 py-1 rounded-full">{heroImages.length}</span>
//           </button>
//         </div>

//         <div className="p-8 border-t border-white/5">
//             <a href="/" className="flex items-center gap-3 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest p-4 hover:bg-white/5 rounded-xl transition-all">
//                 <ArrowLeft size={16}/> Live Site
//             </a>
//         </div>
//       </aside>

//       <main className="flex-1 overflow-y-auto relative bg-[#020202]">
//         <header className="sticky top-0 z-30 bg-[#020202]/90 backdrop-blur-md border-b border-white/5 px-10 py-6 flex justify-between items-center">
//              <div className="flex items-center gap-6">
//                  <h2 className="text-xl font-serif text-white">{activeTab === 'gallery' ? 'Gallery Assets' : 'Hero Slider'}</h2>
//                  <div className="flex items-center gap-2 text-xs text-gray-500">
//                     <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> DB Connected
//                  </div>
//              </div>
//              <div className="flex items-center gap-6">
//                  <div className="relative group">
//                      <Search size={16} className="absolute left-4 top-3 text-gray-600 group-focus-within:text-amber-500 transition-colors"/>
//                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search assets..." className="bg-[#0a0a0a] border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-amber-900/50 w-72 transition-all text-gray-300 placeholder:text-gray-700"/>
//                  </div>
//              </div>
//         </header>

//         <div className="p-10 max-w-[1800px] mx-auto">
//             {/* Stats */}
//             <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
//                 <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
//                     <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Total Items</div>
//                     <div className="text-3xl font-serif text-white">{displayImages.length}</div>
//                 </div>
//                 <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
//                     <div className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-3">Categories</div>
//                     <div className="text-3xl font-serif text-white">{Object.keys(categories).length}</div>
//                 </div>
//                 <div className="bg-[#0a0a0a] border border-green-900/20 p-6 rounded-2xl relative overflow-hidden">
//                     <div className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Zap size={12}/> Real Interactions</div>
//                     <div className="text-3xl font-serif text-white">{totalRealLikes.toLocaleString()}</div>
//                 </div>
//                 <div className="bg-[#0a0a0a] border border-red-900/20 p-6 rounded-2xl">
//                     <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Heart size={12}/> Displayed Likes</div>
//                     <div className="text-3xl font-serif text-white">Global</div>
//                 </div>
//             </div>

//             {/* Editor */}
//             <div className={`rounded-2xl border p-8 mb-10 transition-all duration-500 ${editingId ? 'bg-amber-950/10 border-amber-500/30' : 'bg-[#0a0a0a] border-white/5'}`}>
//                 <div className="flex justify-between items-center mb-8">
//                     <h2 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-3 ${editingId ? 'text-amber-500' : 'text-gray-300'}`}>
//                         {editingId ? <Edit2 size={18}/> : <Upload size={18}/>}
//                         {editingId ? 'Updating Asset' : `Upload to ${activeTab === 'gallery' ? 'Gallery' : 'Hero Slider'}`}
//                     </h2>
//                     {editingId && (
//                         <button onClick={cancelEdit} className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest">Cancel</button>
//                     )}
//                 </div>

//                 <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
//                     <div className="lg:col-span-4">
//                         <div className={`aspect-square border border-dashed ${newImageUrl ? 'border-transparent' : 'border-white/10'} rounded-2xl bg-black/40 flex flex-col items-center justify-center relative overflow-hidden group transition-all`}>
//                             {newImageUrl ? (
//                                 <>
//                                     <img src={newImageUrl} className="w-full h-full object-contain z-10"/>
//                                     {uploadProgress > 0 && uploadProgress < 100 && (
//                                       <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
//                                         <div className="h-full bg-amber-600 transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
//                                       </div>
//                                     )}
//                                     {imageMetadata && (
//                                       <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg text-xs text-white font-mono">
//                                         <div className="flex gap-3">
//                                           <span>{imageMetadata.width}x{imageMetadata.height}</span>
//                                           <span>{imageMetadata.size}</span>
//                                           {preserveOriginal && <span className="text-green-400">ORIGINAL</span>}
//                                         </div>
//                                       </div>
//                                     )}
//                                     <button type="button" onClick={()=>{setNewImageUrl(''); setImageMetadata(null)}} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-colors z-20"><X size={14}/></button>
//                                 </>
//                             ) : (
//                                 <>
//                                     <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mb-4 text-gray-600 group-hover:text-amber-500 transition-colors"><Upload size={24}/></div>
//                                     <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Drag & Drop Image</p>
//                                     <p className="text-[10px] text-gray-600">Up to 100MB • All formats</p>
//                                     <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer"/>
//                                 </>
//                             )}
//                         </div>
                        
//                         <div className="mt-4 flex items-center gap-4">
//                           <label className="flex items-center gap-2 cursor-pointer">
//                             <input type="checkbox" checked={preserveOriginal} onChange={e=>setPreserveOriginal(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-600"/>
//                             <span className="text-xs text-gray-400">Preserve Original Quality (Recommended)</span>
//                           </label>
//                         </div>
//                     </div>

//                     <div className="lg:col-span-8 space-y-6">
//                         <div className="grid grid-cols-2 gap-6">
//                              <div className="col-span-2">
//                                 <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Asset Title</label>
//                                 <input placeholder={activeTab==='gallery' ? "e.g. Midnight Tokyo" : "e.g. Visuals for Modern Era"} value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg px-5 py-4 text-white focus:border-amber-700 outline-none transition-all placeholder:text-gray-800 text-sm font-medium"/>
//                              </div>
//                              <div>
//                                 <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Category</label>
//                                 {!isCustomCategory ? (
//                                     <div className="relative">
//                                         <select required value={newCategory} onChange={e=>e.target.value==='new'?setIsCustomCategory(true):setNewCategory(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg px-5 py-4 text-white appearance-none outline-none focus:border-amber-700 text-sm">
//                                             <option value="">Select...</option>
//                                             {Object.keys(categories).map(c=><option key={c} value={c}>{c}</option>)}
//                                             <option value="new" className="text-amber-500 font-bold">+ Create New</option>
//                                         </select>
//                                     </div>
//                                 ) : (
//                                     <div className="flex gap-2">
//                                         <input autoFocus placeholder="New Category" value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="w-full bg-[#050505] border border-amber-700 rounded-lg px-5 py-4 text-white outline-none text-sm"/>
//                                         <button type="button" onClick={()=>setIsCustomCategory(false)} className="px-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"><X/></button>
//                                     </div>
//                                 )}
//                              </div>
//                              <div>
//                                 <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Custom Display Likes (Red)</label>
//                                 <div className="relative">
//                                     <Heart size={16} className="absolute left-4 top-4 text-red-500 fill-red-500"/>
//                                     <input placeholder="e.g. 2.4M" value={customLikes} onChange={e=>setCustomLikes(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg pl-12 pr-5 py-4 text-red-400 font-bold font-mono outline-none focus:border-red-900 text-sm"/>
//                                 </div>
//                              </div>
//                         </div>
//                         <button disabled={isSubmitting} className={`w-full py-4 rounded-lg font-bold text-xs uppercase tracking-[0.2em] shadow-lg transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 ${activeTab === 'hero' ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white hover:brightness-110' : 'bg-white text-black hover:bg-gray-200'}`}>
//                             {isSubmitting ? 'Processing...' : (editingId ? 'Save Changes' : 'Publish Asset')}
//                         </button>
//                     </div>
//                 </form>
//             </div>

//             {/* Table */}
//             <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
//                 <table className="w-full text-left border-collapse">
//                     <thead>
//                         <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-white/5 bg-white/[0.02]">
//                             <th className="px-8 py-5">Preview</th>
//                             <th className="px-8 py-5">Metadata</th>
//                             <th className="px-8 py-5">Engagement</th>
//                             <th className="px-8 py-5 text-right">Actions</th>
//                         </tr>
//                     </thead>
//                     <tbody className="divide-y divide-white/5">
//                         {filteredImages.map(img => (
//                             <tr key={img.id} className={`group transition-colors ${editingId === img.id ? 'bg-amber-900/10' : 'hover:bg-white/[0.01]'}`}>
//                                 <td className="px-8 py-4">
//                                     <div className="relative w-24 h-16 rounded overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
//                                         <img src={img.url} className="w-full h-full object-cover"/>
//                                     </div>
//                                 </td>
//                                 <td className="px-8 py-4">
//                                     <div className="font-serif text-white text-lg mb-1">{img.title || 'Untitled'}</div>
//                                     <span className="text-[10px] font-bold bg-white/5 text-gray-400 px-2 py-1 rounded uppercase tracking-wide border border-white/5">
//                                         {img.category}
//                                     </span>
//                                 </td>
//                                 <td className="px-8 py-4">
//                                     <div className="flex flex-col gap-2 font-mono text-xs">
//                                         <div className="flex items-center gap-2 text-red-400 font-bold bg-red-950/20 px-2 py-1 rounded w-fit" title="Custom Display">
//                                             <Heart size={12} className="fill-red-400"/> {img.likes || '0'}
//                                         </div>
//                                         <div className="flex items-center gap-2 text-green-500 font-bold bg-green-950/20 px-2 py-1 rounded w-fit" title="Real Users">
//                                             <Zap size={12} className="fill-green-500"/> {img.realLikes || 0}
//                                         </div>
//                                     </div>
//                                 </td>
//                                 <td className="px-8 py-4 text-right">
//                                     <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
//                                         <button onClick={() => startEdit(img)} className="text-amber-500 hover:text-amber-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
//                                             Edit
//                                         </button>
//                                         <div className="w-px h-3 bg-white/10"></div>
//                                         <button onClick={() => deleteAsset(img.id)} className="text-red-700 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest">
//                                             Delete
//                                         </button>
//                                     </div>
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         </div>
//       </main>
//     </div>
//   );
// }





import React, { useState, useEffect, useMemo } from 'react';
import { auth, db, storage } from './firebase'; // Add storage import
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'; // Add these
import { 
  Shield, Upload, X, Image as ImageIcon,
  ArrowLeft, LayoutDashboard, Heart, CheckCircle, 
  Edit2, Search, Crown, Zap, Gem
} from 'lucide-react';

// Collections
const COLL_GALLERY = "aura_images";
const COLL_HERO = "aura_hero";

// --- UTILS ---
const compressImage = (file, maxWidth = 3840, quality = 0.9) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        
        if (w > maxWidth || h > maxWidth) {
          if (w > h) { h *= maxWidth/w; w = maxWidth; } 
          else { w *= maxWidth/h; h = maxWidth; }
        }
        
        canvas.width = w; 
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        
        canvas.toBlob(resolve, 'image/jpeg', quality);
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export default function AdminPanel() {
  const [user, setUser] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [heroImages, setHeroImages] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [toasts, setToasts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('gallery'); 
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [editingStoragePath, setEditingStoragePath] = useState(null); // Track storage path for editing
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState(null); // Store the actual file
  const [newCategory, setNewCategory] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [customLikes, setCustomLikes] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preserveOriginal, setPreserveOriginal] = useState(true);
  const [imageMetadata, setImageMetadata] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) signInAnonymously(auth);
      setUser(u);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLL_GALLERY), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setGalleryImages(data);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, COLL_HERO), (snap) => {
      const data = snap.docs.map(d => ({id: d.id, ...d.data()}));
      data.sort((a,b) => (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setHeroImages(data);
    });
    return () => unsub();
  }, []);

  const totalRealLikes = useMemo(() => {
    return galleryImages.reduce((acc, img) => acc + (img.realLikes || 0), 0);
  }, [galleryImages]);

  const categories = useMemo(() => {
    const stats = {};
    galleryImages.forEach(i => stats[i.category] = (stats[i.category]||0) + 1);
    return stats;
  }, [galleryImages]);

  const addToast = (msg, type='success') => {
    const id = Date.now();
    setToasts(p => [...p, {id, msg, type}]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  };

  const displayImages = activeTab === 'gallery' ? galleryImages : heroImages;
  const filteredImages = displayImages.filter(img => 
    (img.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (img.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLogin = (e) => {
    e.preventDefault();
    if(pin === 'Aura#2025') {
      setIsAuthenticated(true);
      addToast("Welcome, Executive");
    } else {
      addToast("Invalid Credentials", "error");
    }
  };

  const startEdit = (img) => {
    setEditingId(img.id);
    setEditingStoragePath(img.storagePath || null);
    setNewImageUrl(img.url);
    setNewImageFile(null); // Reset file when editing
    setNewCategory(img.category || '');
    setNewTitle(img.title || '');
    setCustomLikes(img.likes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast("Editing Asset");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingStoragePath(null);
    setNewImageUrl('');
    setNewImageFile(null);
    setNewCategory('');
    setNewTitle('');
    setCustomLikes('');
    setImageMetadata(null);
  };

  // Upload file to Firebase Storage
  const uploadToStorage = (file, onProgress) => {
    return new Promise(async (resolve, reject) => {
      try {
        let fileToUpload = file;
        
        // Compress if not preserving original and file is large
        if (!preserveOriginal && file.size > 2 * 1024 * 1024) {
          addToast("Compressing image...");
          fileToUpload = await compressImage(file);
        }
        
        const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        const folder = activeTab === 'gallery' ? 'gallery' : 'hero';
        const storageRef = ref(storage, `${folder}/${fileName}`);
        
        const uploadTask = uploadBytesResumable(storageRef, fileToUpload);
        
        uploadTask.on('state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            console.error('Upload error:', error);
            reject(error);
          },
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({
              url: downloadURL,
              storagePath: `${folder}/${fileName}`
            });
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  // Delete file from Firebase Storage
  const deleteFromStorage = async (storagePath) => {
    if (!storagePath) return;
    try {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting from storage:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newImageUrl && !newImageFile) return;
    setIsSubmitting(true);
    
    const targetCollection = activeTab === 'gallery' ? COLL_GALLERY : COLL_HERO;

    try {
      let imageUrl = newImageUrl;
      let storagePath = editingStoragePath;

      // If there's a new file to upload
      if (newImageFile) {
        addToast("Uploading to cloud storage...");
        
        // Delete old image if editing
        if (editingId && editingStoragePath) {
          await deleteFromStorage(editingStoragePath);
        }
        
        const uploadResult = await uploadToStorage(newImageFile, (progress) => {
          setUploadProgress(progress);
        });
        
        imageUrl = uploadResult.url;
        storagePath = uploadResult.storagePath;
      }

      const payload = {
        url: imageUrl,
        storagePath: storagePath || null,
        category: newCategory || 'Showcase', 
        title: newTitle || 'Untitled',
        likes: customLikes || '0', 
        updatedAt: serverTimestamp(),
        isOriginalQuality: preserveOriginal,
        metadata: imageMetadata
      };

      if (!editingId) {
        payload.createdAt = serverTimestamp();
        payload.realLikes = 0; 
      }

      if (editingId) {
        await updateDoc(doc(db, targetCollection, editingId), payload);
        addToast("Asset Updated");
        cancelEdit();
      } else {
        await addDoc(collection(db, targetCollection), payload);
        addToast(activeTab === 'gallery' ? "Added to Gallery" : "Added to Slider");
        setNewImageUrl('');
        setNewImageFile(null);
        setNewTitle('');
        setCustomLikes('');
        setImageMetadata(null);
      }
      
      setUploadProgress(0);
    } catch(e) { 
      console.error(e);
      addToast("Error uploading image: " + e.message, "error");
    }
    setIsSubmitting(false);
  };

  const handleFile = async (e) => {
    if (e.target.files?.[0]) {
      const f = e.target.files[0];
      
      // Increased limit since we're using Storage now
      if (f.size > 50 * 1024 * 1024) { // 50MB limit
        return addToast("File too large (Max 50MB)", "error");
      }
      
      // Get image metadata and preview
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          setImageMetadata({
            width: img.width,
            height: img.height,
            size: (f.size / (1024 * 1024)).toFixed(2) + ' MB',
            type: f.type
          });
        };
        // Set preview URL
        setNewImageUrl(event.target.result);
      };
      reader.readAsDataURL(f);
      
      // Store the file for later upload
      setNewImageFile(f);
      addToast("Image ready for upload");
    }
  };

  const deleteAsset = async (id) => {
    if (confirm('Permanently delete this asset?')) {
      const targetCollection = activeTab === 'gallery' ? COLL_GALLERY : COLL_HERO;
      const images = activeTab === 'gallery' ? galleryImages : heroImages;
      const imageToDelete = images.find(img => img.id === id);
      
      // Delete from Storage first
      if (imageToDelete?.storagePath) {
        await deleteFromStorage(imageToDelete.storagePath);
      }
      
      // Then delete from Firestore
      await deleteDoc(doc(db, targetCollection, id));
      addToast("Asset Removed");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#020202] flex items-center justify-center p-4 font-serif relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/10 via-[#020202] to-[#020202]"></div>
        <div className="bg-[#0a0a0a] border border-amber-900/20 p-12 rounded-2xl w-full max-w-sm text-center relative z-10 shadow-2xl shadow-amber-900/5">
          <Gem className="w-12 h-12 text-amber-500 mx-auto mb-6" strokeWidth={1.5}/>
          <h1 className="text-white text-3xl font-serif mb-2 tracking-tight">AuraPicx</h1>
          <p className="text-amber-500/50 text-xs tracking-[0.3em] uppercase mb-8 font-sans">Executive Gateway</p>
          <form onSubmit={handleLogin} className="space-y-6">
            <input 
              type="password" 
              placeholder="PASSKEY" 
              value={pin} 
              onChange={e=>setPin(e.target.value)} 
              className="w-full bg-[#050505] border border-white/10 rounded-lg p-4 text-white text-center tracking-[0.5em] outline-none focus:border-amber-600 transition-all font-mono text-sm placeholder:tracking-normal placeholder:text-gray-800"
            />
            <button className="w-full bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white font-medium p-4 rounded-lg transition-all tracking-widest text-xs uppercase shadow-lg shadow-amber-900/20">Enter Dashboard</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020202] text-white flex font-sans selection:bg-amber-500/30 selection:text-amber-100">
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className={`pointer-events-auto backdrop-blur-xl px-6 py-4 rounded-lg shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-right border-l-2 ${t.type==='error' ? 'bg-red-950/90 border-red-500' : 'bg-zinc-900/90 border-amber-500'}`}>
            <span className={`text-xs font-bold uppercase tracking-wider ${t.type==='error'?'text-red-400':'text-amber-400'}`}>{t.type === 'error' ? 'Error' : 'System'}</span>
            <span className="text-sm text-gray-300">{t.msg}</span>
          </div>
        ))}
      </div>

      <aside className="w-80 border-r border-white/5 bg-[#050505] hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-10 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-700 rounded-lg flex items-center justify-center text-white shadow-[0_0_20px_rgba(217,119,6,0.2)]">
              <Gem size={20}/>
            </div>
            <div>
              <h1 className="font-serif text-2xl tracking-tight text-white">AuraPicx</h1>
              <p className="text-[10px] text-amber-500/60 uppercase tracking-widest font-bold">Admin Console</p>
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-3 flex-1">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-6 px-1">Navigation</div>
          <button onClick={()=>setActiveTab('gallery')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-sm font-medium ${activeTab === 'gallery' ? 'bg-white/5 text-white border border-white/5 shadow-inner' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <ImageIcon size={18}/> Global Gallery
          </button>
          <button onClick={()=>setActiveTab('hero')} className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl transition-all text-sm font-medium ${activeTab === 'hero' ? 'bg-amber-900/10 text-amber-500 border border-amber-500/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}>
            <LayoutDashboard size={18}/> Hero Slider 
            <span className="ml-auto text-[10px] bg-white/5 px-2 py-1 rounded-full">{heroImages.length}</span>
          </button>
        </div>

        <div className="p-8 border-t border-white/5">
          <a href="/" className="flex items-center gap-3 text-gray-500 hover:text-white text-xs font-bold uppercase tracking-widest p-4 hover:bg-white/5 rounded-xl transition-all">
            <ArrowLeft size={16}/> Live Site
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto relative bg-[#020202]">
        <header className="sticky top-0 z-30 bg-[#020202]/90 backdrop-blur-md border-b border-white/5 px-10 py-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-serif text-white">{activeTab === 'gallery' ? 'Gallery Assets' : 'Hero Slider'}</h2>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Cloud Storage
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative group">
              <Search size={16} className="absolute left-4 top-3 text-gray-600 group-focus-within:text-amber-500 transition-colors"/>
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search assets..." className="bg-[#0a0a0a] border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-amber-900/50 w-72 transition-all text-gray-300 placeholder:text-gray-700"/>
            </div>
          </div>
        </header>

        <div className="p-10 max-w-[1800px] mx-auto">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-3">Total Items</div>
              <div className="text-3xl font-serif text-white">{displayImages.length}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-white/5 p-6 rounded-2xl">
              <div className="text-amber-600 text-[10px] font-bold uppercase tracking-widest mb-3">Categories</div>
              <div className="text-3xl font-serif text-white">{Object.keys(categories).length}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-green-900/20 p-6 rounded-2xl relative overflow-hidden">
              <div className="text-green-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Zap size={12}/> Real Interactions</div>
              <div className="text-3xl font-serif text-white">{totalRealLikes.toLocaleString()}</div>
            </div>
            <div className="bg-[#0a0a0a] border border-red-900/20 p-6 rounded-2xl">
              <div className="text-red-500 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2"><Heart size={12}/> Displayed Likes</div>
              <div className="text-3xl font-serif text-white">Global</div>
            </div>
          </div>

          {/* Editor */}
          <div className={`rounded-2xl border p-8 mb-10 transition-all duration-500 ${editingId ? 'bg-amber-950/10 border-amber-500/30' : 'bg-[#0a0a0a] border-white/5'}`}>
            <div className="flex justify-between items-center mb-8">
              <h2 className={`text-sm font-bold uppercase tracking-widest flex items-center gap-3 ${editingId ? 'text-amber-500' : 'text-gray-300'}`}>
                {editingId ? <Edit2 size={18}/> : <Upload size={18}/>}
                {editingId ? 'Updating Asset' : `Upload to ${activeTab === 'gallery' ? 'Gallery' : 'Hero Slider'}`}
              </h2>
              {editingId && (
                <button onClick={cancelEdit} className="text-xs text-red-500 hover:text-red-400 font-bold uppercase tracking-widest">Cancel</button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-12 gap-10">
              <div className="lg:col-span-4">
                <div className={`aspect-square border border-dashed ${newImageUrl ? 'border-transparent' : 'border-white/10'} rounded-2xl bg-black/40 flex flex-col items-center justify-center relative overflow-hidden group transition-all`}>
                  {newImageUrl ? (
                    <>
                      <img src={newImageUrl} className="w-full h-full object-contain z-10"/>
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50 z-20">
                          <div className="h-full bg-amber-600 transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                        </div>
                      )}
                      {imageMetadata && (
                        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-md px-3 py-2 rounded-lg text-xs text-white font-mono z-20">
                          <div className="flex gap-3">
                            <span>{imageMetadata.width}x{imageMetadata.height}</span>
                            <span>{imageMetadata.size}</span>
                            {preserveOriginal && <span className="text-green-400">ORIGINAL</span>}
                          </div>
                        </div>
                      )}
                      {newImageFile && (
                        <div className="absolute top-4 left-4 bg-amber-600/90 backdrop-blur-md px-3 py-1 rounded-full text-xs text-white font-bold z-20">
                          NEW FILE
                        </div>
                      )}
                      <button type="button" onClick={()=>{setNewImageUrl(''); setNewImageFile(null); setImageMetadata(null)}} className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-red-600 transition-colors z-20"><X size={14}/></button>
                    </>
                  ) : (
                    <>
                      <div className="w-16 h-16 bg-[#111] rounded-full flex items-center justify-center mb-4 text-gray-600 group-hover:text-amber-500 transition-colors"><Upload size={24}/></div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Drag & Drop Image</p>
                      <p className="text-[10px] text-gray-600">Up to 50MB • All formats</p>
                      <input type="file" accept="image/*" onChange={handleFile} className="absolute inset-0 opacity-0 cursor-pointer"/>
                    </>
                  )}
                </div>
                
                <div className="mt-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={preserveOriginal} onChange={e=>setPreserveOriginal(e.target.checked)} className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-600 focus:ring-amber-600"/>
                    <span className="text-xs text-gray-400">Preserve Original Quality</span>
                  </label>
                </div>
                
                {newImageFile && (
                  <div className="mt-3 p-3 bg-green-950/30 border border-green-900/30 rounded-lg">
                    <p className="text-xs text-green-400 font-medium">✓ File ready for cloud upload</p>
                    <p className="text-[10px] text-green-500/60 mt-1">Will be stored in Firebase Storage</p>
                  </div>
                )}
              </div>

              <div className="lg:col-span-8 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Asset Title</label>
                    <input placeholder={activeTab==='gallery' ? "e.g. Midnight Tokyo" : "e.g. Visuals for Modern Era"} value={newTitle} onChange={e=>setNewTitle(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg px-5 py-4 text-white focus:border-amber-700 outline-none transition-all placeholder:text-gray-800 text-sm font-medium"/>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Category</label>
                    {!isCustomCategory ? (
                      <div className="relative">
                        <select required value={newCategory} onChange={e=>e.target.value==='new'?setIsCustomCategory(true):setNewCategory(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg px-5 py-4 text-white appearance-none outline-none focus:border-amber-700 text-sm">
                          <option value="">Select...</option>
                          {Object.keys(categories).map(c=><option key={c} value={c}>{c}</option>)}
                          <option value="new" className="text-amber-500 font-bold">+ Create New</option>
                        </select>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input autoFocus placeholder="New Category" value={newCategory} onChange={e=>setNewCategory(e.target.value)} className="w-full bg-[#050505] border border-amber-700 rounded-lg px-5 py-4 text-white outline-none text-sm"/>
                        <button type="button" onClick={()=>setIsCustomCategory(false)} className="px-4 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10"><X/></button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block">Custom Display Likes (Red)</label>
                    <div className="relative">
                      <Heart size={16} className="absolute left-4 top-4 text-red-500 fill-red-500"/>
                      <input placeholder="e.g. 2.4M" value={customLikes} onChange={e=>setCustomLikes(e.target.value)} className="w-full bg-[#050505] border border-white/10 rounded-lg pl-12 pr-5 py-4 text-red-400 font-bold font-mono outline-none focus:border-red-900 text-sm"/>
                    </div>
                  </div>
                </div>
                <button disabled={isSubmitting || (!newImageUrl && !newImageFile)} className={`w-full py-4 rounded-lg font-bold text-xs uppercase tracking-[0.2em] shadow-lg transform active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === 'hero' ? 'bg-gradient-to-r from-amber-700 to-orange-700 text-white hover:brightness-110' : 'bg-white text-black hover:bg-gray-200'}`}>
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span> 
                      {uploadProgress > 0 ? `Uploading ${Math.round(uploadProgress)}%` : 'Processing...'}
                    </>
                  ) : (
                    editingId ? 'Save Changes' : 'Publish Asset'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-bold text-gray-500 uppercase border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-5">Preview</th>
                  <th className="px-8 py-5">Metadata</th>
                  <th className="px-8 py-5">Engagement</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredImages.map(img => (
                  <tr key={img.id} className={`group transition-colors ${editingId === img.id ? 'bg-amber-900/10' : 'hover:bg-white/[0.01]'}`}>
                    <td className="px-8 py-4">
                      <div className="relative w-24 h-16 rounded overflow-hidden border border-white/10 group-hover:border-white/30 transition-colors">
                        <img src={img.url} className="w-full h-full object-cover"/>
                        {img.storagePath && (
                          <div className="absolute bottom-0 right-0 bg-green-600 px-1 text-[8px] text-white font-bold">
                            CLOUD
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-4">
                      <div className="font-serif text-white text-lg mb-1">{img.title || 'Untitled'}</div>
                      <span className="text-[10px] font-bold bg-white/5 text-gray-400 px-2 py-1 rounded uppercase tracking-wide border border-white/5">
                        {img.category}
                      </span>
                    </td>
                    <td className="px-8 py-4">
                      <div className="flex flex-col gap-2 font-mono text-xs">
                        <div className="flex items-center gap-2 text-red-400 font-bold bg-red-950/20 px-2 py-1 rounded w-fit" title="Custom Display">
                          <Heart size={12} className="fill-red-400"/> {img.likes || '0'}
                        </div>
                        <div className="flex items-center gap-2 text-green-500 font-bold bg-green-950/20 px-2 py-1 rounded w-fit" title="Real Users">
                          <Zap size={12} className="fill-green-500"/> {img.realLikes || 0}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-4 text-right">
                      <div className="flex items-center justify-end gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => startEdit(img)} className="text-amber-500 hover:text-amber-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                          Edit
                        </button>
                        <div className="w-px h-3 bg-white/10"></div>
                        <button onClick={() => deleteAsset(img.id)} className="text-red-700 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}