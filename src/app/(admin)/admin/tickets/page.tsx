"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Ticket,
    Search,
    PlusCircle,
    Download,
    Calendar,
    Filter,
    MoreHorizontal,
    TrendingUp,
    CreditCard,
    User,
    Phone,
    Loader2,
    RefreshCw,
    X,
    FilterX,
    Trash2,
    ArrowUpRight,
    Activity,
    Printer,
    Edit3,
    CheckCircle2,
    Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User as AuthUser } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

// Component for the printable ticket
const PrintableTicket = React.forwardRef(({ ticket, clubProfile }: any, ref: any) => {
    if (!ticket) return null;
    return (
        <div ref={ref} className="bg-white p-6 w-[80mm] mx-auto text-black font-sans leading-tight print:block hidden" dir="rtl">
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
                <div className="flex flex-col items-center gap-2 mb-3">
                    {clubProfile?.logoUrl || clubProfile?.logo_url ? (
                        <img src={clubProfile.logoUrl || clubProfile.logo_url} alt="Logo" className="w-16 h-16 object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-indigo-200">
                            <Ticket className="w-8 h-8" />
                        </div>
                    )}
                    <div>
                        <div className="font-black text-sm">{clubProfile?.nameAr || clubProfile?.name_ar || 'النادي الرياضي'}</div>
                        {clubProfile?.nameEn && <div className="font-bold text-[10px] text-gray-400 mt-0.5">{clubProfile.nameEn}</div>}
                    </div>
                </div>
                <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest bg-gray-50 py-1 rounded-md">تذكرة دخول يومية</div>
            </div>

            <div className="space-y-2 py-1 mb-4">
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-400">رقم التذكرة:</span>
                    <span className="font-black font-mono">#{ticket.id?.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-400">اسم العميل:</span>
                    <span className="font-black">{ticket.memberName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-400">نوع التذكرة:</span>
                    <span className="font-black text-indigo-600">{ticket.typeName}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-400">التاريخ:</span>
                    <span className="font-black font-mono">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-gray-400">الوقت:</span>
                    <span className="font-black font-mono">{new Date(ticket.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>

            <div className="text-center mb-5 bg-slate-50 p-4 rounded-2xl border border-gray-300">
                <div className="text-[9px] font-bold text-gray-400 uppercase mb-1">المبلغ الإجمالي</div>
                <div className="text-xl font-black">{Number(ticket.price).toLocaleString()} <small className="text-xs font-bold opacity-50">SAR</small></div>
            </div>

            <div className="text-[9px] text-center text-gray-400 font-bold space-y-1 border-t border-dashed border-gray-200 pt-3 mb-4">
                {clubProfile?.address && <div>{clubProfile.address}</div>}
                {clubProfile?.phone && <div>الهاتف: {clubProfile.phone}</div>}
                {clubProfile?.taxNumber && <div>الرقم الضريبي: {clubProfile.taxNumber}</div>}
            </div>

            <div className="text-center">
                <div className="inline-block p-1 bg-white rounded-lg mb-2 border border-gray-300">
                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center text-[8px] text-gray-300 italic">QR CODE</div>
                </div>
                <p className="text-[8px] font-bold text-gray-400 leading-relaxed italic">نتمنى لك وقتاً ممتعاً. نرجو الاحتفاظ بالتذكرة.</p>
            </div>

            <style jsx global>{`
                @media print {
                    @page { margin: 0; size: 80mm auto; }
                    body { margin: 0; padding: 0; background: white !important; }
                    .no-print, .print-hidden, nav, header, aside { display: none !important; }
                    .print\:block { display: block !important; }
                }
            `}</style>
        </div>
    );
});

export default function DailyTicketsPage() {
    const router = useRouter();
    const printRef = useRef<any>(null);
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [tickets, setTickets] = useState<any[]>([]);
    const [ticketTypes, setTicketTypes] = useState<any[]>([]);
    const [clubs, setClubs] = useState<any[]>([]);
    const [currentClub, setCurrentClub] = useState<any>(null);
    const [clubProfile, setClubProfile] = useState<any>(null);
    const [clubSettings, setClubSettings] = useState<any>(null);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [clubFilter, setClubFilter] = useState('');
    const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

    // Modals
    const [showSaleModal, setShowSaleModal] = useState(false);
    const [editingTicket, setEditingTicket] = useState<any>(null);
    const [selectedForPrint, setSelectedForPrint] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [form, setForm] = useState({
        memberName: '',
        phone: '',
        ticketTypeId: '',
        price: '',
        paymentMethod: 'نقدي',
        notes: ''
    });

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadData();
    }, [router]);

    async function loadData() {
        setLoading(true);
        try {
            const [allTickets, allTypes, allClubs, allProfiles, allSettings] = await Promise.all([
                db.getAll('dailyTickets'),
                db.getAll('dailyTicketTypes'),
                db.getAll('clubs'),
                db.getAll('club_profiles'),
                db.getAll('club_settings')
            ]);

            setTicketTypes(allTypes.filter((t: any) => t.isActive) || []);
            setClubs(allClubs || []);

            const clubId = user?.clubId || (user as any)?.club_id;
            const currentUserClub = allClubs.find((c: any) => c.id === clubId);
            setCurrentClub(currentUserClub);

            const myProfile = allProfiles?.find((p: any) => p.clubId === clubId);
            setClubProfile(myProfile || null);

            const mySettings = allSettings?.find((s: any) => s.clubId === clubId || s.club_id === clubId);
            setClubSettings(mySettings || null);

            const mapped = (allTickets || []).map((t: any) => {
                const type = allTypes.find((tp: any) => tp.id === t.ticketTypeId);
                const club = allClubs.find((c: any) => c.id === t.clubId);
                return {
                    ...t,
                    typeName: type?.name || 'نوع محذوف',
                    clubName: club?.name || '---'
                };
            }).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setTickets(mapped);
        } catch (error) {
            console.error("Error loading tickets:", error);
        } finally {
            setLoading(false);
        }
    }

    const filteredTickets = tickets.filter(t => {
        const matchesSearch = t.memberName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.phone?.includes(searchQuery);
        const matchesClub = !clubFilter || t.clubId === clubFilter;
        const matchesDate = !dateFilter || t.createdAt?.startsWith(dateFilter);
        return matchesSearch && matchesClub && matchesDate;
    });

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        const data = {
            ...form,
            price: Number(form.price),
            clubId: user.clubId || (user as any).club_id,
            createdAt: editingTicket ? editingTicket.createdAt : new Date().toISOString()
        };

        try {
            if (editingTicket) {
                await db.update('dailyTickets', editingTicket.id, data);
            } else {
                const result = await db.add('dailyTickets', data);

                // Also create a revenue entry for this sale
                const typeOfTicket = ticketTypes.find(tp => tp.id === form.ticketTypeId);
                if (typeOfTicket?.revenueTypeId) {
                    await db.add('revenueEntries', {
                        typeId: typeOfTicket.revenueTypeId,
                        amount: data.price,
                        date: new Date().toISOString().split('T')[0],
                        paymentMethod: form.paymentMethod,
                        note: `تذكرة يومية: ${form.memberName} (${typeOfTicket.name})`,
                        clubId: data.clubId
                    });
                }
            }

            setShowSaleModal(false);
            setEditingTicket(null);
            setForm({ memberName: '', phone: '', ticketTypeId: '', price: '', paymentMethod: 'نقدي', notes: '' });
            loadData();

            // Auto print if enabled
            if (clubSettings?.printTicketReceiptPos && !editingTicket) {
                const newTicket = (await db.getAll('dailyTickets'))
                    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
                handlePrint(newTicket);
            }
        } catch (error) {
            alert('حدث خطأ أثناء حفظ التذكرة');
        }
    };

    const handlePrint = (ticket: any) => {
        setSelectedForPrint(ticket);
        setTimeout(() => {
            window.print();
        }, 300);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('dailyTickets', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadData();
        }
    };

    const stats = {
        totalToday: filteredTickets.length,
        revenueToday: filteredTickets.reduce((acc, t) => acc + Number(t.price), 0)
    };

    return (
        <div dir="rtl">
            <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10 no-print">
                {/* Ultra Compact Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Ticket className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">سجل التذاكر اليومية</h1>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة مبيعات التذاكر المباشرة وحركات الدخول</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button onClick={loadData} className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 hover:text-blue-600 transition-all">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                            onClick={() => { setEditingTicket(null); setForm({ memberName: '', phone: '', ticketTypeId: '', price: '', paymentMethod: 'نقدي', notes: '' }); setShowSaleModal(true); }}
                            className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <PlusCircle className="w-4 h-4 icon-glow" />
                            <span>إصدار تذكرة جديدة</span>
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إيرادات التذاكر اليوم</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{stats.revenueToday.toLocaleString()} <small className="text-[10px] opacity-40">SAR</small></p>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 flex items-center gap-4 hover:scale-[1.02] transition-transform cursor-pointer">
                        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">عدد تذاكر اليوم</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white">{stats.totalToday} <small className="text-[10px] opacity-40">تذكرة</small></p>
                        </div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[300px]">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="ابحث باسم المشترك أو رقم الجوال..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all dark:text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                        <input
                            type="date"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                        />
                        {user?.role === 'super_admin' && (
                            <select
                                value={clubFilter}
                                onChange={(e) => setClubFilter(e.target.value)}
                                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                            >
                                <option value="">جميع الفروع</option>
                                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        )}
                        <button onClick={() => { setSearchQuery(''); setClubFilter(''); setDateFilter(new Date().toISOString().split('T')[0]); }} className="p-2 text-gray-400 hover:text-rose-500 transition-all">
                            <FilterX className="w-4 h-4 icon-glow" />
                        </button>
                    </div>
                </div>

                {/* Tickets Table */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table-display-premium">
                            <thead className="table-header-premium">
                                <tr>
                                    <th className="px-5 py-2.5 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">المشترك</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">نوع التذكرة</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">التاريخ / الوقت</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">السعر</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الدفع</th>
                                    <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">بواسطة</th>
                                    <th className="px-5 py-2.5 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto opacity-30" />
                                        </td>
                                    </tr>
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((t) => (
                                        <tr key={t.id} className="table-row-premium group">
                                            <td className="px-5 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black leading-tight table-cell-premium">{t.memberName}</span>
                                                    <span className="text-[9px] font-bold text-indigo-500/70">{t.phone}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className="inline-flex px-2 py-0.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-[10px] font-black text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-700">
                                                    {ticketTypes.find(tt => tt.id === t.ticketTypeId)?.name || 'عام'}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-bold text-gray-500">{new Date(t.createdAt).toLocaleDateString('en-GB')}</span>
                                                    <span className="text-[9px] font-bold text-gray-400 font-sans">{new Date(t.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className="text-[12px] font-black text-emerald-600 dark:text-emerald-400 font-sans">{Number(t.price).toLocaleString()} <small className="text-[9px]">SAR</small></span>
                                            </td>
                                            <td className="px-5 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className={`inline-flex px-2 py-0.5 rounded-lg text-[9px] font-black uppercase ${t.paymentMethod === 'نقدي' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                                                    {t.paymentMethod}
                                                </span>
                                            </td>
                                            <td className="px-5 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-1.5 opacity-60">
                                                    <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-black">{(t.createdBy_name || 'U').charAt(0)}</div>
                                                    <span className="text-[10px] font-bold truncate max-w-[80px]">{t.createdBy_name || '---'}</span>
                                                </div>
                                            </td>
                                            <td className="px-5 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handlePrint(t)}
                                                        className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm transition-all border border-indigo-100 dark:border-indigo-900/30 group/btn active:scale-90"
                                                        title="طباعة التذكرة"
                                                    >
                                                        <Printer className="w-4 h-4 icon-glow" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingTicket(t); setForm({ ...t }); setShowSaleModal(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90"
                                                        title="تعديل التذكرة"
                                                    >
                                                        <Edit3 className="w-4 h-4 icon-glow" />
                                                    </button>
                                                    <button
                                                        onClick={() => { setDeleteId(t.id); setIsDeleteModalOpen(true); }}
                                                        className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90"
                                                        title="حذف التذكرة"
                                                    >
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
                                                <p className="text-xs font-black uppercase">لا توجد سجلات تذاكر</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Modal remains inside no-print for UI consistency */}
                <AnimatePresence>
                    {showSaleModal && (
                        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSaleModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                            <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                                <div className="bg-indigo-600 p-6 flex items-center justify-between text-white">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                                            {editingTicket ? <Edit3 className="w-5 h-5 icon-glow" /> : <PlusCircle className="w-5 h-5 icon-glow" />}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-black uppercase tracking-tighter">{editingTicket ? 'تعديل بيانات التذكرة' : 'إصدار تذكرة دخول جديدة'}</h3>
                                            <p className="text-[9px] text-indigo-100 font-bold uppercase tracking-widest mt-0.5">{editingTicket ? 'تعديل بيانات المشترك أو المبلغ' : 'تسجيل بيانات المشترك واستلام المبلغ'}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setShowSaleModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                                </div>

                                <form onSubmit={handleSave} className="p-8 space-y-5">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">اسم المشترك / الزائر</label>
                                        <div className="relative">
                                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                            <input
                                                type="text"
                                                required
                                                value={form.memberName}
                                                onChange={(e) => setForm({ ...form, memberName: e.target.value })}
                                                placeholder="أدخل اسم الزائر..."
                                                className="w-full pr-9 pl-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">رقم الجوال</label>
                                        <div className="relative">
                                            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                            <input
                                                type="tel"
                                                required
                                                value={form.phone}
                                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                                placeholder="05xxxxxxxx"
                                                className="w-full pr-9 pl-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">نوع التذكرة</label>
                                        <select
                                            required
                                            value={form.ticketTypeId}
                                            onChange={(e) => {
                                                const type = ticketTypes.find(t => t.id === e.target.value);
                                                setForm({ ...form, ticketTypeId: e.target.value, price: type ? type.price.toString() : '' });
                                            }}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            <option value="">-- اختر نوع التذكرة --</option>
                                            {ticketTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.price} SAR)</option>)}
                                        </select>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">المبلغ المطلوب</label>
                                            <div className="relative">
                                                <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                                <input
                                                    type="number"
                                                    value={form.price}
                                                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                                                    className="w-full pr-9 pl-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs font-black dark:text-slate-500 outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">وسيلة الدفع</label>
                                            <select
                                                value={form.paymentMethod}
                                                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                                                className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-indigo-500/30 transition-all appearance-none cursor-pointer shadow-inner"
                                            >
                                                <option value="نقدي">نقدي</option>
                                                <option value="شبكة">شبكة</option>
                                                <option value="تحويل">تحويل</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">ملاحظات إضافية</label>
                                        <textarea
                                            rows={2}
                                            value={form.notes}
                                            onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                            className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all shadow-inner resize-none"
                                            placeholder="اكتب أي ملاحظات هنا..."
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-95">حفظ وتأكيد</button>
                                        <button type="button" onClick={() => setShowSaleModal(false)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all">إلغاء</button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                <DeleteModal
                    isOpen={isDeleteModalOpen}
                    onClose={() => setIsDeleteModalOpen(false)}
                    onConfirm={confirmDelete}
                    title="حذف سجل التذكرة"
                    message="هل أنت متأكد من حذف هذا السجل؟ لن يختفي المبلغ من الإيرادات ولكن سيختفي من قائمة الحضور."
                    confirmText="نعم، حذف التذكرة"
                    icon={<Trash2 className="w-6 h-6 relative z-10" />}
                />

                <style jsx global>{`
                    @media print {
                        @page {
                            margin: 0;
                            size: 80mm auto;
                        }
                        body {
                            margin: 0;
                            padding: 0;
                            -webkit-print-color-adjust: exact;
                        }
                        .no-print {
                            display: none !important;
                        }
                    }
                `}</style>
            </div>

            {/* Printable Area - OUTSIDE no-print */}
            <AnimatePresence>
                {selectedForPrint && <PrintableTicket ticket={selectedForPrint} clubProfile={clubProfile} />}
            </AnimatePresence>
        </div>
    );
}

