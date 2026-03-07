"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Users,
    PlusCircle,
    Search,
    Download,
    UserCheck,
    Camera,
    Edit2,
    UserPlus,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Crown,
    X,
    Loader2,
    AlertTriangle,
    Upload,
    Check,
    Snowflake,
    Sun,
    Settings,
    MoreHorizontal,
    Phone,
    CreditCard,
    Shield,
    MapPin,
    Mail,
    Filter
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AddMemberModal } from '@/components/members/AddMemberModal';
import DeleteModal from '@/components/DeleteModal';

export default function MembersPage() {
    const router = useRouter();
    const [members, setMembers] = useState<any[]>([]);
    const [filteredMembers, setFilteredMembers] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Modals
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Camera state
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
    const [selectedCamera, setSelectedCamera] = useState('');

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        loadMembers();
    }, []);

    useEffect(() => {
        const filtered = members.filter(m => {
            const searchStr = `${m.name} ${m.phone} ${m.nationalId} ${m.membershipNumber}`.toLowerCase();
            return searchStr.includes(searchQuery.toLowerCase());
        });
        setFilteredMembers(filtered);
        setCurrentPage(1);
    }, [searchQuery, members]);

    async function loadMembers() {
        setLoading(true);
        try {
            const data = await db.getAll('members');
            setMembers(data || []);
        } catch (error) {
            console.error('Error loading members:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('members', deleteId);
            setMembers(prev => prev.filter(m => m.id !== deleteId));
            setIsDeleteModalOpen(false);
            setDeleteId(null);
        }
    };

    const handleEdit = (member: any) => {
        setSelectedMember(member);
        setIsEditModalOpen(true);
    };

    const handlePhotoAction = (member: any) => {
        setSelectedMember(member);
        setIsPhotoModalOpen(true);
        loadCameras();
    };

    const loadCameras = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter(d => d.kind === 'videoinput');
            setCameras(videoDevices);
            if (videoDevices.length > 0) setSelectedCamera(videoDevices[0].deviceId);
        } catch (error) {
            console.error('Error loading cameras:', error);
        }
    };

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: selectedCamera ? { deviceId: { exact: selectedCamera } } : true
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsCameraActive(true);
            }
        } catch (error) {
            console.error('Error starting camera:', error);
            alert('تعذر تشغيل الكاميرا');
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        setIsCameraActive(false);
    };

    const capturePhoto = async () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.drawImage(videoRef.current, 0, 0);
                const photoData = canvas.toDataURL('image/jpeg');
                await db.update('members', selectedMember.id, { photo: photoData });
                setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, photo: photoData } : m));
                stopCamera();
                setIsPhotoModalOpen(false);
            }
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = async () => {
                const photoData = reader.result as string;
                await db.update('members', selectedMember.id, { photo: photoData });
                setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, photo: photoData } : m));
                setIsPhotoModalOpen(false);
            };
            reader.readAsDataURL(file);
        }
    };

    const totalPages = Math.ceil(filteredMembers.length / pageSize);
    const currentMembers = filteredMembers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة أعضاء النادي</h1>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحكم كامل في قاعدة بيانات المشتركين</span>
                            <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                            <span className="text-[10px] font-black text-indigo-500">{filteredMembers.length} عضو متاح</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl shadow-sm transition-all border border-amber-100 dark:border-amber-900/30 group/btn active:scale-90">
                        <Download className="w-4 h-4 icon-glow" />
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة عضو جديد</span>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[280px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الجوال، أو رقم الهوية..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    <div className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        <Filter className="w-3 h-3" /> عرض:
                    </div>
                    <select
                        value={pageSize}
                        onChange={(e) => setPageSize(Number(e.target.value))}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                </div>
            </div>

            {/* Members Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-display-premium">
                        <thead className="table-header-premium">
                            <tr>
                                <th className="px-4 py-2 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">العضو</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">رقم الهوية</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">الجوال</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">الجنسية</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">العنوان</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">VIP</th>
                                <th className="px-4 py-2 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto opacity-30" />
                                    </td>
                                </tr>
                            ) : currentMembers.length > 0 ? (
                                currentMembers.map((m) => (
                                    <tr key={m.id} className="table-row-premium group">
                                        <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    {m.photo ? (
                                                        <img src={m.photo} className="w-8 h-8 rounded-xl object-cover ring-2 ring-gray-300 dark:ring-slate-800 shadow-sm" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-[10px] ring-2 ring-gray-300 dark:ring-slate-800">
                                                            {m.name.charAt(0)}
                                                        </div>
                                                    )}
                                                    {m.vip && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                                            <Crown className="w-1.5 h-1.5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black leading-tight transition-colors table-cell-premium">{m.name}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">#{m.membershipNumber || m.id.substring(0, 8)}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-center text-[11px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium whitespace-nowrap">{m.nationalId || '---'}</td>
                                        <td className="px-4 py-1.5 text-center text-[11px] font-black text-indigo-600 dark:text-indigo-400 font-sans tracking-wide border-l border-gray-100/20 last:border-l-0" dir="ltr">{m.phone}</td>
                                        <td className="px-4 py-1.5 text-center text-[10px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium opacity-70">{m.nationality || '---'}</td>
                                        <td className="px-4 py-1.5 text-center text-[10px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium max-w-[150px] truncate opacity-70">{m.address || '---'}</td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            {m.vip ? (
                                                <div className="w-4 h-4 bg-amber-50 dark:bg-amber-900/20 text-amber-500 rounded-full flex items-center justify-center mx-auto ring-1 ring-amber-100 dark:ring-amber-900/40">
                                                    <Check className="w-2.5 h-2.5" />
                                                </div>
                                            ) : (
                                                <div className="w-4 h-4 bg-gray-50 dark:bg-slate-800 text-gray-300 rounded-full flex items-center justify-center mx-auto opacity-30">
                                                    <X className="w-2.5 h-2.5" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <button onClick={() => handleEdit(m)}
                                                    className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90"
                                                    title="تعديل بيانات العضو">
                                                    <Edit2 className="w-4 h-4 icon-glow" />
                                                </button>
                                                <button onClick={() => handlePhotoAction(m)}
                                                    className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm transition-all border border-indigo-100 dark:border-indigo-900/30 group/btn active:scale-90"
                                                    title="تحديث صورة العضو">
                                                    <Camera className="w-4 h-4 icon-glow" />
                                                </button>
                                                <button onClick={() => router.push(`/admin/members/profile?id=${m.id}`)}
                                                    className="w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white rounded-xl shadow-sm transition-all border border-emerald-100 dark:border-emerald-900/30 group/btn active:scale-90"
                                                    title="تفاصيل الملف المشترك">
                                                    <Settings className="w-4 h-4 icon-glow" />
                                                </button>
                                                <button onClick={() => handleDelete(m.id)}
                                                    className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90"
                                                    title="حذف العضو">
                                                    <Trash2 className="w-4 h-4 icon-glow" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex flex-col items-center gap-2 opacity-30">
                                            <Search className="w-10 h-10" />
                                            <p className="text-xs font-black uppercase">لا توجد نتائج مطابقة</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-3 px-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">صفحة {currentPage} من {totalPages || 1}</span>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 disabled:opacity-20 transition-all"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                        <div className="flex gap-1">
                            {Array.from({ length: Math.min(3, totalPages) }).map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === i + 1 ? 'bg-indigo-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-500 hover:bg-gray-50'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 disabled:opacity-20 transition-all"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Photo Modal */}
            <AnimatePresence>
                {isPhotoModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isCameraActive && setIsPhotoModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-300 dark:border-slate-800 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">تحديث صورة العضو</h3>
                                <button onClick={() => { stopCamera(); setIsPhotoModalOpen(false); }} className="p-1 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            {isCameraActive ? (
                                <div className="space-y-4">
                                    <div className="relative rounded-2xl overflow-hidden bg-black aspect-square shadow-inner border-2 border-slate-300 dark:border-slate-800">
                                        <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
                                        <div className="absolute inset-x-0 bottom-4 flex justify-center">
                                            <button onClick={capturePhoto} className="w-12 h-12 bg-white rounded-full border-4 border-indigo-500 flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                                                <div className="w-8 h-8 bg-slate-50 rounded-full border border-slate-200" />
                                            </button>
                                        </div>
                                    </div>
                                    <button onClick={stopCamera} className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 text-gray-400 rounded-xl font-bold text-[11px]">الرجوع للخلف</button>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <button onClick={startCamera} className="w-full p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 flex items-center gap-4 hover:bg-indigo-50 transition-all text-right">
                                        <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-md"><Camera className="w-5 h-5" /></div>
                                        <div>
                                            <div className="text-xs font-black text-indigo-900 dark:text-indigo-300">التقاط عبر الكاميرا</div>
                                            <div className="text-[9px] font-bold text-indigo-600/60 mt-0.5">تصوير العضو بشكل مباشر</div>
                                        </div>
                                    </button>
                                    <label className="w-full p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center gap-4 hover:bg-slate-100 transition-all text-right cursor-pointer">
                                        <div className="w-10 h-10 bg-slate-600 text-white rounded-xl flex items-center justify-center shadow-md"><Upload className="w-5 h-5" /></div>
                                        <div>
                                            <div className="text-xs font-black text-slate-800 dark:text-slate-200">رفع من الجهاز</div>
                                            <div className="text-[9px] font-bold text-slate-500/60 mt-0.5">اختر صورة مخزنة مسبقاً</div>
                                        </div>
                                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                                    </label>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-300 dark:border-slate-800 flex flex-col">
                            <div className="p-5 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-indigo-600 text-white rounded-lg flex items-center justify-center"><Edit2 className="w-4 h-4 icon-glow" /></div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">تعديل بيانات العضو</h3>
                                        <p className="text-[10px] font-bold text-gray-400 mt-0.5">{selectedMember?.name}</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsEditModalOpen(false)} className="p-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-lg"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            <div className="p-6">
                                <form className="space-y-4" onSubmit={async (e) => {
                                    e.preventDefault();
                                    await db.update('members', selectedMember.id, selectedMember);
                                    setMembers(prev => prev.map(m => m.id === selectedMember.id ? selectedMember : m));
                                    setIsEditModalOpen(false);
                                }}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput className="md:col-span-2" label="الاسم بالكامل" icon={<Users className="w-3.5 h-3.5" />} value={selectedMember?.name} onChange={(val) => setSelectedMember({ ...selectedMember, name: val })} />
                                        <FormInput label="رقم الهوية" icon={<Shield className="w-3.5 h-3.5" />} value={selectedMember?.nationalId} onChange={(val) => setSelectedMember({ ...selectedMember, nationalId: val })} />
                                        <FormInput label="رقم الجوال" icon={<Phone className="w-3.5 h-3.5" />} value={selectedMember?.phone} onChange={(val) => setSelectedMember({ ...selectedMember, phone: val })} />
                                        <FormInput className="md:col-span-2" label="البريد الإلكتروني" icon={<Mail className="w-3.5 h-3.5" />} value={selectedMember?.email} onChange={(val) => setSelectedMember({ ...selectedMember, email: val })} />
                                        <FormInput className="md:col-span-2" label="العنوان" icon={<MapPin className="w-3.5 h-3.5" />} value={selectedMember?.address} onChange={(val) => setSelectedMember({ ...selectedMember, address: val })} />
                                    </div>

                                    <div className="flex items-center justify-between p-3.5 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 mt-2">
                                        <label className="flex items-center gap-3 cursor-pointer group">
                                            <div className={`w-10 h-6 rounded-full transition-all relative ${selectedMember?.vip ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
                                                <input type="checkbox" checked={!!selectedMember?.vip} onChange={(e) => setSelectedMember({ ...selectedMember, vip: e.target.checked })} className="hidden" />
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow-sm ${selectedMember?.vip ? 'right-5' : 'right-1'}`} />
                                            </div>
                                            <span className="text-[11px] font-black text-indigo-900 dark:text-indigo-300 uppercase tracking-tighter">الحالة VIP</span>
                                        </label>
                                        <div className="w-8 h-8 rounded-lg bg-amber-400 text-white flex items-center justify-center shadow-sm"><Crown className="w-4 h-4" /></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                                        <button
                                            type="button"
                                            onClick={async () => {
                                                const newStatus = selectedMember.status === 'مجمد' ? 'نشط' : 'مجمد';
                                                await db.update('members', selectedMember.id, { status: newStatus });
                                                setSelectedMember({ ...selectedMember, status: newStatus });
                                                setMembers(prev => prev.map(m => m.id === selectedMember.id ? { ...m, status: newStatus } : m));
                                            }}
                                            className={`py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border-2 border-dashed ${selectedMember?.status === 'مجمد' ? 'border-amber-200 text-amber-600 bg-amber-50/30' : 'border-slate-200 text-slate-400 bg-slate-50/30'}`}
                                        >
                                            {selectedMember?.status === 'مجمد' ? <Sun className="w-4 h-4" /> : <Snowflake className="w-4 h-4" />}
                                            {selectedMember?.status === 'مجمد' ? 'إلغاء التجميد' : 'تجميد العضوية'}
                                        </button>
                                        <button type="submit" className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98]">
                                            <Check className="w-4 h-4 icon-glow" /> حفظ البيانات
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <AddMemberModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    loadMembers();
                }}
            />

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف العضو"
                message="هل أنت متأكد من رغبتك في حذف هذا العضو نهائياً؟ سيؤدي ذلك لإزالة كافة بياناته واشتراكاته وسجلاته من النظام."
            />
        </div >
    );
}

function FormInput({ label, value, onChange, className, icon }: { label: string, value: string, onChange: (v: string) => void, className?: string, icon?: React.ReactNode }) {
    return (
        <div className={className}>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 mb-1.5 mr-1 uppercase tracking-widest">{label}</label>
            <div className="relative group">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                    {icon}
                </div>
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                />
            </div>
        </div>
    );
}
