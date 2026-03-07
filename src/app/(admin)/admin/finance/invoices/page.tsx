"use client";

import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Search,
    Download,
    PlusCircle,
    FileText,
    Clock,
    Printer,
    Eye,
    Loader2,
    ChevronRight,
    ChevronLeft
} from 'lucide-react';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function InvoicesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [filteredInvoices, setFilteredInvoices] = useState<any[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [clubFilter, setClubFilter] = useState('');
    const [clubs, setClubs] = useState<any[]>([]);

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadData(currentUser);
    }, [router]);

    async function loadData(currentUser: User) {
        setLoading(true);
        try {
            const [allFinancials, allMembers, allClubs] = await Promise.all([
                db.getAll('financials'),
                db.getAll('members'),
                db.getAll('clubs')
            ]);

            setClubs(allClubs || []);

            let revenue = (allFinancials || []).filter((f: any) => f.type === 'revenue');

            const mapped = revenue.map((inv: any) => {
                const member = (allMembers || []).find((m: any) => m.id === inv.memberId);
                const club = (allClubs || []).find((c: any) => c.id === inv.clubId);
                return {
                    ...inv,
                    memberName: member?.name || 'عميل عام',
                    memberPhone: member?.phone || '---',
                    clubName: club?.name || '---'
                };
            });

            let finalData = mapped;
            if (currentUser.role !== 'super_admin' && currentUser.clubId) {
                finalData = mapped.filter((inv: any) => inv.clubId === currentUser.clubId);
            }

            setInvoices(finalData);
            setFilteredInvoices(finalData);
        } catch (error) {
            console.error("Error loading invoices:", error);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        let filtered = invoices.filter(inv => {
            const matchSearch = (inv.memberName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                (inv.id.toString().includes(searchQuery)) ||
                (inv.notes?.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchStatus = !statusFilter || inv.status === statusFilter;
            const matchClub = !clubFilter || inv.clubId === clubFilter;

            return matchSearch && matchStatus && matchClub;
        });
        setFilteredInvoices(filtered);
    }, [searchQuery, statusFilter, clubFilter, invoices]);

    const stats = {
        totalAmount: filteredInvoices.reduce((acc, inv) => acc + Number(inv.amount), 0),
        count: filteredInvoices.length,
        paid: filteredInvoices.filter(inv => inv.status === 'paid' || !inv.status).length,
        pending: filteredInvoices.filter(inv => inv.status === 'pending').length
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة فواتير ومبيعات النادي</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">متابعة كافة الإيرادات المالية وعمليات السداد</p>
                    </div>
                </div>

                <button
                    onClick={() => alert('إصدار فاتورة جديدة قيد التطوير')}
                    className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                    <PlusCircle className="w-4 h-4 icon-glow" />
                    <span>إصدار فاتورة جديدة</span>
                </button>
            </div>

            {/* Stats Cards - Super Streamlined */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MiniStatCard label="إجمالي الدخل" value={stats.totalAmount} icon={<Wallet className="w-4 h-4 text-emerald-500" />} color="emerald" />
                <MiniStatCard label="عدد الفواتير" value={stats.count} icon={<FileText className="w-4 h-4 text-blue-500" />} color="blue" unit="فاتورة" />
                <MiniStatCard label="فواتير معلقة" value={stats.pending} icon={<Clock className="w-4 h-4 text-amber-500" />} color="amber" unit="معاملة" />
            </div>

            {/* Filter & Search Bar - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="ابحث برقم الفاتورة، اسم العميل، أو الملاحظات..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500/30 transition-all dark:text-white"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    {user?.role === 'super_admin' && (
                        <select
                            value={clubFilter}
                            onChange={(e) => setClubFilter(e.target.value)}
                            className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                        >
                            <option value="">جميع الفصول</option>
                            {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    )}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 dark:text-white"
                    >
                        <option value="">جميع الحالات</option>
                        <option value="paid">مدفوعة</option>
                        <option value="pending">معلقة</option>
                        <option value="cancelled">ملغاة</option>
                    </select>

                    <button className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-emerald-600 transition-all">
                        <Download className="w-4 h-4 icon-glow" />
                    </button>
                </div>
            </div>

            {/* Invoices Table - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-display-premium">
                        <thead className="table-header-premium">
                            <tr>
                                <th className="px-4 py-2 text-center first:rounded-tr-2xl border-l border-white/5 last:border-l-0">رقم الفاتورة</th>
                                <th className="px-4 py-2 text-right border-l border-white/5 last:border-l-0">العميل</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">التاريخ</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">المبلغ</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">طريقة الدفع</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-4 py-2 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto opacity-30" />
                                    </td>
                                </tr>
                            ) : filteredInvoices.length > 0 ? (
                                filteredInvoices.map((inv) => (
                                    <tr key={inv.id} className="table-row-premium group">
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="text-[10px] font-black font-mono italic bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-700 table-cell-premium">
                                                #{inv.id.toString().padStart(6, '0')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black leading-tight table-cell-premium">{inv.memberName}</span>
                                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">{inv.clubName}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-center text-[10px] font-black border-l border-gray-100/20 last:border-l-0 table-cell-premium font-mono italic">
                                            {inv.date}
                                        </td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <div className="text-[12px] font-black table-cell-premium" dir="ltr">
                                                {Number(inv.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                                <small className="text-[9px] opacity-40 ml-1">SAR</small>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/30 uppercase">
                                                {inv.paymentMethod || 'نقداً'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${inv.status === 'paid' || !inv.status ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10' :
                                                inv.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10' :
                                                    'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10'
                                                }`}>
                                                <div className={`w-1 h-1 rounded-full ${inv.status === 'paid' || !inv.status ? 'bg-emerald-600' : inv.status === 'pending' ? 'bg-amber-600' : 'bg-rose-600'}`} />
                                                {inv.status === 'paid' || !inv.status ? 'مدفوعة' : inv.status === 'pending' ? 'معلقة' : 'ملغاة'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                                                <button title="طباعة" className="w-8 h-8 flex items-center justify-center bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-600 hover:text-white rounded-xl shadow-sm transition-all border border-amber-100 dark:border-amber-900/30 group/btn active:scale-90">
                                                    <Printer className="w-4 h-4 icon-glow" />
                                                </button>
                                                <button title="تفاصيل" className="w-8 h-8 flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white rounded-xl shadow-sm transition-all border border-indigo-100 dark:border-indigo-900/30 group/btn active:scale-90">
                                                    <Eye className="w-4 h-4 icon-glow" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs border-l border-gray-100/20 last:border-l-0">لا يوجد سجل للفواتير حالياً</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination - Ultra Compact */}
                <div className="p-3 px-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">سجل المعاملات الصادرة</span>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-slate-600 hover:text-white rounded-xl shadow-sm transition-all border border-slate-100 dark:border-slate-900/30 group/btn active:scale-90">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-7 h-7 bg-emerald-600 text-white rounded-lg text-[10px] font-black shadow-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-slate-600 hover:text-white rounded-xl shadow-sm transition-all border border-slate-100 dark:border-slate-900/30 group/btn active:scale-90">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function MiniStatCard({ label, value, icon, color, unit = "SAR" }: any) {
    const colorClasses: any = {
        emerald: 'bg-emerald-50/30 dark:bg-emerald-900/5 border-emerald-100/30 dark:border-emerald-900/20',
        blue: 'bg-blue-50/30 dark:bg-blue-900/5 border-blue-100/30 dark:border-blue-900/20',
        amber: 'bg-amber-50/30 dark:bg-amber-900/5 border-amber-100/30 dark:border-amber-900/20',
    };

    return (
        <div className={`p-4 rounded-3xl border shadow-sm flex items-center justify-between transition-all hover:scale-[1.01] ${colorClasses[color]}`}>
            <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</span>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                        {typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: unit === 'SAR' ? 2 : 0 }) : value}
                    </span>
                    <span className="text-[9px] font-black opacity-30 uppercase tracking-tighter">{unit}</span>
                </div>
            </div>
            <div className="w-10 h-10 bg-white dark:bg-slate-900 rounded-2xl shadow-sm flex items-center justify-center ring-1 ring-gray-300 dark:ring-slate-800">
                {icon}
            </div>
        </div>
    );
}
