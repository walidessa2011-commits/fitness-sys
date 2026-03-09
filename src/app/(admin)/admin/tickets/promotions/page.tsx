"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import {
    PlusCircle, Edit3, Trash2, Tag, Percent, Calendar, ToggleRight,
    Search, Loader2, Save, X, Info, CheckCircle2, XCircle, Gift, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';
import DeleteModal from '@/components/DeleteModal';

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<any[]>([]);
    const [prices, setPrices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromotion, setEditingPromotion] = useState<any>(null);
    const [clubId, setClubId] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        priceId: '',
        discountPercent: '0',
        extraDays: '0',
        acceptPause: true,
        status: 'نشط',
        clubId: ''
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (user?.clubId) {
            setClubId(user.clubId);
            setFormData(prev => ({ ...prev, clubId: user.clubId! }));
        }
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [promoData, priceData] = await Promise.all([
                db.getAll('promotions'),
                db.getAll('subscription_prices')
            ]);
            setPromotions(promoData || []);
            setPrices(priceData || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                discountPercent: parseFloat(formData.discountPercent) || 0,
                extraDays: parseInt(formData.extraDays) || 0
            };
            if (editingPromotion) {
                const result = await db.update('promotions', editingPromotion.id, data);
                if (result) {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                    loadData();
                }
            } else {
                const result = await db.add('promotions', data);
                if (result) {
                    setIsModalOpen(false);
                    setEditingPromotion(null);
                    loadData();
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openEdit = (p: any) => {
        setEditingPromotion(p);
        setFormData({
            name: p.name,
            priceId: p.priceId || '',
            discountPercent: p.discountPercent?.toString() || '0',
            extraDays: p.extraDays?.toString() || '0',
            acceptPause: p.acceptPause ?? true,
            status: p.status || 'نشط',
            clubId: p.clubId || clubId
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        setDeleteId(id);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (deleteId) {
            await db.delete('promotions', deleteId);
            setDeleteId(null);
            setIsDeleteModalOpen(false);
            loadData();
        }
    };

    const openAdd = () => {
        setEditingPromotion(null);
        setFormData({
            name: '',
            priceId: prices.length > 0 ? prices[0].id : '',
            discountPercent: '0',
            extraDays: '0',
            acceptPause: true,
            status: 'نشط',
            clubId: clubId
        });
        setIsModalOpen(true);
    };

    const filteredPromotions = promotions.filter(p =>
        (p.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-rose-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Gift className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">العروض الترويجية</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إدارة عروض الخصم والباقات الموسمية</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group hidden md:block">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
                        <input
                            type="text"
                            placeholder="بحث في العروض..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-bold outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-rose-500/20 transition-all dark:text-white w-48 shadow-inner"
                        />
                    </div>
                    <button onClick={openAdd} className="bg-blue-600 hover:bg-rose-700 text-white px-6 py-2 rounded-xl font-black text-[11px] shadow-md transition-all flex items-center gap-1.5 focus:scale-95 active:scale-90">
                        <PlusCircle className="w-4 h-4 icon-glow" />
                        <span>إضافة عرض جديد</span>
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse text-[11px]">
                        <thead className="bg-indigo-600 dark:bg-indigo-700 text-white shadow-md dark: dark:/90 dark: dark: dark: dark: dark: text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="px-5 py-4 text-right first:rounded-tr-2xl border-l border-white/5 last:border-l-0">اسم العرض</th>
                                <th className="px-5 py-4 text-right border-l border-white/5 last:border-l-0">اسم الاشتراك</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">قيمة الاشتراك</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">الضريبة</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">قبل العرض</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">الخصم %</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">أيام زيادة</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">توقف</th>
                                <th className="px-5 py-4 text-center border-l border-white/5 last:border-l-0">الحالة</th>
                                <th className="px-5 py-4 text-center last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الخيارات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={10} className="py-20 text-center border-l border-gray-100/20 last:border-l-0"><Loader2 className="w-8 h-8 animate-spin text-rose-600 mx-auto opacity-20" /></td></tr>
                            ) : filteredPromotions.length > 0 ? (
                                filteredPromotions.map((p) => {
                                    const priceItem = prices.find(pr => pr.id === p.priceId);
                                    const originalPrice = priceItem?.price || 0;
                                    const vat = 15; // static 15% as per system pattern or dynamic if we find it
                                    const totalBefore = originalPrice * (1 + vat / 100);

                                    return (
                                        <tr key={p.id} className="group hover:bg-emerald-50/60 hover:shadow-[inset_-3px_0_0_0_#10b981] dark:hover:bg-emerald-950/40 dark:hover:shadow-[inset_-3px_0_0_0_#34d399] hover:shadow-[inset_-3px_0_0_0_#10b981] transition-colors cursor-pointer transition-all">
                                            <td className="px-5 py-3 font-black text-slate-900 dark:text-white border-l border-gray-100/20 last:border-l-0">{p.name}</td>
                                            <td className="px-5 py-3 text-gray-500 border-l border-gray-100/20 last:border-l-0">{priceItem?.subscriptionName || '---'}</td>
                                            <td className="px-5 py-3 text-center font-bold border-l border-gray-100/20 last:border-l-0">{originalPrice.toFixed(2)}</td>
                                            <td className="px-5 py-3 text-center text-gray-400 font-bold border-l border-gray-100/20 last:border-l-0">{vat}%</td>
                                            <td className="px-5 py-3 text-center font-black text-blue-600 border-l border-gray-100/20 last:border-l-0">{totalBefore.toFixed(2)}</td>
                                            <td className="px-5 py-3 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded-lg font-black">{p.discountPercent}%</span>
                                            </td>
                                            <td className="px-5 py-3 text-center font-bold text-emerald-600 border-l border-gray-100/20 last:border-l-0">+{p.extraDays}</td>
                                            <td className="px-5 py-3 text-center border-l border-gray-100/20 last:border-l-0">
                                                {p.acceptPause ? <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" /> : <XCircle className="w-4 h-4 text-rose-300 mx-auto" />}
                                            </td>
                                            <td className="px-5 py-3 text-center border-l border-gray-100/20 last:border-l-0">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${p.status === 'نشط' ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-3 border-l border-gray-100/20 last:border-l-0">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr><td colSpan={10} className="py-20 text-center text-gray-400 font-bold italic border-l border-gray-100/20 last:border-l-0">لا توجد عروض ترويجية مسجلة</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden"
                        >
                            <div className="bg-rose-600 p-4 text-white flex justify-between items-center px-6">
                                <h3 className="text-sm font-black flex items-center gap-2">
                                    <Gift className="w-4 h-4" />
                                    {editingPromotion ? 'تعديل العرض' : 'إضافة عرض جديد'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="hover:bg-white/20 p-1 rounded-lg transition-colors"><X className="w-4 h-4 icon-glow" /></button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-8 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">اسم العرض الترويجي :</label>
                                    <div className="relative group">
                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                        <input
                                            required
                                            value={formData.name}
                                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 transition-all shadow-inner"
                                            placeholder="مثال: عرض اليوم الوطني"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">الباقة المستهدفة :</label>
                                    <select
                                        required
                                        value={formData.priceId}
                                        onChange={e => setFormData({ ...formData, priceId: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 transition-all shadow-inner appearance-none"
                                    >
                                        <option value="">-- اختر الباقة من القائمة --</option>
                                        {prices.map(p => (
                                            <option key={p.id} value={p.id}>{p.subscriptionName} ({p.price} ريال)</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">نسبة الخصم % :</label>
                                        <div className="relative group">
                                            <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                            <input
                                                type="number"
                                                value={formData.discountPercent}
                                                onChange={e => setFormData({ ...formData, discountPercent: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">أيام إضافية :</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-3.5 h-3.5" />
                                            <input
                                                type="number"
                                                value={formData.extraDays}
                                                onChange={e => setFormData({ ...formData, extraDays: e.target.value })}
                                                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 transition-all shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer" onClick={() => setFormData({ ...formData, acceptPause: !formData.acceptPause })}>
                                        <div className="flex items-center gap-2">
                                            <ToggleRight className={`w-4 h-4 ${formData.acceptPause ? 'text-emerald-500' : 'text-gray-300'}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">يقبل الإيقاف المؤقت</span>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full relative transition-all ${formData.acceptPause ? 'bg-emerald-600' : 'bg-gray-200'}`}>
                                            <motion.div animate={{ x: formData.acceptPause ? -16 : 0 }} className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl cursor-pointer" onClick={() => setFormData({ ...formData, status: formData.status === 'نشط' ? 'غير نشط' : 'نشط' })}>
                                        <div className="flex items-center gap-2">
                                            <ToggleRight className={`w-4 h-4 ${formData.status === 'نشط' ? 'text-emerald-500' : 'text-rose-500'}`} />
                                            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">حالة العرض (مفعل)</span>
                                        </div>
                                        <div className={`w-10 h-6 rounded-full relative transition-all ${formData.status === 'نشط' ? 'bg-emerald-600' : 'bg-rose-500'}`}>
                                            <motion.div animate={{ x: formData.status === 'نشط' ? -16 : 0 }} className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <button type="submit" className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3 rounded-xl font-black text-[11px] transition-all flex items-center justify-center gap-2 shadow-lg">
                                        <Save className="w-4 h-4 icon-glow" /> حفظ وإغلاق
                                    </button>
                                    <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[11px] hover:bg-gray-200 transition-all">إلغاء</button>
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
                title="حذف العرض الترويجي"
                message="هل أنت متأكد من رغبتك في حذف هذا العرض الترويجي؟ لا يمكن التراجع عن هذا الإجراء."
                confirmText="نعم، حذف العرض"
                icon={<Trash2 className="w-6 h-6 relative z-10" />}
            />
        </div>
    );
}
