"use client";

import React, { useState, useEffect } from 'react';
import {
    Building,
    PlusCircle,
    Edit3,
    Trash2,
    Search,
    Loader2,
    X,
    Save,
    MapPin,
    Phone,
    Users,
    CheckCircle2,
    Shield,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Activity,
    UserPlus,
    LayoutGrid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@/components/ui/date-picker';
import DeleteModal from '@/components/DeleteModal';

export default function ClubsManagementPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [clubs, setClubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 12;

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingClub, setEditingClub] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Stats
    const [stats, setStats] = useState({ total: 0, active: 0, expired: 0, membersTotal: 0 });

    // Form
    const [form, setForm] = useState({
        name: '',
        location: '',
        phone: '',
        email: '',
        status: 'نشط',
        subscriptionPlan: 'أساسي',
        expiryDate: '',
        maxMembers: 500,
        notes: '',
        managerName: '',
        managerUsername: '',
        managerPassword: ''
    });

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        if (currentUser.role !== 'super_admin') {
            router.push('/admin/dashboard');
            return;
        }
        setUser(currentUser);
        loadData();
    }, [router]);

    async function loadData() {
        setLoading(true);
        try {
            const [allClubs, allMembers, allEmployees, allUsers] = await Promise.all([
                db.getAll('clubs'),
                db.getAll('members'),
                db.getAll('employees'),
                db.getAll('users')
            ]);

            const today = new Date().toISOString().split('T')[0];
            const enrichedClubs = (allClubs || []).map((club: any) => {
                const manager = (allUsers || []).find((u: any) => u.clubId === club.id && u.role === 'club_admin');
                return {
                    ...club,
                    membersCount: (allMembers || []).filter((m: any) => m.clubId === club.id).length,
                    employeesCount: (allEmployees || []).filter((e: any) => e.clubId === club.id).length,
                    isExpired: club.expiryDate ? club.expiryDate < today : false,
                    manager: manager
                };
            });

            setClubs(enrichedClubs);
            setStats({
                total: enrichedClubs.length,
                active: enrichedClubs.filter((c: any) => c.status === 'نشط').length,
                expired: enrichedClubs.filter((c: any) => c.isExpired).length,
                membersTotal: (allMembers || []).length
            });
        } catch (error) {
            console.error("Error loading clubs:", error);
        } finally {
            setLoading(false);
        }
    }

    const openCreateModal = () => {
        setEditingClub(null);
        setForm({
            name: '',
            location: '',
            phone: '',
            email: '',
            status: 'نشط',
            subscriptionPlan: 'أساسي',
            expiryDate: '',
            maxMembers: 500,
            notes: '',
            managerName: '',
            managerUsername: '',
            managerPassword: ''
        });
        setShowModal(true);
    };

    const openEditModal = (club: any) => {
        setEditingClub(club);
        setForm({
            name: club.name || '',
            location: club.location || '',
            phone: club.phone || '',
            email: club.email || '',
            status: club.status || 'نشط',
            subscriptionPlan: club.subscriptionPlan || 'أساسي',
            expiryDate: club.expiryDate || '',
            maxMembers: club.maxMembers || 500,
            notes: club.notes || '',
            managerName: club.manager?.name || '',
            managerUsername: club.manager?.username || '',
            managerPassword: club.manager?.password || ''
        });
        setShowModal(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const clubData = {
                name: form.name,
                location: form.location,
                phone: form.phone,
                email: form.email,
                status: form.status,
                subscriptionPlan: form.subscriptionPlan,
                expiryDate: form.expiryDate,
                maxMembers: form.maxMembers,
                notes: form.notes
            };

            if (editingClub) {
                await db.update('clubs', editingClub.id, clubData);

                // Update manager
                if (editingClub.manager) {
                    await db.update('users', editingClub.manager.id, {
                        name: form.managerName,
                        username: form.managerUsername,
                        password: form.managerPassword
                    });
                } else if (form.managerUsername) {
                    await db.add('users', {
                        name: form.managerName,
                        username: form.managerUsername,
                        password: form.managerPassword,
                        role: 'club_admin',
                        clubId: editingClub.id,
                        status: 'enabled'
                    });
                }
            } else {
                const insertedClub = await db.add('clubs', { ...clubData, createdAt: new Date().toISOString() });
                if (insertedClub && form.managerUsername) {
                    await db.add('users', {
                        name: form.managerName,
                        username: form.managerUsername,
                        password: form.managerPassword,
                        role: 'club_admin',
                        clubId: insertedClub.id,
                        status: 'enabled',
                        systemExpiryDate: form.expiryDate
                    });
                }
            }
            setShowModal(false);
            loadData();
        } catch (error) {
            alert('حدث خطأ أثناء حفظ البيانات');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                // 1. Comprehensive list of tables with FKs to clubs
                const tablesToClean = [
                    'subscriptions',
                    'subscriptionPrices',
                    'subscriptionTypes',
                    'activities',
                    'dailyTickets',
                    'members',
                    'employees',
                    'users'
                ];

                // 2. Cascade delete records in each related table
                for (const table of tablesToClean) {
                    try {
                        const allRows = await db.getAll(table);
                        const relatedRows = allRows.filter((u: any) => u.clubId === deleteId || u.club_id === deleteId);

                        for (const row of relatedRows) {
                            await db.delete(table, row.id);
                        }
                    } catch (err) {
                        console.warn(`Failed to cleanup ${table}:`, err);
                    }
                }

                // 3. Finally delete the club itself
                await db.delete('clubs', deleteId);

                setShowModal(false);
                setDeleteId(null);
                setIsDeleteModalOpen(false);
                loadData();
            } catch (error) {
                alert('حدث خطأ أثناء الحذف: يوجد بيانات مرتبطة تمنع الحذف');
                console.error(error);
            }
        }
    };

    const toggleStatus = async (club: any) => {
        const newStatus = club.status === 'نشط' ? 'معطل' : 'نشط';
        await db.update('clubs', club.id, { status: newStatus });
        loadData();
    };

    const filteredClubs = clubs.filter(c =>
        c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const totalPages = Math.ceil(filteredClubs.length / ITEMS_PER_PAGE);
    const paginatedClubs = filteredClubs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Building className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة النوادي والفروع</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحكم كامل في جميع الفروع المسجلة</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative group">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث عن فرع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-blue-500/20 transition-all dark:text-white w-48 shadow-inner"
                        />
                    </div>
                    <button onClick={openCreateModal} className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة فرع</span>
                    </button>
                </div>
            </div>

            {/* Quick Stats Banner - Compact */}
            <div className="grid grid-cols-4 gap-4">
                <CompactStat icon={<Activity className="w-4 h-4" />} label="الإجمالي" value={stats.total} color="blue" />
                <CompactStat icon={<CheckCircle2 className="w-4 h-4" />} label="النشطة" value={stats.active} color="emerald" />
                <CompactStat icon={<AlertTriangle className="w-4 h-4" />} label="المنتهية" value={stats.expired} color="amber" />
                <CompactStat icon={<Users className="w-4 h-4" />} label="الأعضاء" value={stats.membersTotal} color="indigo" />
            </div>

            {/* Main Table - Compact Style */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-display-premium">
                        <thead className="table-header-premium">
                            <tr>
                                <th className="px-4 py-4 text-center w-12 first:rounded-tr-2xl border-l border-white/5 last:border-l-0">#</th>
                                <th className="px-4 py-4 text-right border-l border-white/5 last:border-l-0">اسم الفرع</th>
                                <th className="px-4 py-4 text-right border-l border-white/5 last:border-l-0">الموقع</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الجوال</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الأعضاء</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الانتهاء</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-4 py-4 text-center w-24 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الخيارات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={8} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto opacity-20" /></td></tr>
                            ) : paginatedClubs.map((club, idx) => (
                                <tr key={club.id} className="table-row-premium group">
                                    <td className="px-4 py-2 text-center text-[11px] font-bold text-gray-400 border-l border-gray-100/20 last:border-l-0">{(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}</td>
                                    <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center font-black text-[10px]">{club.name?.charAt(0)}</div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-black leading-none table-cell-premium">{club.name}</span>
                                                <span className="text-[9px] font-bold text-gray-400 mt-1">{club.subscriptionPlan}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-[11px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium opacity-70">{club.location || '---'}</td>
                                    <td className="px-4 py-2 text-center text-[11px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium" dir="ltr">{club.phone || '---'}</td>
                                    <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                        <span className="inline-flex px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-lg text-[10px] font-black">
                                            {club.membersCount} عـضو
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-center text-[11px] font-bold border-l border-gray-100/20 last:border-l-0 table-cell-premium">
                                        <span className={club.isExpired ? 'text-red-500' : 'text-emerald-500'}>{club.expiryDate || '---'}</span>
                                    </td>
                                    <td className="px-4 py-2 text-center border-l border-gray-100/20 last:border-l-0">
                                        <button onClick={() => toggleStatus(club)} className={`px-2 py-0.5 rounded-full text-[9px] font-black ${club.status === 'نشط' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            {club.status}
                                        </button>
                                    </td>
                                    <td className="px-4 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openEditModal(club)} className="w-8 h-8 flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-blue-100 dark:border-blue-900/30 group/btn active:scale-90" title="تعديل"><Edit3 className="w-4 h-4 icon-glow" /></button>
                                            <button onClick={() => handleDelete(club.id)} className="w-8 h-8 flex items-center justify-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white rounded-xl shadow-sm transition-all border border-rose-100 dark:border-rose-900/30 group/btn active:scale-90" title="حذف"><Trash2 className="w-4 h-4 icon-glow" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Modern & compact */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden"
                        >
                            <div className="bg-[#1e40af] p-5 text-white flex justify-between items-center">
                                <h3 className="text-sm font-black flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    {editingClub ? 'تعديل بيانات الفرع' : 'إضافة فرع جديد'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="hover:bg-white/20 p-1 rounded-lg"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            <form onSubmit={handleSave} className="p-8 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="اسم الفرع *" value={form.name} onChange={(v: string) => setForm({ ...form, name: v })} icon={<Building className="w-3.5 h-3.5" />} />
                                    <InputField label="الموقع" value={form.location} onChange={(v: string) => setForm({ ...form, location: v })} icon={<MapPin className="w-3.5 h-3.5" />} />
                                    <InputField label="الجوال" value={form.phone} onChange={(v: string) => setForm({ ...form, phone: v })} icon={<Phone className="w-3.5 h-3.5" />} type="tel" />
                                    <InputField label="البريد الإلكتروني" value={form.email} onChange={(v: string) => setForm({ ...form, email: v })} icon={<Activity className="w-3.5 h-3.5" />} type="email" />

                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-2">الباقة</label>
                                        <select value={form.subscriptionPlan} onChange={e => setForm({ ...form, subscriptionPlan: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all">
                                            <option>أساسي</option><option>متقدم</option><option>احترافي</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-2">تاريخ الانتهاء</label>
                                        <DatePicker value={form.expiryDate} onChange={v => setForm({ ...form, expiryDate: v })} className="w-full text-xs font-black bg-slate-50" />
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-300 dark:border-slate-800 space-y-4">
                                    <h4 className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-2"><Shield className="w-3.5 h-3.5 text-indigo-600" /> بيانات مدير الفرع</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InputField label="اسم المدير" value={form.managerName} onChange={(v: string) => setForm({ ...form, managerName: v })} />
                                        <InputField label="اسم المستخدم" value={form.managerUsername} onChange={(v: string) => setForm({ ...form, managerUsername: v })} />
                                        <div className="col-span-2">
                                            <InputField label="كلمة المرور" value={form.managerPassword} onChange={(v: string) => setForm({ ...form, managerPassword: v })} type="text" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4 sticky bottom-0 bg-white dark:bg-slate-900">
                                    <button type="submit" className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-2xl font-black text-sm flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإغلاق
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-2xl font-black text-sm">إلغاء</button>
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
                title="حذف الفرع"
                message="هل أنت متأكد من رغبتك في حذف هذا الفرع؟ سيؤدي ذلك لإزالة كافة بياناته وكافة المجموعات التابعة له نهائياً."
            />
        </div>
    );
}

function CompactStat({ icon, label, value, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        amber: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400',
        indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400'
    };
    return (
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-300 dark:border-slate-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>{icon}</div>
            <div>
                <p className="text-[14px] font-black text-slate-900 dark:text-white leading-none">{value}</p>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">{label}</p>
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, icon, type = "text" }: any) {
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-2">{label}</label>
            <div className="relative">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300">{icon}</div>}
                <input
                    type={type}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner"
                />
            </div>
        </div>
    );
}
