"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    UserPlus,
    Search,
    Edit3,
    Trash2,
    Fingerprint,
    Shield,
    CheckCircle2,
    XCircle,
    Loader2,
    X,
    Save,
    Phone,
    IdCard,
    Briefcase,
    ChevronRight,
    ChevronLeft,
    ShieldCheck,
    Lock,
    RefreshCw,
    Building,
    Printer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

const jobRoleLabels: Record<string, string> = {
    'manager': 'مدير النادي',
    'receptionist': 'موظف استقبال',
    'coach': 'مدرب رياضي',
    'accountant': 'محاسب',
    'worker': 'عامل'
};

const roleMapping: Record<string, string> = {
    'manager': 'club_admin',
    'receptionist': 'receptionist',
    'coach': 'coach',
    'accountant': 'accountant',
    'worker': 'worker'
};

export default function EmployeesPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [employees, setEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [clubs, setClubs] = useState<any[]>([]);

    // Modal & Form States
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [form, setForm] = useState({
        name: '',
        nationalId: '',
        phone: '',
        jobRole: 'receptionist',
        status: 'نشط',
        clubId: '',
        fingerprintRight: '',
        fingerprintLeft: ''
    });

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadEmployees();
        loadClubs();
    }, [router]);

    async function loadClubs() {
        try {
            const data = await db.getAll('clubs');
            setClubs(data || []);
        } catch (e) { }
    }

    async function loadEmployees() {
        setLoading(true);
        try {
            const data = await db.getAll('employees');
            const currentUser = auth.getCurrentUser();
            const clubId = currentUser?.clubId;

            let filtered = data || [];
            if (currentUser?.role !== 'super_admin') {
                filtered = filtered.filter((e: any) => e.clubId === clubId);
            }
            setEmployees(filtered);
        } catch (error) {
            console.error("Error loading employees:", error);
        } finally {
            setLoading(false);
        }
    }

    const openCreateModal = () => {
        setEditingItem(null);
        setForm({
            name: '',
            nationalId: '',
            phone: '',
            jobRole: 'receptionist',
            status: 'نشط',
            clubId: user?.clubId || '',
            fingerprintRight: '',
            fingerprintLeft: ''
        });
        setShowModal(true);
    };

    const openEditModal = (emp: any) => {
        setEditingItem(emp);
        setForm({
            name: emp.name || '',
            nationalId: emp.nationalId || '',
            phone: emp.phone || '',
            jobRole: emp.jobRole || 'receptionist',
            status: emp.status || 'نشط',
            clubId: emp.clubId || '',
            fingerprintRight: emp.fingerprintRight || '',
            fingerprintLeft: emp.fingerprintLeft || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const clubId = user?.role === 'super_admin' ? form.clubId : (user?.clubId || (user as any)?.club_id);
        const systemRole = roleMapping[form.jobRole] || 'worker';

        if (systemRole === 'club_admin' && user?.role !== 'super_admin') {
            alert('خطأ أمني: ليس لديك صلاحية لتعيين مدير نادي');
            return;
        }

        const data = {
            ...form,
            clubId: clubId
        };

        try {
            if (editingItem) {
                await db.update('employees', editingItem.id, data);
            } else {
                await db.add('employees', {
                    ...data,
                    createdAt: new Date().toISOString()
                });
            }
            setShowModal(false);
            loadEmployees();
        } catch (error) {
            alert('حدث خطأ أثناء حفظ بيانات الموظف');
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('employees', deleteId);
            setIsDeleteModalOpen(false);
            setDeleteId(null);
            loadEmployees();
        }
    };

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.nationalId?.includes(searchQuery) ||
        jobRoleLabels[emp.jobRole]?.includes(searchQuery)
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Users className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة شؤون الموظفين</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة الطاقم الإداري والمدربين والصلاحيات</p>
                    </div>
                </div>

                <button
                    onClick={openCreateModal}
                    className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                >
                    <UserPlus className="w-4 h-4 icon-glow" />
                    <span>إضافة موظف جديد</span>
                </button>
            </div>

            {/* Filter & Search Bar - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، رقم الهوية، أو الوظيفة..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الموظفين: <span className="text-indigo-600">{employees.length}</span></div>
                    <button onClick={loadEmployees} className="p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-indigo-600 transition-all">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Employees Table - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-display-premium">
                        <thead className="table-header-premium">
                            <tr>
                                <th className="px-4 py-2 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">الموظف</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">رقم الهوية</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">الجوال</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">الوظيفة</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">البصمة</th>
                                <th className="px-4 py-2 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-4 py-2 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                            {loading ? (
                                <tr><td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto opacity-30" /></td></tr>
                            ) : filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="table-row-premium group">
                                        <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 font-black text-[10px] group-hover:bg-indigo-600 group-hover:text-white transition-all">{emp.name[0]}</div>
                                                <div className="flex flex-col">
                                                    <span className="text-[12px] font-black leading-tight table-cell-premium">{emp.name}</span>
                                                    <div className="flex items-center gap-1.5 mt-0.5">
                                                        <Shield className="w-2.5 h-2.5 text-indigo-400" />
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">ROLE: {roleMapping[emp.jobRole] || 'staff'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-center text-[10px] font-black border-l border-gray-100/20 last:border-l-0 table-cell-premium font-mono italic">
                                            {emp.nationalId}
                                        </td>
                                        <td className="px-4 py-1.5 text-center text-[10px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium font-mono">
                                            {emp.phone}
                                        </td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className="inline-flex px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-tighter">
                                                {jobRoleLabels[emp.jobRole] || emp.jobRole}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-1">
                                                {emp.fingerprintRight ? <Fingerprint className="w-3.5 h-3.5 text-emerald-500" /> : <Fingerprint className="w-3.5 h-3.5 text-gray-200" />}
                                                {emp.fingerprintLeft ? <Fingerprint className="w-3.5 h-3.5 text-emerald-500" /> : <Fingerprint className="w-3.5 h-3.5 text-gray-200" />}
                                            </div>
                                        </td>
                                        <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black border ${emp.status === 'نشط' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${emp.status === 'نشط' ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                            <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                <button onClick={() => openEditModal(emp)} className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90" title="تعديل">
                                                    <Edit3 className="w-4 h-4 icon-glow" />
                                                </button>
                                                <button onClick={() => handleDelete(emp.id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90" title="حذف">
                                                    <Trash2 className="w-4 h-4 icon-glow" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs border-l border-gray-100/20 last:border-l-0">لا يوجد موظفين مسجلين حالياً</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Placeholder */}
                <div className="p-3 px-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-gray-300 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">سجل الكادر الوظيفي</span>
                    <div className="flex items-center gap-1">
                        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-slate-600 hover:text-white rounded-xl shadow-sm transition-all border border-slate-100 dark:border-slate-900/30 group/btn active:scale-90">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="w-7 h-7 bg-indigo-600 text-white rounded-lg text-[10px] font-black shadow-sm">1</button>
                        <button className="w-8 h-8 flex items-center justify-center bg-slate-50 dark:bg-slate-900/20 text-slate-600 dark:text-slate-400 hover:bg-slate-600 hover:text-white rounded-xl shadow-sm transition-all border border-slate-100 dark:border-slate-900/30 group/btn active:scale-90">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal - Ultra Compact */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                            <div className="bg-indigo-600 p-6 flex items-center justify-between text-white border-b border-indigo-700">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><ShieldCheck className="w-5 h-5 icon-glow" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">{editingItem ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد'}</h3>
                                        <p className="text-[9px] text-indigo-100 font-bold uppercase tracking-widest mt-0.5">إعدادات الهوية والوظيفة وصلاحيات النظام</p>
                                    </div>
                                </div>
                                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">الاسم الرباعي المعتمد *</label>
                                        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all shadow-inner" placeholder="الاسم الكامل كما في الهوية" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">رقم الهوية الوطنية *</label>
                                        <div className="relative group">
                                            <IdCard className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input required value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner font-mono italic" placeholder="10xxxxxxxx" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">رقم الجوال الشخصي *</label>
                                        <div className="relative group">
                                            <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-indigo-500 transition-colors" />
                                            <input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner font-mono" placeholder="05xxxxxxxx" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">المسمى الوظيفي والصلاحية *</label>
                                        <select
                                            required
                                            value={form.jobRole}
                                            onChange={e => setForm({ ...form, jobRole: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            {Object.entries(jobRoleLabels).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {user?.role === 'super_admin' && (
                                        <div className="space-y-1.5">
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">نادي التعيين *</label>
                                            <select
                                                required
                                                value={form.clubId}
                                                onChange={e => setForm({ ...form, clubId: e.target.value })}
                                                className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none transition-all appearance-none shadow-inner"
                                            >
                                                <option value="">اختر النادي</option>
                                                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                                        <div>
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">بصمة الإصبع</p>
                                            <p className="text-[10px] font-black text-gray-600 dark:text-slate-400">{form.fingerprintRight ? 'مسجلة ✓' : 'غير مسجلة'}</p>
                                        </div>
                                        <button type="button" onClick={() => setForm({ ...form, fingerprintRight: 'FP-OK' })} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 flex items-center justify-center text-indigo-400 hover:text-indigo-600 transition-all shadow-sm">
                                            <Fingerprint className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">حساب النظام</p>
                                            <div className="flex items-center gap-1">
                                                <div className={`w-1.5 h-1.5 rounded-full ${form.status === 'نشط' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                <p className="text-[10px] font-black text-gray-600 dark:text-slate-400">{form.status}</p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setForm({ ...form, status: form.status === 'نشط' ? 'معطل' : 'نشط' })} className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-all shadow-sm">
                                            <RefreshCw className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                                    <button type="submit" className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإغلاق
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all">إغلاق</button>
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
                title="حذف الموظف"
                message="هل أنت متأكد من رغبتك في حذف هذا الموظف؟ سيؤدي ذلك لإزالته نهائياً من سجلات النظام وصلاحيات الوصول."
            />
        </div>
    );
}
