"use client";

import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    XCircle,
    Loader2,
    Lock,
    ShieldCheck,
    Eye,
    EyeOff,
    RefreshCw,
    ShieldAlert,
    Save,
    KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User as UserType } from '@/lib/auth';

export default function ChangePasswordPage() {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(false);

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');

        if (!user) return;

        if (!currentPassword || !newPassword || !confirmPassword) {
            setErrorMsg('يرجى تعبئة جميع الحقول المطلوبة.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMsg('كلمة المرور الجديدة غير متطابقة.');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMsg('كلمة المرور الجديدة يجب أن تكون 6 أحرف أو أكثر.');
            return;
        }

        setLoading(true);
        try {
            const dbUser = await db.getById('users', user.id);
            if (dbUser && dbUser.password !== currentPassword && dbUser.password) {
                setErrorMsg('كلمة المرور الحالية غير صحيحة.');
                setLoading(false);
                return;
            }

            await db.update('users', user.id, { password: newPassword });

            setSuccessMsg('تم تغيير كلمة المرور بنجاح.');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            console.error(error);
            setErrorMsg('حدث خطأ أثناء الاتصال بقاعدة البيانات.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-2xl mx-auto pt-4" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">تعديل كلمة المرور</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحسين أمان الحساب وإدارة المفاتيح السرية</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
                    <div className="bg-amber-50 dark:bg-amber-900/10 px-3 py-1.5 rounded-xl border border-amber-100 dark:border-amber-900/20 flex items-center gap-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-none">إجراء أمني</span>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-300 dark:border-slate-800">
                <AnimatePresence mode="wait">
                    {errorMsg && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4">
                            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 rounded-xl text-xs font-black italic">
                                <XCircle className="w-4 h-4 icon-glow" />
                                {errorMsg}
                            </div>
                        </motion.div>
                    )}
                    {successMsg && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="mb-4">
                            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-xs font-black italic">
                                <CheckCircle2 className="w-4 h-4 icon-glow" />
                                {successMsg}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">كلمة المرور الحالية *</label>
                        <div className="relative group">
                            <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                required
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={e => setCurrentPassword(e.target.value)}
                                className="w-full pr-10 pl-11 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-amber-500/30 transition-all shadow-inner font-mono"
                                placeholder="••••••••"
                            />
                            <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-amber-500 transition-colors">
                                {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">كلمة المرور الجديدة *</label>
                            <div className="relative group">
                                <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    required
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={e => setNewPassword(e.target.value)}
                                    className="w-full pr-10 pl-11 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner font-mono"
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-500 transition-colors">
                                    {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">تأكيد كلمة المرور *</label>
                            <div className="relative group">
                                <ShieldCheck className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-emerald-500 transition-colors" />
                                <input
                                    required
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={e => setConfirmPassword(e.target.value)}
                                    className={`w-full pr-10 pl-11 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ${confirmPassword && confirmPassword !== newPassword ? 'ring-red-500/50' : 'ring-gray-300 dark:ring-slate-700'} focus:ring-2 focus:ring-emerald-500/30 transition-all shadow-inner font-mono`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-500 transition-colors">
                                    {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-gray-200 dark:border-slate-800 flex flex-col items-center">
                        <div className="w-full flex justify-between items-center mb-6 px-2">
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">الطول الآمن (6+)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${confirmPassword && confirmPassword === newPassword ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">تطابق الحقول</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                            className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[11px] uppercase tracking-widest shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30"
                        >
                            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 icon-glow" />}
                            <span>{loading ? 'جاري تحديث المفاتيح...' : 'تحديث كلمة المرور الآن'}</span>
                        </button>
                    </div>
                </form>
            </div>

            <div className="bg-amber-50/50 dark:bg-amber-900/10 p-4 rounded-2xl border border-dashed border-amber-200 dark:border-amber-900/30 text-center">
                <p className="text-[9px] font-black text-amber-700 dark:text-amber-500 uppercase tracking-[0.1em]">تنبيه أمني: سيتم إنهاء الجلسة في كافة الأجهزة المتصلة بعد تغيير كلمة المرور.</p>
            </div>
        </div>
    );
}
