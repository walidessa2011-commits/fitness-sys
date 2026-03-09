"use client";

import React, { useState, useEffect } from 'react';
import {
    CalendarCheck,
    Search,
    UserCircle,
    CheckCircle2,
    XCircle,
    History,
    RefreshCw,
    PlusCircle,
    Fingerprint,
    IdCard,
    Phone,
    ArrowRightLeft,
    Users,
    Briefcase,
    Clock,
    UserCheck,
    Loader2,
    Trash2,
    Info,
    Calendar,
    X,
    Save,
    ChevronRight,
    ChevronLeft,
    Activity,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import DeleteModal from '@/components/DeleteModal';

type AttendanceType = 'member' | 'employee';

export default function AttendancePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [activeMode, setActiveMode] = useState<AttendanceType>('member');
    const [attendanceList, setAttendanceList] = useState<any[]>([]);
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Search States
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedPerson, setSelectedPerson] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [validationMsg, setValidationMsg] = useState('');
    const [isValid, setIsValid] = useState(false);

    // Modal States
    const [showManualModal, setShowManualModal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [manualForm, setManualForm] = useState({
        personId: '',
        hallId: '',
        type: 'member' as AttendanceType,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
        note: ''
    });

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadAttendance();
        loadHalls();
    }, [router]);

    async function loadHalls() {
        const clubId = auth.getCurrentUser()?.clubId;
        if (clubId) {
            const data = await db.getByClub('halls', clubId);
            setHalls(data || []);
        }
    }

    async function loadAttendance() {
        setLoading(true);
        try {
            const history = await db.getAll('attendance');
            const today = new Date().toISOString().split('T')[0];
            const clubId = auth.getCurrentUser()?.clubId || (auth.getCurrentUser() as any)?.club_id;
            const isSuperAdmin = auth.getCurrentUser()?.role === 'super_admin';

            // Filter history by today and club (db.getAll already filters by club for non-super admins)
            const filtered = (history || [])
                .filter((a: any) => {
                    const isToday = a.date === today;
                    const matchesClub = isSuperAdmin || !clubId || a.clubId === clubId || a.club_id === clubId;
                    return isToday && matchesClub;
                })
                .sort((a: any, b: any) => b.time.localeCompare(a.time));

            setAttendanceList(filtered);
        } catch (error) {
            console.error("Error loading attendance:", error);
        } finally {
            setLoading(false);
        }
    }

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 1) {
            setSearchResults([]);
            return;
        }

        const clubId = user?.clubId || (user as any)?.club_id;
        const isSuperAdmin = user?.role === 'super_admin';

        if (activeMode === 'member') {
            const members = await db.getAll('members');
            const filtered = (members || []).filter((m: any) => {
                const searchStr = `${m.name} ${m.phone} ${m.membershipNumber}`.toLowerCase();
                const matchesSearch = searchStr.includes(query.toLowerCase());
                const matchesClub = isSuperAdmin || !clubId || m.clubId === clubId || m.club_id === clubId;
                return matchesSearch && matchesClub;
            }).slice(0, 5);
            setSearchResults(filtered);
        } else {
            const emps = await db.getAll('employees');
            const filtered = (emps || []).filter((e: any) => {
                const searchStr = `${e.name} ${e.phone} ${e.nationalId}`.toLowerCase();
                const matchesSearch = searchStr.includes(query.toLowerCase());
                const matchesClub = isSuperAdmin || !clubId || e.clubId === clubId || e.club_id === clubId;
                return matchesSearch && matchesClub;
            }).slice(0, 5);
            setSearchResults(filtered);
        }
    };

    const selectPerson = async (person: any) => {
        setSelectedPerson(person);
        setSearchResults([]);
        setSearchQuery(person.name);

        if (activeMode === 'member') {
            const subs = await db.getAll('subscriptions');
            const activeSub = subs?.find((s: any) => s.memberId === person.id && s.status === 'نشط');
            setSubscription(activeSub);

            if (!activeSub) {
                setValidationMsg('لا يوجد اشتراك نشط لهذا العضو');
                setIsValid(false);
            } else {
                const today = new Date().toISOString().split('T')[0];
                const isExpired = activeSub.endDate < today;
                if (isExpired) {
                    setValidationMsg('الاشتراك منتهي الصلاحية');
                    setIsValid(false);
                } else {
                    setValidationMsg('');
                    setIsValid(true);
                }
            }
        } else {
            if (person.status === 'معطل' || person.status === 'غير نشط') {
                setValidationMsg('الموظف معطل في النظام');
                setIsValid(false);
            } else {
                setValidationMsg('');
                setIsValid(true);
                setSubscription({ id: 'EMP_ATT', name: person.jobRole });
            }
        }
    };

    const processCheckIn = async () => {
        if (!selectedPerson || !isValid) return;

        const now = new Date();
        const clubId = user?.clubId || (user as any)?.club_id;

        const record = {
            memberId: selectedPerson.id,
            subscriptionId: subscription?.id || 'NONE',
            memberName: selectedPerson.name,
            planName: subscription?.name || (activeMode === 'employee' ? 'دوام' : 'زيارة'),
            hallId: manualForm.hallId || (halls.length > 0 ? halls[0].id : null),
            type: activeMode === 'member' ? 'عضو' : 'موظف',
            clubId: clubId,
            date: now.toISOString().split('T')[0],
            time: now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            dayOfWeek: now.toLocaleDateString('ar-SA', { weekday: 'long' }),
            registeredBy: user?.name || user?.username || 'System'
        };

        try {
            await db.add('attendance', record);
            setSelectedPerson(null);
            setSubscription(null);
            setSearchQuery('');
            loadAttendance();
        } catch (error) {
            alert('حدث خطأ أثناء تسجيل الدخول');
        }
    };

    const deleteRecord = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('attendance', deleteId);
            setDeleteId(null);
            setIsDeleteModalOpen(false);
            loadAttendance();
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <CalendarCheck className="w-5 h-5 icon-glow" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">بوابة الحضور والانصراف</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">متابعة دخول الأعضاء وحضور الموظفين اللحظي</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-300 dark:border-slate-700/50">
                        <button onClick={() => { setActiveMode('member'); setSelectedPerson(null); setSearchQuery(''); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeMode === 'member' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-gray-400'}`}>الأعضاء</button>
                        <button onClick={() => { setActiveMode('employee'); setSelectedPerson(null); setSearchQuery(''); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black transition-all ${activeMode === 'employee' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-gray-400'}`}>الموظفين</button>
                    </div>
                    <button onClick={() => setShowManualModal(true)} className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-xl font-black text-[11px] hover:bg-slate-800 transition-all flex items-center gap-1.5">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>حضور يدوي</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Search Sidebar - Compact */}
                <div className="lg:col-span-4 flex flex-col gap-2.5">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-gray-300 dark:border-slate-800">
                        <div className="relative mb-5">
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder={activeMode === 'member' ? "رقم العضوية، الجوال، الاسم..." : "اسم الموظف أو رقم الهوية..."}
                                className="w-full pr-9 pl-4 py-2.5 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-[11px] font-black outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all dark:text-white"
                            />
                            <AnimatePresence>
                                {searchResults.length > 0 && (
                                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }} className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden ring-1 ring-gray-300/50">
                                        {searchResults.map((item) => (
                                            <div key={item.id} onClick={() => selectPerson(item)} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 cursor-pointer group transition-all">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-black text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-all">{item.name[0]}</div>
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">{item.name}</p>
                                                    <p className="text-[8px] font-bold text-gray-400 mt-0.5 uppercase tracking-tighter">{activeMode === 'member' ? item.membershipNumber || item.phone : item.jobRole}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {selectedPerson ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 text-xl font-black mb-3 ring-4 ring-white dark:ring-slate-900 shadow-sm">{selectedPerson.name[0]}</div>
                                    <h4 className="text-xs font-black text-slate-900 dark:text-white">{selectedPerson.name}</h4>
                                    <span className="text-[9px] font-bold text-gray-400 mt-1">UUID: {selectedPerson.id.substring(0, 8)}</span>
                                </div>

                                <div className="space-y-2">
                                    <InfoRow label="حالة الاشتراك" value={isValid ? (activeMode === 'member' ? 'نشط' : 'فعال') : 'غير متاح'} status={isValid ? 'active' : 'inactive'} />
                                    <InfoRow label="الباقة / الوظيفة" value={subscription?.name || '---'} />
                                    <InfoRow label="تاريخ الصلاحية" value={activeMode === 'member' ? (subscription?.endDate || '---') : 'دوام ثابت'} />
                                </div>

                                <button
                                    onClick={processCheckIn}
                                    disabled={!isValid}
                                    className={`w-full py-3 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${isValid ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:bg-blue-700 active:scale-95' : 'bg-slate-100 dark:bg-slate-800 text-gray-300 cursor-not-allowed'}`}
                                >
                                    <UserCheck className="w-4 h-4 icon-glow" /> تسجيل دخول
                                </button>
                                {validationMsg && <p className="text-center text-[9px] font-black text-rose-500 bg-rose-50/50 dark:bg-rose-900/10 p-2 rounded-lg border border-rose-100 dark:border-rose-900/20">{validationMsg}</p>}
                            </motion.div>
                        ) : (
                            <div className="py-12 flex flex-col items-center justify-center gap-3 opacity-20">
                                <IdCard className="w-10 h-10" />
                                <p className="text-[10px] font-black uppercase tracking-widest">بانتظار مسح البيانات</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content - History List */}
                <div className="lg:col-span-8 flex flex-col gap-2.5">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden flex flex-col h-[600px]">
                        <div className="p-4 px-5 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                            <div className="flex items-center gap-2.5">
                                <Activity className="w-4 h-4 text-blue-600" />
                                <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tighter">سجل الدخول اللحظي (اليوم)</h3>
                                <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full">{attendanceList.length} سجل</span>
                            </div>
                            <button onClick={loadAttendance} className="p-1.5 text-slate-400 hover:text-blue-600 transition-all font-black"><RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /></button>
                        </div>

                        <div className="flex-1 overflow-y-auto min-w-full">
                            <table className="table-display-premium">
                                <thead className="table-header-premium sticky top-0 z-10">
                                    <tr>
                                        <th className="px-5 py-2.5 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">الاسم والنوع</th>
                                        <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الصالة</th>
                                        <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الوقت</th>
                                        <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">التفاصيل</th>
                                        <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">المسؤول</th>
                                        <th className="px-3 py-2.5 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0"></th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                                    {loading && attendanceList.length === 0 ? (
                                        <tr><td colSpan={5} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto opacity-30" /></td></tr>
                                    ) : attendanceList.length === 0 ? (
                                        <tr><td colSpan={5} className="py-24 text-center text-gray-300 italic text-xs tracking-widest uppercase opacity-40 border-l border-gray-100/20 last:border-l-0">لا توجد عمليات حضور مسجلة اليوم</td></tr>
                                    ) : (
                                        attendanceList.map((item) => (
                                            <tr key={item.id} className="table-row-premium group">
                                                <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-blue-600 font-black text-[10px] shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">{item.memberName[0]}</div>
                                                        <div className="flex flex-col">
                                                            <div className="flex items-center gap-1.5">
                                                                <span className="text-[11px] font-black leading-tight table-cell-premium">{item.memberName}</span>
                                                                <span className={`px-1.5 py-0.5 rounded text-[7px] font-black tracking-tighter ${item.type === 'موظف' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}>{item.type}</span>
                                                            </div>
                                                            <span className="text-[8px] font-bold text-gray-400">ID: {item.memberId.substring(0, 6)}</span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-1.5 text-center text-[10px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium">
                                                    {halls.find(h => h.id === item.hallId)?.name || '---'}
                                                </td>
                                                <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                    <div className="flex items-center justify-center gap-1.5">
                                                        <Clock className="w-3 h-3 text-blue-400 opacity-50" />
                                                        <span className="text-[11px] font-black font-mono italic table-cell-premium">{item.time}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                    <span className="inline-flex px-2 py-0.5 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black border border-slate-300 dark:border-slate-700 tracking-tighter">
                                                        {item.planName || '---'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-1.5 text-center text-[9px] font-bold text-gray-400 tabular-nums lowercase border-l border-gray-100/20 last:border-l-0 table-cell-premium">{item.registeredBy}</td>
                                                <td className="px-3 py-1.5 border-l border-gray-100/20 last:border-l-0 text-center">
                                                    <button onClick={() => deleteRecord(item.id)} className="mx-auto w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90 opacity-0 group-hover:opacity-100" title="حذف">
                                                        <Trash2 className="w-4 h-4 icon-glow" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Manual Entry Modal - Compact */}
            <AnimatePresence>
                {showManualModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowManualModal(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                            <div className="bg-slate-900 p-6 flex items-center justify-between text-white border-b border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-md shadow-inner"><PlusCircle className="w-5 h-5 icon-glow" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">تسجيل حضور يدوي</h3>
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">سجل دخول استثنائي خارج نظام المسح التلقائي</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowManualModal(false)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">×</button>
                            </div>

                            <form className="p-8 space-y-5" onSubmit={(e) => { e.preventDefault(); }}>
                                <div className="flex p-1 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-300 dark:border-slate-700/50">
                                    <button
                                        type="button"
                                        onClick={() => setManualForm({ ...manualForm, type: 'member', personId: '' })}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${manualForm.type === 'member' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        عضو مشترك
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setManualForm({ ...manualForm, type: 'employee', personId: '' })}
                                        className={`flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all ${manualForm.type === 'employee' ? 'bg-white dark:bg-slate-900 text-blue-600 shadow-sm' : 'text-gray-400'}`}
                                    >
                                        موظف فرع
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">بيانات الشخص</label>
                                        <select
                                            value={manualForm.personId}
                                            onChange={e => setManualForm({ ...manualForm, personId: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            <option value="">-- اختر من القائمة --</option>
                                            {searchResults.length > 0 ?
                                                searchResults.map(p => <option key={p.id} value={p.id}>{p.name}</option>) :
                                                <option disabled>ابحث أولاً في القائمة الجانبية</option>
                                            }
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">بوابة الدخول (الصالة)</label>
                                        <select
                                            value={manualForm.hallId}
                                            onChange={e => setManualForm({ ...manualForm, hallId: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            <option value="">-- اختر الصالة --</option>
                                            {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">تاريخ الحضور</label>
                                        <DatePicker value={manualForm.date} onChange={d => setManualForm({ ...manualForm, date: d })} className="w-full text-xs font-black bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl shadow-inner" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">وقت الدخول</label>
                                        <input type="time" value={manualForm.time} onChange={e => setManualForm({ ...manualForm, time: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white outline-none shadow-inner" />
                                    </div>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest block pr-1">ملاحظات إضافية</label>
                                    <textarea placeholder="أدخل سبب التسجيل اليدوي..." value={manualForm.note} onChange={e => setManualForm({ ...manualForm, note: e.target.value })} className="w-full p-3 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-bold dark:text-white outline-none transition-all shadow-inner resize-none h-20" />
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs shadow-xl shadow-blue-100 dark:shadow-none transition-all flex items-center justify-center gap-3 active:scale-95 mt-4"
                                >
                                    <ShieldCheck className="w-5 h-5 icon-glow" /> تأكيد واعتماد الحضور
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف سجل الحضور"
                message="هل أنت متأكد من رغبتك في حذف سجل الحضور هذا؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="نعم، حذف السجل"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}

function InfoRow({ label, value, status }: { label: string, value: any, status?: 'active' | 'inactive' }) {
    return (
        <div className="flex justify-between items-center p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-gray-200/30 dark:border-slate-800/50 transition-all">
            <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
            <span className={`text-[10px] font-black ${status === 'active' ? 'text-emerald-600' : status === 'inactive' ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>{value}</span>
        </div>
    );
}
