"use client";

import React, { useState, useEffect } from 'react';
import {
    Smartphone,
    Plus,
    Search,
    Edit3,
    Trash2,
    Loader2,
    RefreshCw,
    ChevronRight,
    ChevronLeft,
    Zap,
    Clock,
    CheckCircle2,
    Power,
    PowerOff,
    MessageCircle,
    Bell,
    Gift,
    UserPlus,
    CalendarClock,
    Save,
    ToggleLeft,
    ToggleRight,
    Sparkles,
    Activity,
    Send
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

const triggerEvents: Record<string, { label: string; icon: React.ReactNode; color: string; desc: string }> = {
    'تسجيل_جديد': { label: 'تسجيل عضو جديد', icon: <UserPlus className="w-4 h-4 icon-glow" />, color: 'from-blue-500 to-blue-600', desc: 'يرسل تلقائياً عند تسجيل عضو جديد' },
    'تجديد_اشتراك': { label: 'تجديد الاشتراك', icon: <RefreshCw className="w-4 h-4" />, color: 'from-emerald-500 to-emerald-600', desc: 'يرسل عند تجديد اشتراك عضو' },
    'انتهاء_قريب': { label: 'انتهاء الاشتراك قريباً', icon: <Clock className="w-4 h-4 icon-glow" />, color: 'from-amber-500 to-amber-600', desc: 'تذكير قبل انتهاء الاشتراك' },
    'عيد_ميلاد': { label: 'عيد ميلاد العضو', icon: <Gift className="w-4 h-4" />, color: 'from-pink-500 to-pink-600', desc: 'تهنئة بعيد الميلاد' },
    'ترحيب': { label: 'رسالة ترحيبية', icon: <Sparkles className="w-4 h-4" />, color: 'from-indigo-500 to-indigo-600', desc: 'ترحيب عام بالعضو' },
    'تذكير_حضور': { label: 'تذكير بالحضور', icon: <Bell className="w-4 h-4" />, color: 'from-violet-500 to-violet-600', desc: 'تذكير العضو بالحضور' },
};

const templateVariables = [
    { var: '{اسم_العضو}', desc: 'اسم العضو' },
    { var: '{اسم_النادي}', desc: 'اسم النادي' },
    { var: '{تاريخ_الانتهاء}', desc: 'تاريخ انتهاء الاشتراك' },
    { var: '{نوع_الاشتراك}', desc: 'نوع الاشتراك' },
    { var: '{رقم_العضوية}', desc: 'رقم عضوية العضو' },
];

export default function WhatsAppAutoPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [autoMessages, setAutoMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        triggerEvent: 'تسجيل_جديد',
        messageTemplate: '',
        delayMinutes: 0,
        isActive: true,
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) { router.push('/auth/login'); return; }
        setUser(currentUser);
        loadData();
    }, [router]);

    async function loadData() {
        setLoading(true);
        try {
            const data = await db.getAll('whatsappAutoMessages');
            setAutoMessages(data || []);
        } catch (e) {
            console.error('Error loading data:', e);
        } finally {
            setLoading(false);
        }
    }

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({ name: '', triggerEvent: 'تسجيل_جديد', messageTemplate: '', delayMinutes: 0, isActive: true });
        setShowModal(true);
    };

    const openEditModal = (item: any) => {
        setEditingItem(item);
        setForm({
            name: item.name || '',
            triggerEvent: item.triggerEvent || 'تسجيل_جديد',
            messageTemplate: item.messageTemplate || '',
            delayMinutes: item.delayMinutes || 0,
            isActive: item.isActive !== false,
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name.trim() || !form.messageTemplate.trim()) {
            alert('يرجى تعبئة جميع الحقول المطلوبة');
            return;
        }

        const data = {
            name: form.name,
            triggerEvent: form.triggerEvent,
            messageTemplate: form.messageTemplate,
            delayMinutes: Number(form.delayMinutes) || 0,
            isActive: form.isActive,
        };

        try {
            if (editingItem) {
                await db.update('whatsappAutoMessages', editingItem.id, data);
            } else {
                await db.add('whatsappAutoMessages', { ...data, sentCount: 0 });
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const toggleActive = async (item: any) => {
        await db.update('whatsappAutoMessages', item.id, { isActive: !item.isActive });
        loadData();
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('whatsappAutoMessages', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadData();
        }
    };

    const insertVariable = (variable: string) => {
        setForm(prev => ({
            ...prev,
            messageTemplate: prev.messageTemplate + ' ' + variable
        }));
    };

    const filtered = autoMessages
        .filter(m =>
            m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            triggerEvents[m.triggerEvent]?.label?.includes(searchQuery)
        )
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const activeCount = autoMessages.filter(m => m.isActive).length;
    const totalSent = autoMessages.reduce((sum, m) => sum + (m.sentCount || 0), 0);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-500/20">
                        <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">واتساب آلي</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">رسائل واتساب تلقائية بناءً على أحداث النظام</p>
                    </div>
                </div>
                <button onClick={openCreateModal} className="bg-gradient-to-l from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-4 py-2.5 rounded-xl font-black text-[11px] shadow-lg shadow-green-500/20 transition-all flex items-center gap-1.5 active:scale-95">
                    <Plus className="w-4 h-4 icon-glow" />
                    <span>إضافة رسالة آلية</span>
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'إجمالي القوالب', value: autoMessages.length, icon: <MessageCircle className="w-4 h-4" />, color: 'from-green-500 to-green-600', shadow: 'shadow-green-500/20' },
                    { label: 'نشطة حالياً', value: activeCount, icon: <Zap className="w-4 h-4" />, color: 'from-emerald-500 to-emerald-600', shadow: 'shadow-emerald-500/20' },
                    { label: 'غير نشطة', value: autoMessages.length - activeCount, icon: <PowerOff className="w-4 h-4" />, color: 'from-slate-500 to-slate-600', shadow: 'shadow-slate-500/20' },
                    { label: 'إجمالي المرسل', value: totalSent, icon: <Send className="w-4 h-4 icon-glow" />, color: 'from-blue-500 to-blue-600', shadow: 'shadow-blue-500/20' },
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

            {/* Search */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[250px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input type="text" placeholder="ابحث في الرسائل الآلية..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-green-500/30 transition-all dark:text-white" />
                </div>
                <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-tight">النتائج: <span className="text-green-600">{filtered.length}</span></div>
                    <button onClick={loadData} className="p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-green-600 transition-all">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Auto Messages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading ? (
                    <div className="col-span-full py-20 text-center"><Loader2 className="w-8 h-8 animate-spin text-green-500 mx-auto opacity-30" /></div>
                ) : filtered.length > 0 ? (
                    filtered.map((msg) => {
                        const trigger = triggerEvents[msg.triggerEvent] || triggerEvents['ترحيب'];
                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border overflow-hidden transition-all hover:shadow-md ${msg.isActive ? 'border-green-100 dark:border-green-900/30' : 'border-gray-300 dark:border-slate-800 opacity-70'}`}
                            >
                                {/* Card Header */}
                                <div className={`bg-gradient-to-l ${trigger.color} p-4 flex items-center justify-between text-white`}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">{trigger.icon}</div>
                                        <div>
                                            <h3 className="text-[11px] font-black leading-tight">{msg.name}</h3>
                                            <p className="text-[8px] font-bold opacity-80 mt-0.5">{trigger.label}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleActive(msg)} className={`p-1.5 rounded-lg transition-all ${msg.isActive ? 'bg-white/20 hover:bg-white/30' : 'bg-black/10 hover:bg-black/20'}`} title={msg.isActive ? 'تعطيل' : 'تفعيل'}>
                                        {msg.isActive ? <Power className="w-4 h-4" /> : <PowerOff className="w-4 h-4" />}
                                    </button>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    <div className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3">
                                        <p className="text-[10px] font-bold text-gray-600 dark:text-slate-400 leading-relaxed line-clamp-3">{msg.messageTemplate}</p>
                                    </div>

                                    <div className="flex items-center justify-between text-[9px]">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="font-bold text-gray-500">تأخير: {msg.delayMinutes || 0} دقيقة</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Send className="w-3 h-3 text-gray-400" />
                                                <span className="font-bold text-gray-500">أرسلت: {msg.sentCount || 0}</span>
                                            </div>
                                        </div>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black border ${msg.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30' : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700'}`}>
                                            <div className={`w-1 h-1 rounded-full ${msg.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                                            {msg.isActive ? 'نشط' : 'معطل'}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-slate-800">
                                        <button onClick={() => openEditModal(msg)} className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all">
                                            <Edit3 className="w-3 h-3 icon-glow" /> تعديل
                                        </button>
                                        <button onClick={() => handleDelete(msg.id)} className="flex-1 py-2 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-[10px] font-black flex items-center justify-center gap-1.5 transition-all">
                                            <Trash2 className="w-3 h-3 icon-glow" /> حذف
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="col-span-full py-24 text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                            <Smartphone className="w-8 h-8 text-green-300" />
                        </div>
                        <p className="text-gray-300 italic text-xs">لا توجد رسائل آلية - قم بإنشاء أول رسالة</p>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800 max-h-[90vh] flex flex-col">
                            {/* Header */}
                            <div className="bg-gradient-to-l from-green-600 to-green-700 p-5 flex items-center justify-between text-white shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><Zap className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">{editingItem ? 'تعديل الرسالة الآلية' : 'إنشاء رسالة آلية جديدة'}</h3>
                                        <p className="text-[9px] text-green-100 font-bold uppercase tracking-widest mt-0.5">إعداد رسالة واتساب تلقائية</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>

                            {/* Body */}
                            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">اسم الرسالة الآلية *</label>
                                    <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all" placeholder="مثال: ترحيب بالعضو الجديد" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">الحدث المحفز *</label>
                                        <select required value={form.triggerEvent} onChange={e => setForm({ ...form, triggerEvent: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all appearance-none cursor-pointer">
                                            {Object.entries(triggerEvents).map(([key, val]) => (
                                                <option key={key} value={key}>{val.label}</option>
                                            ))}
                                        </select>
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 pr-1">{triggerEvents[form.triggerEvent]?.desc}</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">تأخير الإرسال (بالدقائق)</label>
                                        <input type="number" min="0" value={form.delayMinutes} onChange={e => setForm({ ...form, delayMinutes: Number(e.target.value) })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all font-mono" placeholder="0" />
                                        <p className="text-[8px] font-bold text-gray-400 mt-1 pr-1">0 = إرسال فوري</p>
                                    </div>
                                </div>

                                {/* Template Variables */}
                                <div className="bg-green-50/50 dark:bg-green-900/10 rounded-xl p-3 border border-green-100 dark:border-green-900/20">
                                    <p className="text-[9px] font-black text-green-700 dark:text-green-400 uppercase tracking-wider mb-2">متغيرات القالب (اضغط للإضافة)</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {templateVariables.map(v => (
                                            <button key={v.var} type="button" onClick={() => insertVariable(v.var)} className="px-2 py-1 bg-white dark:bg-slate-900 border border-green-200 dark:border-green-900/30 rounded-lg text-[9px] font-black text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/20 transition-all" title={v.desc}>
                                                {v.var}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">قالب الرسالة *</label>
                                    <textarea required value={form.messageTemplate} onChange={e => setForm({ ...form, messageTemplate: e.target.value })} rows={5} className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white focus:ring-2 focus:ring-green-500/30 outline-none transition-all resize-none leading-relaxed" placeholder="مرحباً {اسم_العضو}، أهلاً بك في {اسم_النادي}! ..." />
                                </div>

                                {/* Active Toggle */}
                                <div className="flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-3 border border-gray-300 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <Activity className="w-4 h-4 text-green-500" />
                                        <span className="text-[10px] font-black text-gray-600 dark:text-slate-400">تفعيل الإرسال الآلي</span>
                                    </div>
                                    <button type="button" onClick={() => setForm({ ...form, isActive: !form.isActive })} className="transition-all">
                                        {form.isActive ? (
                                            <ToggleRight className="w-8 h-8 text-green-500" />
                                        ) : (
                                            <ToggleLeft className="w-8 h-8 text-gray-300" />
                                        )}
                                    </button>
                                </div>

                                {/* Save */}
                                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                                    <button type="submit" className="flex-1 py-3 bg-gradient-to-l from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-green-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ القالب
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all">إغلاق</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} title="حذف الرسالة الآلية" message="هل أنت متأكد من رغبتك في حذف هذا القالب؟ سيتوقف الإرسال الآلي لهذا الحدث." />
        </div>
    );
}
