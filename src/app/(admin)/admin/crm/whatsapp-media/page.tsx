"use client";

import React, { useState, useEffect } from 'react';
import {
    Image,
    Video,
    FileText,
    Music,
    Plus,
    Search,
    Trash2,
    Loader2,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    Send,
    Clock,
    CheckCircle2,
    XCircle,
    Eye,
    Users,
    Filter,
    Upload,
    Link2,
    MessageCircle,
    Paperclip,
    Calendar,
    Save,
    Smartphone,
    Globe,
    Zap,
    BarChart3,
    Copy
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
    'مجدولة': 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
};

const statusDot: Record<string, string> = {
    'مسودة': 'bg-slate-400',
    'مرسلة': 'bg-emerald-500',
    'فشل': 'bg-rose-500',
    'جزئية': 'bg-amber-500',
    'مجدولة': 'bg-blue-500',
};

const mediaTypeConfig: Record<string, { label: string; icon: React.ReactNode; color: string; gradient: string }> = {
    'image': { label: 'صورة', icon: <Image className="w-4 h-4" />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100', gradient: 'from-indigo-500 to-indigo-600' },
    'video': { label: 'فيديو', icon: <Video className="w-4 h-4" />, color: 'bg-rose-50 text-rose-600 border-rose-100', gradient: 'from-rose-500 to-rose-600' },
    'document': { label: 'مستند', icon: <FileText className="w-4 h-4 icon-glow" />, color: 'bg-amber-50 text-amber-600 border-amber-100', gradient: 'from-amber-500 to-amber-600' },
    'audio': { label: 'صوتي', icon: <Music className="w-4 h-4" />, color: 'bg-violet-50 text-violet-600 border-violet-100', gradient: 'from-violet-500 to-violet-600' },
};

const recipientFilters: Record<string, { label: string; desc: string }> = {
    'الكل': { label: 'جميع الأعضاء', desc: 'إرسال لكل الأعضاء المسجلين' },
    'نشط': { label: 'اشتراكات نشطة', desc: 'أعضاء لديهم اشتراك فعال حالياً' },
    'منتهي': { label: 'اشتراكات منتهية', desc: 'أعضاء انتهى اشتراكهم' },
    'مخصص': { label: 'اختيار يدوي', desc: 'اختر أعضاء محددين' },
};

export default function WhatsAppMediaPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [mediaMessages, setMediaMessages] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('الكل');

    const [showModal, setShowModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [viewingMessage, setViewingMessage] = useState<any>(null);

    const [form, setForm] = useState({
        title: '',
        messageText: '',
        mediaType: 'image',
        mediaUrl: '',
        recipientFilter: 'الكل',
        recipients: [] as string[],
        scheduledAt: '',
    });

    const [memberSearch, setMemberSearch] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
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
            const [messagesData, membersData, subsData] = await Promise.all([
                db.getAll('whatsappMediaMessages'),
                db.getAll('members'),
                db.getAll('subscriptions')
            ]);
            setMediaMessages(messagesData || []);
            setMembers(membersData || []);
            setSubscriptions(subsData || []);
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    }

    const getFilteredRecipients = (filter: string): any[] => {
        if (filter === 'الكل') return members;
        if (filter === 'نشط') {
            const activeMemberIds = new Set(
                subscriptions
                    .filter(s => s.status === 'نشط' && new Date(s.endDate) >= new Date())
                    .map(s => s.memberId)
            );
            return members.filter(m => activeMemberIds.has(m.id));
        }
        if (filter === 'منتهي') {
            const activeMemberIds = new Set(
                subscriptions
                    .filter(s => s.status === 'نشط' && new Date(s.endDate) >= new Date())
                    .map(s => s.memberId)
            );
            return members.filter(m => !activeMemberIds.has(m.id));
        }
        return members;
    };

    const openCreateModal = () => {
        setForm({ title: '', messageText: '', mediaType: 'image', mediaUrl: '', recipientFilter: 'الكل', recipients: [], scheduledAt: '' });
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

    const handleFilterChange = (filter: string) => {
        setForm(prev => {
            const newFilter = filter;
            if (filter !== 'مخصص') {
                const filteredMembers = getFilteredRecipients(filter);
                return { ...prev, recipientFilter: newFilter, recipients: filteredMembers.map(m => m.id) };
            }
            return { ...prev, recipientFilter: newFilter, recipients: [] };
        });
    };

    const handleSave = async (e: React.FormEvent, sendNow: boolean = false) => {
        e.preventDefault();
        if (!form.title.trim()) { alert('يرجى إدخال عنوان الرسالة'); return; }
        if (!form.messageText.trim() && !form.mediaUrl.trim()) { alert('يرجى إدخال نص الرسالة أو رابط الوسائط'); return; }

        let recipientsList = form.recipients;
        if (form.recipientFilter !== 'مخصص') {
            recipientsList = getFilteredRecipients(form.recipientFilter).map(m => m.id);
        }

        if (recipientsList.length === 0) { alert('لا يوجد مستلمين'); return; }

        const data: any = {
            title: form.title,
            messageText: form.messageText,
            mediaType: form.mediaType,
            mediaUrl: form.mediaUrl,
            recipientFilter: form.recipientFilter,
            recipients: recipientsList,
            recipientCount: recipientsList.length,
            status: sendNow ? 'مرسلة' : (form.scheduledAt ? 'مجدولة' : 'مسودة'),
            sentCount: sendNow ? recipientsList.length : 0,
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
            await db.add('whatsappMediaMessages', data);
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
            await db.delete('whatsappMediaMessages', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadData();
        }
    };

    const handleSendDraft = async (msg: any) => {
        await db.update('whatsappMediaMessages', msg.id, {
            status: 'مرسلة',
            sentAt: new Date().toISOString(),
            sentCount: msg.recipientCount
        });
        loadData();
    };

    const filtered = mediaMessages
        .filter(m => filterStatus === 'الكل' || m.status === filterStatus)
        .filter(m =>
            m.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.messageText?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const paginatedMessages = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const filteredMembers = members.filter(m =>
        m.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.phone?.includes(memberSearch)
    );

    // Stats
    const totalSent = mediaMessages.filter(m => m.status === 'مرسلة').length;
    const totalScheduled = mediaMessages.filter(m => m.status === 'مجدولة').length;
    const totalRecipients = mediaMessages.reduce((sum, m) => sum + (m.recipientCount || 0), 0);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                            <Paperclip className="w-5 h-5" />
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                            <Image className="w-2 h-2 text-white" />
                        </div>
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">رسائل وسائط للواتس</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إرسال صور وفيديوهات ومستندات عبر واتساب</p>
                    </div>
                </div>
                <button onClick={openCreateModal} className="bg-gradient-to-l from-[#25D366] to-[#128C7E] hover:from-[#20bf5b] hover:to-[#0e7a6d] text-white px-4 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-green-500/20 transition-all flex items-center gap-1.5 active:scale-95">
                    <Plus className="w-4 h-4 icon-glow" />
                    <span>رسالة وسائط جديدة</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'إجمالي الرسائل', value: mediaMessages.length, icon: <Paperclip className="w-4 h-4" />, color: 'from-[#25D366] to-[#128C7E]', shadow: 'shadow-green-500/20' },
                    { label: 'مرسلة بنجاح', value: totalSent, icon: <CheckCircle2 className="w-4 h-4 icon-glow" />, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                    { label: 'مجدولة', value: totalScheduled, icon: <Calendar className="w-4 h-4" />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
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

            {/* Search & Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input type="text" placeholder="ابحث في الرسائل..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-green-500/30 transition-all dark:text-white" />
                </div>

                <div className="flex items-center gap-1.5">
                    <Filter className="w-3.5 h-3.5 text-gray-400" />
                    {['الكل', 'مسودة', 'مرسلة', 'مجدولة', 'فشل'].map(s => (
                        <button key={s} onClick={() => { setFilterStatus(s); setCurrentPage(1); }} className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all border ${filterStatus === s ? 'bg-[#25D366] text-white border-[#25D366] shadow-sm' : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-300 dark:border-slate-700 hover:border-green-200'}`}>
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight">النتائج: <span className="text-[#25D366]">{filtered.length}</span></div>
                    <button onClick={loadData} className="p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-[#25D366] transition-all">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Messages Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-separate border-spacing-0">
                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: bg-gradient-to-l from-[#128C7E] to-[#075E54] text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-4 py-2.5 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">الرسالة</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">الوسائط</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">التصنيف</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">المستلمين</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-4 py-2.5 text-center border-l border-white/5 last:border-l-0">التاريخ</th>
                                <th className="px-4 py-2.5 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto opacity-30" /></td></tr>
                            ) : paginatedMessages.length > 0 ? (
                                paginatedMessages.map(msg => {
                                    const media = mediaTypeConfig[msg.mediaType] || mediaTypeConfig['image'];
                                    return (
                                        <tr key={msg.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all cursor-pointer">
                                            <td className="px-4 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center gap-3 max-w-xs">
                                                    <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${media.gradient} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                                                        {media.icon}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[12px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors truncate">{msg.title}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 mt-0.5 truncate">{msg.messageText?.substring(0, 40)}{msg.messageText?.length > 40 ? '...' : ''}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black border ${media.color}`}>
                                                    {media.icon}
                                                    <span>{media.label}</span>
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className="text-[9px] font-black text-gray-500 bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-gray-300 dark:border-slate-700">{msg.recipientFilter || 'الكل'}</span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Users className="w-3 h-3 text-gray-400" />
                                                    <span className="text-[10px] font-black text-gray-600 dark:text-slate-400">{msg.recipientCount || 0}</span>
                                                </div>
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
                                                    <button onClick={() => openViewModal(msg)} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-[#25D366] hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all" title="عرض">
                                                        <Eye className="w-3.5 h-3.5" />
                                                    </button>
                                                    {(msg.status === 'مسودة' || msg.status === 'مجدولة') && (
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
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={7} className="py-24 text-center border-l border-gray-100/20 last:border-l-0">
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                            <Paperclip className="w-8 h-8 text-green-300" />
                                        </div>
                                        <p className="text-gray-300 dark:text-slate-600 italic text-xs">لا توجد رسائل وسائط حالياً</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-3 px-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">سجل رسائل الوسائط</span>
                    <div className="flex items-center gap-1">
                        <button disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)} className="p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 disabled:opacity-20 hover:text-green-600 transition-all"><ChevronRight className="w-3.5 h-3.5" /></button>
                        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                            <button key={p} onClick={() => setCurrentPage(p)} className={`w-7 h-7 rounded-lg text-[10px] font-black transition-all ${currentPage === p ? 'bg-[#25D366] text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-gray-400 hover:text-green-600'}`}>{p}</button>
                        ))}
                        <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-1.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 disabled:opacity-20 hover:text-green-600 transition-all"><ChevronLeft className="w-3.5 h-3.5" /></button>
                    </div>
                </div>
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800 max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-l from-[#25D366] to-[#128C7E] p-5 flex items-center justify-between text-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><Paperclip className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">رسالة وسائط جديدة</h3>
                                        <p className="text-[9px] text-green-100 font-bold uppercase tracking-widest mt-0.5">إرسال صور وفيديو ومستندات عبر واتساب</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>

                            {/* Body */}
                            <form onSubmit={(e) => handleSave(e, false)} className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">عنوان الرسالة *</label>
                                    <input required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all" placeholder="مثال: عرض خاص لشهر رمضان" />
                                </div>

                                {/* Media Type */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 pr-1">نوع الوسائط</label>
                                    <div className="grid grid-cols-4 gap-2">
                                        {Object.entries(mediaTypeConfig).map(([key, config]) => (
                                            <button key={key} type="button" onClick={() => setForm({ ...form, mediaType: key })} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-1.5 transition-all ${form.mediaType === key ? 'border-[#25D366] bg-green-50 dark:bg-green-900/20 text-[#128C7E] dark:text-green-400 shadow-sm' : 'border-gray-300 dark:border-slate-700 hover:border-green-200 text-gray-400'}`}>
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white shadow-sm`}>{config.icon}</div>
                                                <span className="text-[9px] font-black">{config.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Media URL */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">رابط الوسائط</label>
                                    <div className="relative">
                                        <Link2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300" />
                                        <input value={form.mediaUrl} onChange={e => setForm({ ...form, mediaUrl: e.target.value })} className="w-full pr-10 pl-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all font-mono" placeholder="https://example.com/image.jpg" />
                                    </div>
                                    <p className="text-[8px] font-bold text-gray-400 mt-1 pr-1">أدخل رابط URL مباشر للصورة أو الفيديو أو المستند</p>
                                </div>

                                {/* Message Text */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">نص الرسالة المرفق</label>
                                    <textarea value={form.messageText} onChange={e => setForm({ ...form, messageText: e.target.value })} rows={3} className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all resize-none leading-relaxed" placeholder="النص الذي سيظهر مع الوسائط..." />
                                </div>

                                {/* Recipient Filter */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-2 pr-1">فلتر المستلمين</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {Object.entries(recipientFilters).map(([key, config]) => (
                                            <button key={key} type="button" onClick={() => handleFilterChange(key)} className={`p-2.5 rounded-xl border-2 transition-all text-center ${form.recipientFilter === key ? 'border-[#25D366] bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-slate-700 hover:border-green-200'}`}>
                                                <p className={`text-[10px] font-black ${form.recipientFilter === key ? 'text-[#128C7E] dark:text-green-400' : 'text-gray-600 dark:text-slate-400'}`}>{config.label}</p>
                                                <p className="text-[8px] font-bold text-gray-400 mt-0.5">{config.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                    {form.recipientFilter !== 'مخصص' && (
                                        <div className="mt-2 bg-green-50/50 dark:bg-green-900/10 rounded-xl p-2.5 border border-green-100 dark:border-green-900/20 flex items-center gap-2">
                                            <Users className="w-3.5 h-3.5 text-green-600" />
                                            <span className="text-[10px] font-black text-green-700 dark:text-green-400">سيتم الإرسال لـ {getFilteredRecipients(form.recipientFilter).length} عضو</span>
                                        </div>
                                    )}
                                </div>

                                {/* Custom members selection */}
                                {form.recipientFilter === 'مخصص' && (
                                    <div className="border border-gray-300 dark:border-slate-800 rounded-2xl overflow-hidden">
                                        <div className="bg-slate-50/50 dark:bg-slate-800/30 p-3 flex items-center justify-between border-b border-gray-300 dark:border-slate-800">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-green-500" />
                                                <span className="text-[10px] font-black text-gray-600 dark:text-slate-400 uppercase tracking-wider">اختيار الأعضاء ({form.recipients.length})</span>
                                            </div>
                                            <button type="button" onClick={() => setForm({ ...form, recipients: [] })} className="text-[9px] font-black text-gray-400 bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">مسح</button>
                                        </div>
                                        <div className="p-2">
                                            <div className="relative mb-2">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3 h-3" />
                                                <input type="text" value={memberSearch} onChange={e => setMemberSearch(e.target.value)} placeholder="ابحث بالاسم أو الجوال..." className="w-full pr-8 pl-3 py-1.5 bg-white dark:bg-slate-900 rounded-lg text-[10px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-green-500/30 transition-all dark:text-white" />
                                            </div>
                                            <div className="max-h-36 overflow-y-auto space-y-0.5">
                                                {filteredMembers.map(m => (
                                                    <label key={m.id} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all text-[10px] font-bold ${form.recipients.includes(m.id) ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-600 dark:text-slate-400'}`}>
                                                        <input type="checkbox" checked={form.recipients.includes(m.id)} onChange={() => toggleRecipient(m.id)} className="rounded border-gray-300 text-green-600 focus:ring-green-500 w-3 h-3" />
                                                        <span className="flex-1 truncate">{m.name}</span>
                                                        <span className="text-[9px] font-mono text-gray-400 shrink-0">{m.phone}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule */}
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">جدولة الإرسال (اختياري)</label>
                                    <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm({ ...form, scheduledAt: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all" />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                                    <button type="button" onClick={(e) => handleSave(e as any, true)} className="flex-1 py-3 bg-gradient-to-l from-[#25D366] to-[#128C7E] hover:from-[#20bf5b] hover:to-[#0e7a6d] text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Send className="w-4 h-4 icon-glow" /> إرسال الآن
                                    </button>
                                    <button type="submit" className="flex-1 py-3 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> {form.scheduledAt ? 'جدولة' : 'حفظ كمسودة'}
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
                            <div className="bg-gradient-to-l from-[#25D366] to-[#128C7E] p-5 flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center"><Eye className="w-4 h-4 icon-glow" /></div>
                                    <h3 className="text-sm font-black">تفاصيل رسالة الوسائط</h3>
                                </div>
                                <button onClick={() => setShowViewModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white mb-2">{viewingMessage.title}</h4>
                                    {viewingMessage.mediaUrl && (
                                        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-3 flex items-center gap-2">
                                            <Link2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                            <a href={viewingMessage.mediaUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-blue-600 hover:underline truncate">{viewingMessage.mediaUrl}</a>
                                        </div>
                                    )}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                        <p className="text-xs font-bold text-gray-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{viewingMessage.messageText || 'بدون نص'}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-[10px]">
                                    <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="font-black text-gray-400 uppercase tracking-wider mb-1">نوع الوسائط</p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black border ${mediaTypeConfig[viewingMessage.mediaType]?.color || 'bg-gray-50 text-gray-500 border-gray-300'}`}>
                                            {mediaTypeConfig[viewingMessage.mediaType]?.label || viewingMessage.mediaType}
                                        </span>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="font-black text-gray-400 uppercase tracking-wider mb-1">التصنيف</p>
                                        <p className="font-black text-gray-700 dark:text-white">{viewingMessage.recipientFilter}</p>
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

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف رسالة الوسائط"
                message="هل أنت متأكد من رغبتك في حذف هذه الرسالة نهائياً؟"
                confirmText="نعم، حذف الرسالة"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
