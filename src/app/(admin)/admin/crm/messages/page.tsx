"use client";

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Send,
    Search,
    Users,
    UserCheck,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
    Plus,
    Trash2,
    Eye,
    Filter,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    Mail,
    Phone,
    AlertCircle,
    FileText,
    BarChart3,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

const statusColors: Record<string, string> = {
    'مسودة': 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
    'مرسلة': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
    'فشل': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30',
    'جزئية': 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
};

const statusDot: Record<string, string> = {
    'مسودة': 'bg-slate-400',
    'مرسلة': 'bg-emerald-500',
    'فشل': 'bg-rose-500',
    'جزئية': 'bg-amber-500',
};

const messageTypeLabels: Record<string, { label: string; color: string }> = {
    'فردية': { label: 'فردية', color: 'bg-blue-50 text-blue-600 border-blue-100' },
    'جماعية': { label: 'جماعية', color: 'bg-purple-50 text-purple-600 border-purple-100' },
    'مجموعة': { label: 'مجموعة', color: 'bg-teal-50 text-teal-600 border-teal-100' },
};

export default function MessagesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('الكل');

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingMessage, setViewingMessage] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    const [form, setForm] = useState({
        senderName: '',
        messageText: '',
        messageType: 'فردية',
        recipients: [] as string[],
        scheduledAt: '',
    });

    const [memberSearch, setMemberSearch] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) { router.push('/auth/login'); return; }
        setUser(currentUser);
        loadData();
    }, [router]);

    async function loadData() {
        setLoading(true);
        try {
            const [messagesData, membersData] = await Promise.all([
                db.getAll('smsMessages'),
                db.getAll('members')
            ]);
            setMessages(messagesData || []);
            setMembers(membersData || []);
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    }

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ senderName: '', messageText: '', messageType: 'فردية', recipients: [], scheduledAt: '' });
        setMemberSearch('');
        setShowModal(true);
    };

    const openViewModal = (msg: any) => {
        setViewingMessage(msg);
        setShowViewModal(true);
    };

    const toggleRecipient = (memberId: string) => {
        setForm(prev => ({
            ...prev,
            recipients: prev.recipients.includes(memberId)
                ? prev.recipients.filter(id => id !== memberId)
                : [...prev.recipients, memberId]
        }));
    };

    const selectAllMembers = () => {
        const activeMembers = members.filter(m => m.status === 'نشط');
        setForm(prev => ({ ...prev, recipients: activeMembers.map(m => m.id) }));
    };

    const handleSave = async (e: React.FormEvent, sendNow: boolean = false) => {
        e.preventDefault();
        if (!form.messageText.trim()) { alert('يرجى كتابة نص الرسالة'); return; }
        if (form.recipients.length === 0) { alert('يرجى اختيار مستلم واحد على الأقل'); return; }

        const data: any = {
            senderName: form.senderName || user?.name || '',
            messageText: form.messageText,
            messageType: form.messageType,
            recipients: form.recipients,
            recipientCount: form.recipients.length,
            status: sendNow ? 'مرسلة' : 'مسودة',
            sentCount: sendNow ? form.recipients.length : 0,
            failedCount: 0,
            createdBy: user?.name || '',
        };

        if (sendNow) {
            data.sentAt = new Date().toISOString();
        }
        if (form.scheduledAt) {
            data.scheduledAt = new Date(form.scheduledAt).toISOString();
        }

        try {
            if (editingItem) {
                await db.update('smsMessages', editingItem.id, data);
            } else {
                await db.add('smsMessages', data);
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            alert('حدث خطأ أثناء حفظ الرسالة');
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('smsMessages', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadData();
        }
    };

    const handleSendDraft = async (msg: any) => {
        await db.update('smsMessages', msg.id, {
            status: 'مرسلة',
            sentAt: new Date().toISOString(),
            sentCount: msg.recipientCount
        });
        loadData();
    };

    const filtered = messages
        .filter(m => filterStatus === 'الكل' || m.status === filterStatus)
        .filter(m =>
            m.messageText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.senderName?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedMessages = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.phone?.includes(memberSearch)
    );

    // Stats
    const totalSent = messages.filter(m => m.status === 'مرسلة').length;
    const totalDraft = messages.filter(m => m.status === 'مسودة').length;
    const totalFailed = messages.filter(m => m.status === 'فشل').length;
    const totalRecipients = messages.reduce((sum, m) => sum + (m.recipientCount || 0), 0);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">مركز الرسائل النصية</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إرسال رسائل SMS للأعضاء والمشتركين</p>
                    </div>
                </div>
                <button onClick={openCreateModal} className="bg-gradient-to-l from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5 active:scale-95">
                    <Plus className="w-4 h-4 icon-glow" />
                    <span>رسالة جديدة</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'إجمالي الرسائل', value: messages.length, icon: <Mail className="w-4 h-4" />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
                    { label: 'مرسلة بنجاح', value: totalSent, icon: <CheckCircle2 className="w-4 h-4 icon-glow" />, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                    { label: 'مسودات', value: totalDraft, icon: <FileText className="w-4 h-4 icon-glow" />, color: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/20' },
                    { label: 'إجمالي المستلمين', value: totalRecipients, icon: <Users className="w-4 h-4" />, color: 'from-purple-500 to-purple-600', shadow: 'shadow-purple-500/20' },
                ].map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md ${stat.shadow}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</div>
                            <div className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input type="text" placeholder="ابحث في الرسائل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all dark:text-white" />
                </div>
                <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    {['الكل', 'مسودة', 'مرسلة', 'فشل'].map(s => (
                        <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all border ${filterStatus === s ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-300 dark:border-slate-700 hover:border-blue-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>
                <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight">النتائج: <span className="text-blue-600">{filtered.length}</span></div>
                    <button onClick={loadData} className="p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-blue-600 transition-all">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-separate border-spacing-0">
                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-4 py-2.5 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">الرسالة</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">النوع</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">المستلمين</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">مرسلة</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">التاريخ</th>
                                <th className="px-4 py-2.5 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto opacity-30" /></td></tr>
                            ) : paginatedMessages.length > 0 ? (
                                paginatedMessages.map((msg) => (
                                    <tr key={msg.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all cursor-pointer">
                                        <td className="px-4 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center gap-3 max-w-sm">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                                                    <MessageSquare className="w-3.5 h-3.5" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors truncate">{msg.messageText?.substring(0, 50)}{msg.messageText?.length > 50 ? '...' : ''}</p>
                                                    <p className="text-[9px] font-bold text-gray-400 mt-0.5">بواسطة: {msg.senderName || msg.createdBy || '---'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black border ${messageTypeLabels[msg.messageType]?.color || 'bg-gray-50 text-gray-500 border-gray-300'}`}>{msg.messageType}</span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-1">
                                                <Users className="w-3 h-3 text-gray-400" />
                                                <span className="text-[10px] font-black text-gray-600 dark:text-slate-400">{msg.recipientCount || 0}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="text-[10px] font-black text-emerald-600">{msg.sentCount || 0}</span>
                                            {msg.failedCount > 0 && <span className="text-[10px] font-black text-rose-500 mx-1">/{msg.failedCount} فشل</span>}
                                        </td>
                                        <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${statusColors[msg.status] || statusColors['مسودة']}`}>
                                                <div className={`w-1 h-1 rounded-full ${statusDot[msg.status] || 'bg-gray-400'}`} />
                                                {msg.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-400 font-mono border-l border-gray-100/20 last:border-l-0">
                                            {msg.createdAt ? new Date(msg.createdAt).toLocaleDateString('ar-SA') : '---'}
                                        </td>
                                        <td className="px-4 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openViewModal(msg)} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="عرض">
                                                    <Eye className="w-3.5 h-3.5" />
                                                </button>
                                                {msg.status === 'مسودة' && (
                                                    <button onClick={() => handleSendDraft(msg)} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-all" title="إرسال الآن">
                                                        <Send className="w-3.5 h-3.5" />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(msg.id)} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="حذف">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs border-l border-gray-100/20 last:border-l-0">لا توجد رسائل حالياً</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-3 px-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">سجل الرسائل النصية</span>
                    <div className="flex items-center gap-1">
                        <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 disabled:opacity-20 hover:text-blue-600 transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === p ? 'bg-blue-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-400 hover:text-blue-600'}`}>{p}</button>
                        ))}
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 disabled:opacity-20 hover:text-blue-600 transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800 max-h-[90vh] flex flex-col">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-l from-blue-600 to-blue-700 p-5 flex items-center justify-between text-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><Send className="w-5 h-5 icon-glow" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">{editingItem ? 'تعديل الرسالة' : 'إنشاء رسالة جديدة'}</h3>
                                        <p className="text-[9px] text-blue-100 font-bold uppercase tracking-widest mt-0.5">إرسال رسالة نصية للأعضاء والمشتركين</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>

                            {/* Modal Body */}
                            <form onSubmit={(e) => handleSave(e, false)} className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">اسم المرسل</label>
                                        <input value={form.senderName} onChange={e => setForm({ ...form, senderName: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" placeholder="اسم النادي أو المرسل" />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">نوع الرسالة</label>
                                        <select value={form.messageType} onChange={e => setForm({ ...form, messageType: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all appearance-none cursor-pointer">
                                            <option value="فردية">فردية</option>
                                            <option value="جماعية">جماعية</option>
                                            <option value="مجموعة">مجموعة</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">نص الرسالة *</label>
                                    <textarea required value={form.messageText} onChange={e => setForm({ ...form, messageText: e.target.value })} rows={4} className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all resize-none leading-relaxed" placeholder="اكتب نص الرسالة هنا..." />
                                    <div className="text-[9px] font-bold text-gray-400 mt-1 text-left">{form.messageText.length} حرف</div>
                                </div>

                                {/* Recipients Section */}
                                <div className="border border-gray-300 dark:border-slate-800 rounded-2xl overflow-hidden">
                                    <div className="bg-slate-50/50 dark:bg-slate-800/30 p-3 flex items-center justify-between border-b border-gray-300 dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-blue-500" />
                                            <span className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase tracking-wider">المستلمين ({form.recipients.length})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button type="button" onClick={selectAllMembers} className="text-[9px] font-black text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-md hover:bg-blue-100 transition-colors">تحديد الكل</button>
                                            <button type="button" onClick={() => setForm({ ...form, recipients: [] })} className="text-[9px] font-black text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">مسح</button>
                                        </div>
                                    </div>
                                    <div className="p-2">
                                        <div className="relative mb-2">
                                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                                            <input type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="ابحث بالاسم أو الجوال..." className="w-full pr-8 pl-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all dark:text-white" />
                                        </div>
                                        <div className="max-h-36 overflow-y-auto space-y-0.5">
                                            {filteredMembers.map(m => (
                                                <label key={m.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-[10px] font-bold ${form.recipients.includes(m.id) ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>
                                                    <input type="checkbox" checked={form.recipients.includes(m.id)} onChange={() => toggleRecipient(m.id)} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3 h-3" />
                                                    <span className="flex-1 truncate">{m.name}</span>
                                                    <span className="text-[9px] font-mono text-gray-400 shrink-0">{m.phone}</span>
                                                </label>
                                            ))}
                                            {filteredMembers.length === 0 && <p className="text-center text-[10px] text-gray-400 py-4">لا يوجد أعضاء</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Schedule */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">جدولة الإرسال (اختياري)</label>
                                    <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all" />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                                    <button type="button" onClick={(e) => handleSave(e as any, true)} className="flex-1 py-3 bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-emerald-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4 icon-glow" /> إرسال الآن
                                    </button>
                                    <button type="submit" className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                        <FileText className="w-4 h-4 icon-glow" /> حفظ كمسودة
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* View Modal */}
            <AnimatePresence>
                {showViewModal && viewingMessage && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowViewModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                            <div className="bg-gradient-to-l from-blue-600 to-blue-700 p-5 flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Eye className="w-4 h-4 icon-glow" /></div>
                                    <h3 className="text-sm font-black">تفاصيل الرسالة</h3>
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                    <p className="text-xs font-bold text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{viewingMessage.messageText}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[10px]">
                                    <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="font-black text-gray-400 uppercase tracking-wider mb-1">المرسل</p>
                                        <p className="font-black text-gray-700 dark:text-white">{viewingMessage.senderName || viewingMessage.createdBy || '---'}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="font-black text-gray-400 uppercase tracking-wider mb-1">النوع</p>
                                        <p className="font-black text-gray-700 dark:text-white">{viewingMessage.messageType}</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="font-black text-gray-400 uppercase tracking-wider mb-1">المستلمين</p>
                                        <p className="font-black text-gray-700 dark:text-white">{viewingMessage.recipientCount || 0} مستلم</p>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="font-black text-gray-400 uppercase tracking-wider mb-1">الحالة</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${statusColors[viewingMessage.status]}`}>
                                            <div className={`w-1 h-1 rounded-full ${statusDot[viewingMessage.status]}`} />
                                            {viewingMessage.status}
                                        </span>
                                    </div>
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="w-full py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] hover:bg-gray-100 transition-all">إغلاق</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="حذف الرسالة" message="هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟" />
        </div>
    );
}
