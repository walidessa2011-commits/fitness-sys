"use client";

import React, { useState, useEffect } from 'react';
import {
    Users,
    Search,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Shield,
    Phone,
    Mail,
    IdCard,
    DollarSign,
    MoreVertical,
    CheckCircle2,
    XCircle,
    UserCircle,
    Award,
    Dumbbell,
    TrendingUp,
    ChevronDown,
    Filter,
    LayoutGrid,
    Smartphone,
    MapPin,
    Calendar,
    Briefcase,
    Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';

interface Coach {
    id: string;
    name: string;
    phone: string;
    email: string;
    nationalId: string;
    jobRole: string;
    salary: number;
    specialty: string;
    commissionRate: number;
    certificationDetails: string;
    status: string;
    clubId: string;
    createdAt: string;
}

export default function CoachesPage() {
    const [coaches, setCoaches] = useState<Coach[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [currentCoach, setCurrentCoach] = useState<Coach | null>(null);
    const [user, setUser] = useState<any>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form states (CamelCase to match db wrapper expectations)
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        nationalId: '',
        salary: 0,
        specialty: '',
        commissionRate: 0,
        certificationDetails: '',
        status: 'نشط'
    });

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        setUser(currentUser);
        if (currentUser) {
            fetchCoaches(currentUser.clubId || null);
        }
    }, []);

    async function fetchCoaches(clubId: string | null) {
        setLoading(true);
        try {
            const allEmployees = await db.getAll('employees');
            const coachList = allEmployees.filter((emp: any) =>
                emp.jobRole === 'coach' && (!clubId || emp.clubId === clubId)
            );
            setCoaches(coachList);
        } catch (error) {
            console.error('Error fetching coaches:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        try {
            const coachData = {
                ...formData,
                jobRole: 'coach',
                clubId: user.clubId || user.club_id
            };

            if (isEditModalOpen && currentCoach) {
                await db.update('employees', currentCoach.id, coachData);
            } else {
                await db.add('employees', coachData);
            }

            fetchCoaches(user.clubId);
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            resetForm();
        } catch (error) {
            console.error('Error saving coach:', error);
            alert('حدث خطأ أثناء حفظ البيانات');
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await db.delete('employees', deleteId);
                setIsDeleteModalOpen(false);
                setDeleteId(null);
                fetchCoaches(user?.clubId);
            } catch (error) {
                console.error('Error deleting coach:', error);
            }
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            nationalId: '',
            salary: 0,
            specialty: '',
            commissionRate: 0,
            certificationDetails: '',
            status: 'نشط'
        });
        setCurrentCoach(null);
    };

    const filteredCoaches = coaches.filter(coach =>
        coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coach.phone?.includes(searchTerm) ||
        coach.specialty?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Header: High Density Dashboard Style */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Award className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">بيانات المدربين الرياضيين</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة الكفاءات الفنية والعمولات المتخصصة</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-indigo-50 dark:bg-indigo-900/10 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/20 flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest leading-none">{filteredCoaches.length} مدرب متوفر</span>
                    </div>
                    <button
                        onClick={() => { resetForm(); setIsAddModalOpen(true); }}
                        className="btn-premium btn-premium-blue px-4 py-2 rounded-xl text-[11px] font-black shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
                    >
                        <Plus className="w-4 h-4 icon-glow" />
                        <span>إضافة مدرب جديد</span>
                    </button>
                </div>
            </div>

            {/* Stats Summary - Ultra Compact */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={<Award className="w-4 h-4" />} color="indigo" label="إجمالي المدربين" value={coaches.length} />
                <StatCard icon={<CheckCircle2 className="w-4 h-4" />} color="emerald" label="المدربين النشطين" value={coaches.filter(c => c.status === 'نشط').length} />
                <StatCard icon={<TrendingUp className="w-4 h-4" />} color="amber" label="متوسط العمولات" value={`${(coaches.reduce((acc, c) => acc + (Number(c.commissionRate) || 0), 0) / (coaches.length || 1)).toFixed(1)}%`} />
                <StatCard icon={<DollarSign className="w-4 h-4" />} color="blue" label="إجمالي الرواتب" value={`${coaches.reduce((acc, c) => acc + (Number(c.salary) || 0), 0).toLocaleString()} ر.س`} />
            </div>

            {/* Tool Bar: Search & Compact Filter */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="البحث عن مدرب بالاسم، الجوال أو التخصص..."
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl pr-10 pl-4 py-2 text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                </div>
            </div>

            {/* High Density Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="table-display-premium">
                        <thead className="table-header-premium">
                            <tr>
                                <th className="px-5 py-2.5 text-right first:rounded-tr-2xl w-16 border-l border-white/5 last:border-l-0">#ID</th>
                                <th className="px-5 py-2.5 text-right border-l border-white/5 last:border-l-0">المدرب</th>
                                <th className="px-5 py-2.5 text-right border-l border-white/5 last:border-l-0">التواصل</th>
                                <th className="px-5 py-2.5 text-right border-l border-white/5 last:border-l-0">التخصص والخبرة</th>
                                <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">العمولة</th>
                                <th className="px-5 py-2.5 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-5 py-2.5 text-left last:rounded-tl-2xl border-l border-white/5 last:border-l-0">إجراءات</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto opacity-20" />
                                    </td>
                                </tr>
                            ) : filteredCoaches.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center text-gray-400 text-xs font-bold italic border-l border-gray-100/20 last:border-l-0">
                                        لا توجد بيانات مدربين مطابقة للبحث
                                    </td>
                                </tr>
                            ) : filteredCoaches.map((coach, index) => (
                                <tr key={coach.id} className="table-row-premium group cursor-pointer">
                                    <td className="px-5 py-2 text-[10px] font-mono text-gray-400 border-l border-gray-100/20 last:border-l-0">{index + 1}</td>
                                    <td className="px-5 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xs">
                                                {coach.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="text-[11px] font-black text-slate-900 dark:text-white leading-none mb-1">{coach.name}</div>
                                                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">ID: {coach.nationalId || '---'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 dark:text-slate-400">
                                                <Smartphone className="w-3 h-3 text-indigo-400" />
                                                <span>{coach.phone}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                                                <Mail className="w-3 h-3 opacity-50" />
                                                <span>{coach.email || '---'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex flex-col gap-1">
                                            <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                                                <Dumbbell className="w-3.5 h-3.5" />
                                                {coach.specialty || 'تخصص عام'}
                                            </div>
                                            <div className="text-[9px] font-bold text-gray-400 truncate max-w-[150px]">
                                                {coach.certificationDetails || 'بدون شهادات مسجلة'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className="inline-flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[10px] font-black border border-amber-100 dark:border-amber-900/30">
                                            <span>{coach.commissionRate || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-2 border-l border-gray-100/20 last:border-l-0">
                                        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${coach.status === 'نشط'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                                            }`}>
                                            <div className={`w-1 h-1 rounded-full ${coach.status === 'نشط' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                            {coach.status}
                                        </div>
                                    </td>
                                    <td className="px-5 py-3 text-left border-l border-gray-100/20 last:border-l-0">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setCurrentCoach(coach);
                                                    setFormData({
                                                        name: coach.name,
                                                        phone: coach.phone || '',
                                                        email: coach.email || '',
                                                        nationalId: coach.nationalId || '',
                                                        salary: coach.salary || 0,
                                                        specialty: coach.specialty || '',
                                                        commissionRate: coach.commissionRate || 0,
                                                        certificationDetails: coach.certificationDetails || '',
                                                        status: coach.status || 'نشط'
                                                    });
                                                    setIsEditModalOpen(true);
                                                }}
                                                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 text-indigo-500 rounded-lg transition-colors border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                                            >
                                                <Edit2 className="w-3.5 h-3.5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(coach.id)}
                                                className="p-1.5 hover:bg-white dark:hover:bg-slate-800 text-red-500 rounded-lg transition-colors border border-transparent hover:border-red-100 dark:hover:border-red-900/30"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Profile/Add Form Modal */}
            <AnimatePresence>
                {(isAddModalOpen || isEditModalOpen) && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-2xl border border-gray-300 dark:border-slate-800"
                        >
                            <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                        <Award className="w-6 h-6 text-indigo-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black">{isEditModalOpen ? 'تعديل بيانات المدرب' : 'إضافة مدرب رياضي جديد'}</h3>
                                        <p className="text-[10px] text-indigo-300 font-bold uppercase tracking-widest mt-1">تعبئة البيانات الفنية والتعاقدية للمدرب</p>
                                    </div>
                                </div>
                                <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-all">
                                    <XCircle className="w-5 h-5 text-white/50" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
                                    <InputWrapper label="الاسم الكامل المعتمد" icon={<UserCircle className="w-4 h-4" />}>
                                        <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="modern-input" placeholder="اسم المدرب الثلاثي" />
                                    </InputWrapper>

                                    <InputWrapper label="رقم الجوال (للتواصل)" icon={<Smartphone className="w-4 h-4" />}>
                                        <input required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="modern-input" placeholder="05xxxxxxxx" />
                                    </InputWrapper>

                                    <InputWrapper label="البريد الإلكتروني (اختياري)" icon={<Mail className="w-4 h-4" />}>
                                        <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="modern-input" placeholder="coach@example.com" />
                                    </InputWrapper>

                                    <InputWrapper label="رقم الهوية / الإقامة" icon={<IdCard className="w-4 h-4" />}>
                                        <input value={formData.nationalId} onChange={e => setFormData({ ...formData, nationalId: e.target.value })} className="modern-input" placeholder="1xxxxxxxxxx" />
                                    </InputWrapper>

                                    <div className="h-px bg-gray-50 dark:bg-slate-800 md:col-span-2 my-2" />

                                    <InputWrapper label="التخصص الرياضي" icon={<Dumbbell className="w-4 h-4" />} color="indigo">
                                        <input required value={formData.specialty} onChange={e => setFormData({ ...formData, specialty: e.target.value })} className="modern-input" placeholder="مثلاً: كمال أجسام، تخسيس، كاراتيه..." />
                                    </InputWrapper>

                                    <InputWrapper label="نسبة العموله (%) أو الراتب" icon={<TrendingUp className="w-4 h-4" />} color="amber">
                                        <div className="flex gap-2">
                                            <input type="number" value={formData.commissionRate} onChange={e => setFormData({ ...formData, commissionRate: Number(e.target.value) })} className="modern-input w-24" placeholder="%" />
                                            <input type="number" value={formData.salary} onChange={e => setFormData({ ...formData, salary: Number(e.target.value) })} className="modern-input flex-1" placeholder="قيمة الراتب" />
                                        </div>
                                    </InputWrapper>

                                    <InputWrapper label="الشهادات والمؤهلات" icon={<Award className="w-4 h-4" />} className="md:col-span-2">
                                        <textarea value={formData.certificationDetails} onChange={e => setFormData({ ...formData, certificationDetails: e.target.value })} className="modern-input min-h-[80px] pt-3" placeholder="تفاصيل الشهادات والخبرات العملية..." />
                                    </InputWrapper>

                                    <InputWrapper label="حالة العمل الحالية" icon={<Shield className="w-4 h-4" />}>
                                        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                                            {['نشط', 'غير نشط'].map(status => (
                                                <button key={status} type="button" onClick={() => setFormData({ ...formData, status })} className={`flex-1 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.status === status ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-white' : 'text-gray-400'}`}>
                                                    {status}
                                                </button>
                                            ))}
                                        </div>
                                    </InputWrapper>
                                </div>

                                <div className="flex items-center gap-3 justify-end pt-6 border-t border-gray-200 dark:border-slate-800">
                                    <button type="button" onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="px-6 py-3 text-[11px] font-black text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors uppercase tracking-widest">إلغاء التعديل</button>
                                    <button type="submit" className="bg-blue-600 hover:bg-blue-600 text-white px-10 py-3 rounded-2xl font-black text-[11px] shadow-xl shadow-indigo-600/20 active:scale-95 transition-all flex items-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" />
                                        <span>{isEditModalOpen ? 'تحديث بيانات المدرب' : 'تأكيد إضافة المدرب'}</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx>{`
                .modern-input {
                    width: 100%;
                    padding-right: 2.75rem;
                    padding-left: 1rem;
                    padding-top: 0.5rem;
                    padding-bottom: 0.5rem;
                    background-color: #f8fafc;
                    border: none;
                    border-radius: 0.75rem;
                    font-size: 0.75rem;
                    font-weight: 900;
                    outline: none;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
                    transition: all 0.2s;
                }
                .dark .modern-input {
                    background-color: #1e293b;
                    color: white;
                }
                .modern-input:focus {
                    background-color: white;
                    ring: 2px solid #34d399;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.1);
                }
                .dark .modern-input:focus {
                    background-color: #0f172a;
                }
            `}</style>

            <footer className="flex items-center justify-between px-2 pt-2 border-t border-gray-200 dark:border-slate-800 text-[9px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest">
                <span>© 2024 COACH_MANAGEMENT_V1</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-indigo-500" /> SYNC_OK</span>
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-amber-500" /> SECURED_TLS</span>
                </div>
            </footer>

            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="حذف بيانات المدرب"
                message="هل أنت متأكد من رغبتك في حذف بيانات هذا المدرب؟ سيتم إزالته من سجلات الموظفين نهائياً."
                confirmText="نعم، حذف المدرب"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}

function StatCard({ icon, color, label, value }: any) {
    const colorMap: any = {
        indigo: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/10 border-indigo-100 dark:border-indigo-900/20',
        emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/20',
        amber: 'text-amber-600 bg-amber-50 dark:bg-amber-900/10 border-amber-100 dark:border-amber-900/20',
        blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/20'
    };

    return (
        <div className={`p-3 rounded-2xl border flex items-center gap-3 shadow-sm ${colorMap[color]}`}>
            <div className="w-8 h-8 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-sm">
                {icon}
            </div>
            <div>
                <div className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none mb-1">{label}</div>
                <div className="text-sm font-black dark:text-white leading-none">{value}</div>
            </div>
        </div>
    );
}

function InputWrapper({ label, icon, children, className, color = "gray" }: any) {
    return (
        <div className={`space-y-1.5 ${className}`}>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">{label}</label>
            <div className="relative group">
                <div className={`absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-indigo-500 transition-colors`}>
                    {icon}
                </div>
                {children}
            </div>
        </div>
    );
}
