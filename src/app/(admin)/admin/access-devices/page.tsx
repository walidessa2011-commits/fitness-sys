"use client";

import React, { useState, useEffect } from 'react';
import {
    Cpu,
    PlusCircle,
    Edit2,
    Trash2,
    RefreshCcw,
    Search,
    Loader2,
    CheckCircle2,
    XCircle,
    Globe,
    Lock,
    Key,
    Monitor,
    LayoutGrid,
    Signal,
    Save,
    X,
    Server,
    Zap,
    Activity,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import DeleteModal from '@/components/DeleteModal';

export default function AccessDevicesPage() {
    const router = useRouter();
    const [devices, setDevices] = useState<any[]>([]);
    const [halls, setHalls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<any>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        hallId: '',
        deviceName: '',
        ipAddress: '',
        serialNo: '',
        terminalId: '',
        port: 80,
        password: '',
        isMainEntry: false,
        isAccessDevice: true,
        hasFacePrint: false,
        status: 'مفعل'
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        loadData(user.clubId);
    }, [router]);

    async function loadData(clubId?: string) {
        if (!clubId) return;
        setLoading(true);
        try {
            const [devicesData, hallsData] = await Promise.all([
                db.getByClub('access_devices', clubId),
                db.getByClub('halls', clubId)
            ]);
            setDevices(devicesData || []);
            setHalls(hallsData || []);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    }

    const openModal = (device?: any) => {
        if (device) {
            setEditingDevice(device);
            setFormData({
                hallId: device.hallId || '',
                deviceName: device.deviceName,
                ipAddress: device.ipAddress || '',
                serialNo: device.serialNo || '',
                terminalId: device.terminalId || '',
                port: device.port || 80,
                password: device.password || '',
                isMainEntry: device.isMainEntry || false,
                isAccessDevice: device.isAccessDevice ?? true,
                hasFacePrint: device.hasFacePrint || false,
                status: device.status || 'مفعل'
            });
        } else {
            setEditingDevice(null);
            setFormData({
                hallId: '',
                deviceName: '',
                ipAddress: '',
                serialNo: '',
                terminalId: '',
                port: 80,
                password: '',
                isMainEntry: false,
                isAccessDevice: true,
                hasFacePrint: false,
                status: 'مفعل'
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const clubId = auth.getCurrentUser()?.clubId;
            const data = { ...formData, clubId };

            if (editingDevice) {
                await db.update('access_devices', editingDevice.id, data);
            } else {
                await db.add('access_devices', data);
            }
            setIsModalOpen(false);
            loadData(clubId);
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء الحفظ');
        }
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            try {
                await db.delete('access_devices', deleteId);
                setDevices(prev => prev.filter(d => d.id !== deleteId));
                setDeleteId(null);
                setIsDeleteModalOpen(false);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const filteredDevices = devices.filter(d =>
        d.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.ipAddress && d.ipAddress.includes(searchQuery))
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة أجهزة الوصول والتبصيم</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">التحكم في بوابات الدخول وأجهزة الحضور الذكية</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 hover:text-blue-600 transition-all">
                        <Activity className="w-4 h-4 icon-glow" />
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="btn-premium btn-premium-blue bg-blue-600 dark:bg-blue-600 px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                    >
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة جهاز جديد</span>
                    </button>
                </div>
            </div>

            {/* Filter & Search Bar - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-3 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                    <input
                        type="text"
                        placeholder="ابحث عن جهاز بالاسم أو عنوان IP..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pr-9 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 border-r pr-3 border-gray-300 dark:border-slate-800">
                    <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">إجمالي الأجهزة: <span className="text-blue-600">{devices.length}</span></div>
                    <button onClick={() => loadData(auth.getCurrentUser()?.clubId)} className="p-2 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-400 hover:text-blue-600 transition-all">
                        <RefreshCcw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Devices Table - Ultra Compact */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-separate border-spacing-0">
                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-4 py-4 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">الجهاز</th>
                                <th className="px-4 py-4 text-right border-l border-white/5 last:border-l-0">الصالة</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">عنوان IP</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">المنفذ</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الخصائص</th>
                                <th className="px-4 py-4 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-4 py-4 text-center w-0 last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800/50">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center border-l border-gray-100/20 last:border-l-0">
                                        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto opacity-30" />
                                    </td>
                                </tr>
                            ) : filteredDevices.length > 0 ? (
                                filteredDevices.map((d) => {
                                    const hall = halls.find(h => h.id === d.hallId);
                                    return (
                                        <tr key={d.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-all cursor-pointer">
                                            <td className="px-4 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100 dark:border-blue-900/20">
                                                        <Signal className="w-4 h-4" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-[12px] font-black text-slate-900 dark:text-white leading-tight group-hover:text-emerald-600 transition-colors uppercase">{d.deviceName}</span>
                                                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter mt-0.5">SN: {d.serialNo || '---'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-[10px] font-bold text-gray-500 dark:text-slate-400 border-l border-gray-100/20 last:border-l-0">
                                                {hall?.name || '---'}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-mono italic border-l border-gray-100/20 last:border-l-0">
                                                {d.ipAddress || '---'}
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-[10px] font-bold text-gray-500 border-l border-gray-100/20 last:border-l-0">
                                                {d.port}
                                            </td>
                                            <td className="px-4 py-2.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-1">
                                                    {d.isMainEntry && <MiniBadge label="رئيسي" color="blue" />}
                                                    {d.isAccessDevice && <MiniBadge label="دخول" color="emerald" />}
                                                    {d.hasFacePrint && <MiniBadge label="وجه" color="amber" />}
                                                </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-[9px] font-black uppercase border-l border-gray-100/20 last:border-l-0">
                                                {d.status === 'مفعل' ?
                                                    <span className="text-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30">نشط</span> :
                                                    <span className="text-rose-500 bg-rose-50/50 dark:bg-rose-900/20 px-2 py-0.5 rounded-lg border border-rose-100 dark:border-rose-900/30">معطل</span>
                                                }
                                            </td>
                                            <td className="px-4 py-2.5 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-1.5 opacity-60 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => openModal(d)} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all">
                                                        <Edit2 className="w-3.5 h-3.5" />
                                                    </button>
                                                    <button onClick={() => handleDelete(d.id)} className="p-1.5 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan={7} className="py-24 text-center text-gray-300 italic text-xs border-l border-gray-100/20 last:border-l-0">لا يوجد أجهزة مسجلة حالياً</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Ultra Compact */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl relative overflow-hidden border border-gray-300 dark:border-slate-800">
                            <div className="bg-blue-600 p-6 flex items-center justify-between text-white">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner"><Server className="w-5 h-5" /></div>
                                    <div>
                                        <h3 className="text-sm font-black uppercase tracking-tighter">{editingDevice ? 'تعديل بيانات الجهاز' : 'تسجيل جهاز وصول جديد'}</h3>
                                        <p className="text-[9px] text-blue-100 font-bold uppercase tracking-widest mt-0.5">إعدادات الهوية والاتصال الشبكي للجهاز</p>
                                    </div>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-black/10 flex items-center justify-center hover:bg-black/20 transition-all font-bold">×</button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">اسم الصالة *</label>
                                        <select
                                            required
                                            value={formData.hallId}
                                            onChange={(e) => setFormData({ ...formData, hallId: e.target.value })}
                                            className="w-full p-2.5 px-4 bg-slate-50/50 dark:bg-slate-800/50 border-none ring-1 ring-gray-300 dark:ring-slate-700/50 rounded-xl text-xs font-black dark:text-white focus:ring-2 focus:ring-blue-500/30 outline-none transition-all appearance-none cursor-pointer shadow-inner"
                                        >
                                            <option value="">---- اختر الصالة المرتبطة ----</option>
                                            {halls.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">اسم الجهاز *</label>
                                        <div className="relative group">
                                            <Monitor className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input required value={formData.deviceName} onChange={e => setFormData({ ...formData, deviceName: e.target.value })} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner placeholder:font-normal placeholder:opacity-50" placeholder="ZKTeco Main Entrance" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">IP Address *</label>
                                        <div className="relative group">
                                            <Globe className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input required value={formData.ipAddress} onChange={e => setFormData({ ...formData, ipAddress: e.target.value })} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all font-mono italic shadow-inner" placeholder="192.168.1.100" />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">Port *</label>
                                        <input required type="number" value={formData.port} onChange={e => setFormData({ ...formData, port: parseInt(e.target.value) })} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner" placeholder="4370" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">كلمة المرور *</label>
                                        <div className="relative group">
                                            <Key className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                            <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full pr-10 pl-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner" placeholder="••••••••" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-2">
                                    <SwitchItem label="المدخل الرئيسي" checked={formData.isMainEntry} onChange={v => setFormData({ ...formData, isMainEntry: v })} icon={<LayoutGrid className="w-3 h-3" />} />
                                    <SwitchItem label="جهاز دخول" checked={formData.isAccessDevice} onChange={v => setFormData({ ...formData, isAccessDevice: v })} icon={<Zap className="w-3 h-3" />} />
                                    <SwitchItem label="بصمة وجه" checked={formData.hasFacePrint} onChange={v => setFormData({ ...formData, hasFacePrint: v })} icon={<Shield className="w-3 h-3" />} />
                                    <SwitchItem label="حالة الجهاز" checked={formData.status === 'مفعل'} onChange={v => setFormData({ ...formData, status: v ? 'مفعل' : 'غير مفعل' })} icon={<Activity className="w-3 h-3" />} />
                                </div>

                                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-slate-800">
                                    <button type="submit" className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-blue-100 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإعداد
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-xl font-black text-[11px] uppercase tracking-widest hover:bg-gray-100 transition-all">إغلاق</button>
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
                title="حذف جهاز الوصول"
                message="هل أنت متأكد من رغبتك في حذف هذا الجهاز؟ سيتم فصل الاتصال به تماماً."
            />
        </div>
    );
}

function MiniBadge({ label, color }: { label: string, color: 'blue' | 'emerald' | 'amber' | 'red' }) {
    const colors = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30',
        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30',
        amber: 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/30',
        red: 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
    };
    return (
        <span className={`px-1.5 py-0.5 rounded text-[8px] font-black border ${colors[color]} uppercase tracking-tighter`}>
            {label}
        </span>
    );
}

function SwitchItem({ label, checked, onChange, icon }: { label: string, checked: boolean, onChange: (v: boolean) => void, icon?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between p-2 px-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-gray-200/30 dark:border-slate-700/50 group cursor-pointer" onClick={() => onChange(!checked)}>
            <div className="flex items-center gap-2">
                <div className={`p-1 rounded-md ${checked ? 'text-blue-600 bg-blue-50/50' : 'text-gray-300'}`}>
                    {icon}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-tighter ${checked ? 'text-slate-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
            </div>
            <div className={`w-8 h-4.5 rounded-full transition-all relative ${checked ? 'bg-blue-600' : 'bg-gray-200 dark:bg-slate-700'}`}>
                <div className={`absolute top-0.5 w-3.5 h-3.5 bg-white rounded-full transition-all shadow-sm ${checked ? 'right-4' : 'right-0.5'}`} />
            </div>
        </div>
    );
}
