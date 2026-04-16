'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    doc,
    serverTimestamp,
    arrayUnion
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
    Factory, ShieldCheck, Plus, X, CheckCircle2, Truck, Box, ChevronRight,
    ClipboardList, ArrowRight, RefreshCw, LayoutDashboard, LogOut, FileText,
    HardHat, PhoneCall, Star, MessageSquare, Send, Users, UserPlus, Wrench,
    Upload, Download, Eye, FileCode, AlertCircle, Lock, UserCheck,
    Image as ImageIcon, Layers, ShoppingBag
} from 'lucide-react';

const APP_ID = 'volthoist-africa';

export default function App() {
    const { user, profile, loading, logout } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [activeTab, setActiveTab] = useState('manufacturing');
    const [selectedProject, setSelectedProject] = useState(null);

    // Role Access - Robust parsing
    const rawRole = profile?.role || 'client';
    const userRole = String(rawRole).toLowerCase().trim();
    const isSuperUser = userRole === 'superuser' || userRole === 'admin';
    const isEngineer = userRole === 'engineer';
    const isClient = !isSuperUser && !isEngineer;

    // Real-world Data States
    const [allProjects, setAllProjects] = useState([]);
    const [allInspections, setAllInspections] = useState([]);
    const [teamMembers, setTeamMembers] = useState([]);
    const [showroomItems, setShowroomItems] = useState([]);
    const [messages, setMessages] = useState([]);

    // UI States
    const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
    const [isShowroomFormOpen, setIsShowroomFormOpen] = useState(false);
    const [isInspectionFormOpen, setIsInspectionFormOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [chatInput, setChatInput] = useState("");

    // Form States
    const [uploadData, setUploadData] = useState({ name: '', type: 'AutoCAD Drawing' });
    const [newProject, setNewProject] = useState({ name: '', siteLocation: '', specs: '' });
    const [newShowroomItem, setNewShowroomItem] = useState({ title: '', category: 'MCC Board', description: '' });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [newTeamMember, setNewTeamMember] = useState({ name: '', email: '', role: 'engineer' });
    const [newInspection, setNewInspection] = useState({ assetName: '', assetType: 'Overhead Crane', location: '' });

    useEffect(() => {
        setMounted(true);
    }, []);

    // REAL FIREBASE SYNC LOGIC
    useEffect(() => {
        if (!mounted || loading) return;

        // Strict Authentication Guard
        if (!user || user.isAnonymous) {
            router.push('/');
            return;
        }

        const unsubProjects = onSnapshot(collection(db, 'artifacts', APP_ID, 'public', 'data', 'projects'), (snapshot) => {
            const projects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAllProjects(projects);
            if (selectedProject) {
                const updated = projects.find(p => p.id === selectedProject?.id);
                if (updated) setSelectedProject(updated);
            }
        });

        const unsubShowroom = onSnapshot(collection(db, 'artifacts', APP_ID, 'public', 'data', 'showroom'), (snapshot) => {
            setShowroomItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubTeam = onSnapshot(collection(db, 'artifacts', APP_ID, 'public', 'data', 'team'), (snapshot) => {
            setTeamMembers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubInspections = onSnapshot(collection(db, 'artifacts', APP_ID, 'public', 'data', 'inspections'), (snapshot) => {
            setAllInspections(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        const unsubChat = onSnapshot(collection(db, 'artifacts', APP_ID, 'public', 'data', 'chat'), (snapshot) => {
            const sortedMsgs = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .sort((a, b) => (a.createdAt?.seconds || 0) - (b.createdAt?.seconds || 0));
            setMessages(sortedMsgs);
        });

        return () => {
            unsubProjects();
            unsubShowroom();
            unsubTeam();
            unsubInspections();
            unsubChat();
        };
    }, [user, loading, router, mounted, selectedProject?.id]);

    // Filters (Role Gating)
    const visibleProjects = allProjects.filter(p => {
        if (isSuperUser) return true;
        if (isEngineer) return p.assignedTo === user?.uid;
        return p.clientId === user?.uid;
    });

    const visibleInspections = allInspections.filter(i => {
        if (isSuperUser) return true;
        if (isEngineer) return i.assignedTo === user?.uid;
        return i.clientId === user?.uid;
    });

    // Action Handlers
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleAddShowroomItem = async (e) => {
        e.preventDefault();
        if (!isSuperUser) return;
        setIsSubmitting(true);
        try {
            let uploadedImageUrl = '';
            if (imageFile) {
                const storage = getStorage();
                const storageRef = ref(storage, `showroom/${Date.now()}_${imageFile.name}`);
                await uploadBytes(storageRef, imageFile);
                uploadedImageUrl = await getDownloadURL(storageRef);
            }

            await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'showroom'), {
                ...newShowroomItem,
                imageUrl: uploadedImageUrl,
                createdAt: serverTimestamp()
            });

            setIsShowroomFormOpen(false);
            setNewShowroomItem({ title: '', category: 'MCC Board', description: '' });
            setImageFile(null);
            setImagePreview('');
        } catch (err) {
            console.error(err);
            alert("Failed to upload to showroom. Check console.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCreateProject = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'projects'), {
                ...newProject,
                clientId: user.uid,
                clientName: profile?.companyName || 'Unknown Client',
                status: 'Pending Assignment',
                progress: 5,
                assignedTo: null,
                artifacts: [],
                createdAt: serverTimestamp()
            });
            setIsProjectFormOpen(false);
            setNewProject({ name: '', siteLocation: '', specs: '' });
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
    };

    const handleUploadArtifact = async (e) => {
        e.preventDefault();
        if (!selectedProject || !uploadData.name) return;
        setIsSubmitting(true);
        try {
            const newArtifact = {
                ...uploadData,
                uploadedBy: profile.username,
                uploadedAt: new Date().toISOString().split('T')[0],
                isFinal: false
            };
            await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'projects', selectedProject.id), {
                artifacts: arrayUnion(newArtifact),
                status: 'In Design Review'
            });
            setUploadData({ name: '', type: 'AutoCAD Drawing' });
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
    };

    const markAsFinal = async (artifactIndex) => {
        if (!isSuperUser) return;
        const updatedArtifacts = [...selectedProject.artifacts];
        updatedArtifacts[artifactIndex].isFinal = true;
        try {
            await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'projects', selectedProject.id), {
                artifacts: updatedArtifacts,
                status: 'Design Approved'
            });
        } catch (err) { console.error(err); }
    };

    const handleAssignProject = async (projectId, engineerId) => {
        if (!isSuperUser) return;
        try {
            await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'projects', projectId), {
                assignedTo: engineerId,
                status: 'Design Phase',
                progress: 15
            });
        } catch (err) { console.error(err); }
    };

    const handleUpdateStatus = async (projectId, newProgress, newStatus) => {
        if (!isSuperUser && !isEngineer) return;
        try {
            await updateDoc(doc(db, 'artifacts', APP_ID, 'public', 'data', 'projects', projectId), {
                progress: newProgress,
                status: newStatus
            });
        } catch (err) { console.error(err); }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        try {
            await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'chat'), {
                text: chatInput,
                senderId: user.uid,
                senderName: profile?.username || 'User',
                senderRole: userRole,
                createdAt: serverTimestamp()
            });
            setChatInput("");
        } catch (err) { console.error(err); }
    };

    const handleAddTeamMember = async (e) => {
        e.preventDefault();
        if (!isSuperUser) return;
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'team'), {
                ...newTeamMember,
                createdAt: serverTimestamp()
            });
            setNewTeamMember({ name: '', email: '', role: 'engineer' });
            alert("Added Team Member details to registry. They must sign up with this email.");
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
    };

    const handleBookInspection = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await addDoc(collection(db, 'artifacts', APP_ID, 'public', 'data', 'inspections'), {
                ...newInspection,
                clientId: user.uid,
                clientName: profile?.companyName || 'Unknown Client',
                status: 'Pending Scheduling',
                createdAt: serverTimestamp()
            });
            setIsInspectionFormOpen(false);
            setNewInspection({ assetName: '', assetType: 'Overhead Crane', location: '' });
        } catch (err) { console.error(err); } finally { setIsSubmitting(false); }
    };

    if (!mounted || loading || !user) {
        return (
            <div className="pt-40 flex flex-col items-center justify-center min-h-screen bg-slate-50">
                <RefreshCw className="w-14 h-14 text-blue-600 animate-spin mb-6" />
                <p className="text-slate-900 font-bold uppercase tracking-[0.2em] animate-pulse text-xs">Authenticating Hub Access</p>
            </div>
        );
    }

    return (
        <div className="pt-24 px-4 sm:px-6 max-w-7xl mx-auto text-slate-900 pb-32 font-sans min-h-screen">
            <div className="flex flex-col lg:flex-row gap-8 mt-8">

                {/* Sidebar Nav */}
                <div className="lg:w-1/4 space-y-6">
                    <div className={`rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden ${isSuperUser ? 'bg-slate-900' : isEngineer ? 'bg-slate-800' : 'bg-blue-900'}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                        <div className="relative z-10">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                                {isSuperUser ? <ClipboardList size={28} /> : isEngineer ? <Wrench size={28} /> : <Factory size={28} />}
                            </div>
                            <h2 className="text-xl font-black uppercase tracking-tight leading-none mb-2 truncate">{profile?.username}</h2>
                            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">{userRole} AUTHENTICATED</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-4 shadow-sm border border-slate-100 flex flex-col gap-2 font-bold text-xs uppercase tracking-widest">
                        <button onClick={() => { setActiveTab('manufacturing'); setSelectedProject(null); }} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'manufacturing' ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <Factory size={18} /> <span>Pipeline</span>
                        </button>
                        <button onClick={() => setActiveTab('showroom')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'showroom' ? 'bg-amber-50 text-amber-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <ImageIcon size={18} /> <span>Showroom Engine</span>
                        </button>
                        <button onClick={() => setActiveTab('compliance')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'compliance' ? 'bg-emerald-50 text-emerald-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <ShieldCheck size={18} /> <span>Vault</span>
                        </button>
                        <button onClick={() => setActiveTab('chat')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'chat' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                            <MessageSquare size={18} /> <span>Support</span>
                        </button>
                        {isSuperUser && (
                            <button onClick={() => setActiveTab('team')} className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all ${activeTab === 'team' ? 'bg-purple-50 text-purple-700' : 'text-slate-500 hover:bg-slate-50'}`}>
                                <Users size={18} /> <span>Team Admin</span>
                            </button>
                        )}
                        <div className="my-2 border-t border-slate-100"></div>
                        <button onClick={logout} className="w-full flex items-center space-x-4 px-6 py-4 rounded-2xl hover:bg-red-50 text-red-500">
                            <LogOut size={18} /> <span>Sign Out</span>
                        </button>
                    </div>
                </div>

                {/* Dynamic Content Area */}
                <div className="lg:w-3/4">

                    {/* View: Showroom Engine */}
                    {activeTab === 'showroom' && (
                        <div className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-slate-100 shadow-sm animate-in fade-in">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4 text-amber-950">
                                        <ShoppingBag className="text-amber-500 w-8 h-8" /> Catalog Manager
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">
                                        Items added here sync to the public website.
                                    </p>
                                </div>
                                {isSuperUser && (
                                    <button onClick={() => setIsShowroomFormOpen(true)} className="bg-amber-500 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition">
                                        <Plus size={18} /> <span>Add To Catalog</span>
                                    </button>
                                )}
                            </div>

                            {showroomItems.length === 0 ? (
                                <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-50">
                                    <ImageIcon size={48} className="mx-auto mb-4 text-slate-300" />
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Database is empty. Add items to populate site.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {showroomItems.map(item => (
                                        <div key={item.id} className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-xl transition-all group">
                                            <div className="h-56 bg-slate-200 relative overflow-hidden flex items-center justify-center">
                                                {item.imageUrl ? (
                                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                ) : (
                                                    <ImageIcon className="text-slate-400" size={40} />
                                                )}
                                                <span className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 shadow-sm">
                                                    {item.category}
                                                </span>
                                            </div>
                                            <div className="p-8">
                                                <h4 className="text-xl font-black uppercase tracking-tight text-slate-900 mb-2">{item.title}</h4>
                                                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">{item.description}</p>
                                                <div className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-center flex items-center justify-center gap-2">
                                                    <CheckCircle2 size={16} /> Synced to Website
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* View: Pipeline (Projects Overview) */}
                    {activeTab === 'manufacturing' && !selectedProject && (
                        <div className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-slate-100 shadow-sm animate-in fade-in">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                                        <Factory className="text-blue-600 w-8 h-8" /> Operational Pipeline
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">{isSuperUser ? 'HQ Overview' : isEngineer ? 'My Assignments' : 'Production Status'}</p>
                                </div>
                                {isClient && (
                                    <button onClick={() => setIsProjectFormOpen(true)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition">
                                        <Plus size={18} /> <span>New Build</span>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 gap-6">
                                {visibleProjects.length === 0 ? (
                                    <div className="py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-50 bg-slate-50/50">
                                        <Box className="mx-auto mb-4 text-slate-300" size={48} />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No active projects currently.</p>
                                    </div>
                                ) : (
                                    visibleProjects.map((project) => (
                                        <div key={project.id} onClick={() => setSelectedProject(project)} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 cursor-pointer hover:border-blue-400 hover:bg-white transition-all group shadow-sm">
                                            <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-2xl font-black uppercase tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">{project.name}</h4>
                                                        <ChevronRight className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                                                    </div>
                                                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{project.clientName} • {project.siteLocation}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {!project.assignedTo && isSuperUser && <span className="flex items-center gap-1 bg-red-100 text-red-600 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">Unassigned</span>}
                                                    <span className="bg-blue-600 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">{project.status}</span>
                                                </div>
                                            </div>
                                            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${project.progress || 0}%` }}></div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Detailed Design Hub / Technical Workbench */}
                    {activeTab === 'manufacturing' && selectedProject && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-900 transition bg-white px-4 py-2 rounded-xl border border-slate-100 shadow-sm">
                                <ChevronRight className="rotate-180" size={16} /> Back to Pipeline
                            </button>

                            <div className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-xl">
                                <div className="flex flex-col md:flex-row justify-between gap-8 mb-12 pb-8 border-b border-slate-100">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="bg-blue-600 p-2 rounded-xl text-white"><FileCode size={20} /></div>
                                            <h2 className="text-4xl font-black uppercase tracking-tighter text-slate-900 leading-none">{selectedProject.name}</h2>
                                        </div>
                                        <p className="text-slate-500 font-bold uppercase text-xs tracking-[0.2em]">{selectedProject.siteLocation} • ID: {selectedProject.id.substring(0, 8)}</p>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        {isSuperUser && (
                                            <div className="flex flex-col gap-2">
                                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Assign Engineer</label>
                                                <select
                                                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs font-bold outline-none hover:border-blue-500 transition"
                                                    value={selectedProject.assignedTo || ''}
                                                    onChange={(e) => handleAssignProject(selectedProject.id, e.target.value)}
                                                >
                                                    <option value="">-- Unassigned --</option>
                                                    {teamMembers.filter(m => m.role === 'engineer').map(eng => <option key={eng.id} value={eng.id}>{eng.name}</option>)}
                                                </select>
                                            </div>
                                        )}
                                        {(isSuperUser || isEngineer) && (
                                            <div className="flex gap-2 h-fit mt-auto pt-2 md:pt-0">
                                                <button onClick={() => handleUpdateStatus(selectedProject.id, 50, 'Manufacturing')} className="px-5 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition shadow-lg">Move to Factory</button>
                                                <button onClick={() => handleUpdateStatus(selectedProject.id, 100, 'Commissioned')} className="px-5 py-3 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition shadow-lg">Commission Site</button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                    {/* Documentation List */}
                                    <div className="space-y-8">
                                        <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                                            <FileText className="text-blue-600" /> Technical Documentation
                                        </h3>

                                        <div className="space-y-4">
                                            {selectedProject.artifacts?.filter(a => isClient ? a.isFinal : true).length > 0 ? (
                                                selectedProject.artifacts.filter(a => isClient ? a.isFinal : true).map((art, idx) => (
                                                    <div key={idx} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex items-center justify-between group hover:bg-white hover:border-blue-200 transition">
                                                        <div className="flex items-center gap-4">
                                                            <div className={`p-3 rounded-2xl ${art.isFinal ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                                                <FileText size={20} />
                                                            </div>
                                                            <div>
                                                                <div className="flex items-center gap-2">
                                                                    <p className="font-black text-sm uppercase tracking-tight">{art.name}</p>
                                                                    {art.isFinal && <span className="bg-emerald-500 text-white px-2 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest">Approved</span>}
                                                                </div>
                                                                <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">{art.type} • {art.uploadedBy}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {isSuperUser && !art.isFinal && (
                                                                <button onClick={() => markAsFinal(idx)} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition shadow-md" title="Approve for Client release">
                                                                    <CheckCircle2 size={16} />
                                                                </button>
                                                            )}
                                                            <button className="p-3 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-600 transition">
                                                                <Download size={16} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="py-20 text-center border-2 border-dashed border-slate-200 rounded-[3rem] opacity-50 bg-slate-50/50">
                                                    <AlertCircle className="mx-auto mb-4 text-slate-300" size={32} />
                                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Project currently has no <br />uploaded technical assets.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Engineering Workspace (Upload) */}
                                    {(isEngineer || isSuperUser) && (
                                        <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-200 h-fit shadow-inner">
                                            <div className="flex items-center gap-3 mb-8">
                                                <div className="bg-blue-600 p-2 rounded-xl text-white"><Upload size={18} /></div>
                                                <h3 className="text-xl font-black uppercase tracking-tight leading-none">Engineering Workbench</h3>
                                            </div>
                                            <form onSubmit={handleUploadArtifact} className="space-y-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Artifact Title</label>
                                                    <input required className="w-full bg-white p-5 rounded-2xl outline-none font-bold text-sm border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 transition-all" placeholder="e.g. Primary Circuit Diagram Rev1" value={uploadData.name} onChange={e => setUploadData({ ...uploadData, name: e.target.value })} />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Technical Class</label>
                                                    <select className="w-full bg-white p-5 rounded-2xl outline-none font-bold text-sm border border-slate-200 appearance-none focus:border-blue-600" value={uploadData.type} onChange={e => setUploadData({ ...uploadData, type: e.target.value })}>
                                                        <option>AutoCAD Drawing</option>
                                                        <option>Technical Quotation</option>
                                                        <option>ABB Component List</option>
                                                        <option>Compliance Certificate</option>
                                                    </select>
                                                </div>
                                                <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white py-6 rounded-[2rem] font-black uppercase tracking-widest hover:bg-slate-800 transition flex items-center justify-center gap-3 shadow-xl">
                                                    {isSubmitting ? <RefreshCw className="animate-spin" /> : <><Plus size={20} /> Post to Design Hub</>}
                                                </button>
                                            </form>
                                            <div className="mt-8 flex items-start gap-3 bg-amber-50 p-5 rounded-3xl border border-amber-100">
                                                <AlertCircle size={18} className="text-amber-600 mt-1 shrink-0" />
                                                <p className="text-[10px] font-bold text-amber-900 uppercase leading-relaxed">
                                                    Your uploads are initially marked as "Review Drafts". Eugene Jemwa will verify these assets before releasing them to the client's final portal.
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {isClient && (
                                        <div className="bg-blue-900 rounded-[2.5rem] p-10 text-white shadow-xl shadow-blue-900/20">
                                            <h3 className="text-xl font-black uppercase tracking-tight mb-6">Fulfillment Overview</h3>
                                            <p className="text-blue-200 text-sm mb-8 font-medium">Your design is currently being engineered by Eugene and Ryan. Finalized documents approved by the HQ team will appear here.</p>
                                            <div className="space-y-4">
                                                <div className="p-6 bg-white/5 border border-white/10 rounded-3xl flex items-center justify-between">
                                                    <div className="flex items-center gap-4">
                                                        <FileText className="text-blue-400" />
                                                        <span className="font-black uppercase tracking-tight text-xs italic">Awaiting Official Documentation</span>
                                                    </div>
                                                    <Lock size={18} className="opacity-30" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View: Vault */}
                    {activeTab === 'compliance' && (
                        <div className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-slate-100 shadow-sm animate-in fade-in">
                            <div className="flex justify-between items-center mb-12">
                                <div>
                                    <h3 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4 text-emerald-950">
                                        <ShieldCheck className="text-emerald-500 w-8 h-8" /> Vault Registry
                                    </h3>
                                    <p className="text-xs font-bold text-slate-400 uppercase mt-2 tracking-widest">Lifting Equipment Certificates</p>
                                </div>
                                {isClient && (
                                    <button onClick={() => setIsInspectionFormOpen(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center space-x-2 shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition">
                                        <Plus size={18} /> <span>Book Test</span>
                                    </button>
                                )}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {visibleInspections.length === 0 ? (
                                    <div className="col-span-full py-24 text-center border-2 border-dashed border-slate-100 rounded-[3rem] opacity-50 bg-slate-50/50">
                                        <HardHat size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="text-xs font-bold uppercase tracking-widest text-slate-400">No certificates currently registered.</p>
                                    </div>
                                ) : (
                                    visibleInspections.map(insp => (
                                        <div key={insp.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="p-3 bg-white rounded-2xl shadow-sm text-emerald-600"><FileText /></div>
                                                <span className="px-4 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-[9px] font-black uppercase tracking-widest">{insp.status}</span>
                                            </div>
                                            <h4 className="text-xl font-black uppercase tracking-tight text-slate-900">{insp.assetName}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{insp.assetType} • {insp.location}</p>
                                            <button className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition">View Certificate</button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* View: Chat */}
                    {activeTab === 'chat' && (
                        <div className="bg-white rounded-[3.5rem] p-8 md:p-12 border border-slate-100 shadow-sm animate-in fade-in h-[750px] flex flex-col">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-4 bg-indigo-100 text-indigo-600 rounded-2xl"><MessageSquare size={24} /></div>
                                <div>
                                    <h3 className="text-2xl font-black uppercase tracking-tight">Technical Direct-Link</h3>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Encrypted Engineering Channel</p>
                                </div>
                            </div>

                            <div className="flex-grow bg-slate-50 rounded-[2.5rem] mb-6 p-6 flex flex-col overflow-y-auto border border-slate-100 space-y-4">
                                {messages.length === 0 ? (
                                    <div className="my-auto text-center opacity-40">
                                        <UserCheck size={48} className="mx-auto mb-4 text-slate-300" />
                                        <p className="text-xs font-bold uppercase tracking-widest">Awaiting first message...</p>
                                    </div>
                                ) : (
                                    messages.map(msg => (
                                        <div key={msg.id} className={`max-w-[85%] p-5 rounded-3xl ${msg.senderId === user?.uid ? 'self-end bg-indigo-600 text-white shadow-lg' : 'self-start bg-white border border-slate-200 text-slate-900 shadow-sm'}`}>
                                            <div className="flex justify-between items-center gap-4 mb-2">
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${msg.senderId === user?.uid ? 'text-indigo-200' : 'text-slate-400'}`}>{msg.senderName} ({msg.senderRole})</span>
                                            </div>
                                            <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                        </div>
                                    ))
                                )}
                            </div>

                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <input
                                    className="flex-grow bg-slate-50 border border-slate-200 p-6 rounded-[2rem] outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-600 transition-all"
                                    placeholder="Ask a technical question..."
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                />
                                <button type="submit" className="bg-indigo-600 text-white px-8 rounded-[2rem] shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition">
                                    <Send size={24} />
                                </button>
                            </form>
                        </div>
                    )}

                    {/* View: Team Admin (HQ) */}
                    {activeTab === 'team' && isSuperUser && (
                        <div className="bg-white rounded-[3.5rem] p-12 border border-slate-100 shadow-sm animate-in fade-in">
                            <h3 className="text-3xl font-black uppercase tracking-tight mb-12 flex items-center gap-4 text-purple-950">
                                <Users className="text-purple-600 w-8 h-8" /> Regional Team Admin
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                                {teamMembers.map(m => (
                                    <div key={m.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-purple-300 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center font-black text-lg">{m.name[0]}</div>
                                            <div>
                                                <h4 className="font-black text-slate-900 uppercase tracking-tight">{m.name}</h4>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{m.role} • {m.email}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-purple-50 rounded-[3.5rem] p-10 border border-purple-100">
                                <h4 className="text-xl font-black uppercase tracking-tight text-purple-900 mb-8 flex items-center gap-3">
                                    <UserPlus className="text-purple-600" /> Invite Technical Staff
                                </h4>
                                <form onSubmit={handleAddTeamMember} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <input required className="w-full bg-white p-5 rounded-2xl outline-none font-bold text-sm border border-purple-100" placeholder="Staff Member Name" value={newTeamMember.name} onChange={e => setNewTeamMember({ ...newTeamMember, name: e.target.value })} />
                                        <input required className="w-full bg-white p-5 rounded-2xl outline-none font-bold text-sm border border-purple-100" placeholder="Email (Must use for signup)" type="email" value={newTeamMember.email} onChange={e => setNewTeamMember({ ...newTeamMember, email: e.target.value })} />
                                    </div>
                                    <select required className="w-full bg-white p-5 rounded-2xl outline-none font-bold text-sm border border-purple-100" value={newTeamMember.role} onChange={e => setNewTeamMember({ ...newTeamMember, role: e.target.value })}>
                                        <option value="engineer">Technical Engineer</option>
                                        <option value="superuser">Superuser (Admin)</option>
                                    </select>
                                    <button type="submit" disabled={isSubmitting} className="w-full bg-purple-600 text-white py-6 rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-purple-500/20 flex justify-center">
                                        {isSubmitting ? <RefreshCw className="animate-spin" /> : 'Authorize Account Email'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* MODAL: Add to Showroom (Superuser Only) */}
            {isShowroomFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 relative shadow-2xl animate-in zoom-in-95 my-auto mt-10 mb-10">
                        <button onClick={() => setIsShowroomFormOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-amber-950">Update Catalog</h3>
                        <p className="text-slate-500 text-sm font-medium mb-10 italic">Showcase new ABB components or completed MCC boards.</p>
                        <form onSubmit={handleAddShowroomItem} className="space-y-6">

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Product Image</label>
                                <div className="flex items-center justify-center w-full">
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-3xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {imagePreview ? (
                                                <img src={imagePreview} alt="Preview" className="h-40 object-contain rounded-xl shadow-sm" />
                                            ) : (
                                                <>
                                                    <Upload className="w-8 h-8 mb-3 text-slate-400" />
                                                    <p className="mb-2 text-sm text-slate-500 font-bold"><span className="text-blue-600">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-slate-400 font-medium">SVG, PNG, JPG or GIF</p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} required />
                                    </label>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Item Title</label>
                                    <input required className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none font-bold focus:border-amber-400 transition" placeholder="e.g. ABB Tmax XT5 630A" value={newShowroomItem.title} onChange={e => setNewShowroomItem({ ...newShowroomItem, title: e.target.value })} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Category</label>
                                    <select className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none font-bold text-slate-500 appearance-none focus:border-amber-400 transition" value={newShowroomItem.category} onChange={e => setNewShowroomItem({ ...newShowroomItem, category: e.target.value })}>
                                        <option value="MCC Board">MCC Board</option>
                                        <option value="Switchgear">Switchgear</option>
                                        <option value="Lifting Gear">Lifting Gear</option>
                                        <option value="Yellow Machine">Yellow Machine</option>
                                        <option value="VSD / Soft Starter">VSD / Soft Starter</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Technical Description</label>
                                <textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 p-5 rounded-2xl outline-none font-bold resize-none focus:border-amber-400 transition" placeholder="Technical Description & Benefits..." value={newShowroomItem.description} onChange={e => setNewShowroomItem({ ...newShowroomItem, description: e.target.value })} />
                            </div>

                            <button type="submit" disabled={isSubmitting || !imageFile} className="w-full bg-amber-500 text-white font-black py-6 rounded-3xl uppercase tracking-widest shadow-xl shadow-amber-500/20 hover:bg-amber-600 transition disabled:opacity-50">
                                {isSubmitting ? 'Uploading to Firebase...' : 'Publish to Catalog'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Request Project (Clients Only) */}
            {isProjectFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 relative shadow-2xl animate-in zoom-in-95 my-auto mt-10 mb-10">
                        <button onClick={() => setIsProjectFormOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4">Request Build</h3>
                        <p className="text-slate-500 text-sm font-medium mb-10 italic">Provide specs for a custom MCC or Distribution Board design.</p>
                        <form onSubmit={handleCreateProject} className="space-y-6">
                            <input required className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none font-bold" placeholder="Project Name" value={newProject.name} onChange={e => setNewProject({ ...newProject, name: e.target.value })} />
                            <input required className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none font-bold" placeholder="Site Location" value={newProject.siteLocation} onChange={e => setNewProject({ ...newProject, siteLocation: e.target.value })} />
                            <textarea required rows={4} className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none font-bold resize-none" placeholder="Technical Specs..." value={newProject.specs} onChange={e => setNewProject({ ...newProject, specs: e.target.value })} />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-black py-7 rounded-3xl uppercase tracking-widest shadow-2xl shadow-blue-500/30 flex justify-center">
                                {isSubmitting ? <RefreshCw className="animate-spin" /> : 'Submit Design Request'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: Book Inspection */}
            {isInspectionFormOpen && (
                <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white w-full max-w-2xl rounded-[3.5rem] p-10 relative shadow-2xl animate-in zoom-in-95 my-auto mt-10 mb-10">
                        <button onClick={() => setIsInspectionFormOpen(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-900"><X size={24} /></button>
                        <h3 className="text-4xl font-black uppercase tracking-tighter mb-4 text-emerald-950">Book Load Test</h3>
                        <p className="text-slate-500 text-sm font-medium mb-10 italic">Schedule a statutory inspection for lifting gear or yellow machines.</p>
                        <form onSubmit={handleBookInspection} className="space-y-6">
                            <input required className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none font-bold" placeholder="Asset Name / ID" value={newInspection.assetName} onChange={e => setNewInspection({ ...newInspection, assetName: e.target.value })} />
                            <select className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none font-bold text-slate-500 appearance-none" value={newInspection.assetType} onChange={e => setNewInspection({ ...newInspection, assetType: e.target.value })}>
                                <option value="Overhead Crane">Overhead Crane</option>
                                <option value="Chain Block">Chain Block</option>
                                <option value="Yellow Machine">Yellow Machine / Earthmover</option>
                            </select>
                            <input required className="w-full bg-slate-50 border border-slate-200 p-6 rounded-3xl outline-none font-bold" placeholder="Deployment Location" value={newInspection.location} onChange={e => setNewInspection({ ...newInspection, location: e.target.value })} />
                            <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-black py-7 rounded-3xl uppercase tracking-widest shadow-2xl shadow-emerald-500/30 flex justify-center">
                                {isSubmitting ? <RefreshCw className="animate-spin" /> : 'Request Inspection'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}