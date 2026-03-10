"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Dumbbell,
    User,
    Lock,
    ArrowLeft,
    ShieldCheck,
    ChevronLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth } from '@/lib/auth';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [visualOtp, setVisualOtp] = useState('');
    const [timeLeft, setTimeLeft] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        refreshOTP();

        // Check for logout success
        if (localStorage.getItem('logout_success') === 'true') {
            setSuccess('تم تسجيل الخروج بنجاح من النظام');
            localStorage.removeItem('logout_success');
            // Auto-clear message after 5 seconds
            setTimeout(() => setSuccess(''), 5000);
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    refreshOTP();
                    return 30;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const refreshOTP = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setVisualOtp(code);
        setTimeLeft(30);
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        if (otp !== visualOtp) {
            setError('كود التحقق المرئي غير صحيح');
            setLoading(false);
            refreshOTP();
            return;
        }

        const result = await auth.login(username, password);

        if (result.success && result.user) {
            setSuccess('تم التحقق بنجاح.. جاري الدخول');
            localStorage.setItem('fitness_club_session_v2', JSON.stringify(result.user));

            // Role-based redirection
            setTimeout(() => {
                const { role } = result.user!;
                if (role === 'super_admin' || role === 'club_admin') router.push('/admin/dashboard');
                else if (['receptionist', 'accountant', 'coach'].includes(role)) router.push('/admin/dashboard');
                else if (role === 'member') router.push('/member/dashboard');
            }, 1000);
        } else {
            setError(result.message || 'حدث خطأ في تسجيل الدخول');
            setLoading(false);
            refreshOTP();
            setTimeout(() => setError(''), 5000);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-950 transition-colors duration-300 font-['Tajawal',_sans-serif]">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-[420px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col border border-gray-100 dark:border-slate-800"
            >
                {/* Visual Header Section */}
                <div className="w-full bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-8 text-white flex flex-col items-center relative overflow-hidden text-center">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-32 h-32 rounded-full bg-blue-400 blur-[40px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-32 h-32 rounded-full bg-indigo-600 blur-[40px]"></div>
                    </div>

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Dumbbell className="text-white w-7 h-7" />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold mb-1">FITNESS CLUB SO</h2>
                            <p className="text-blue-100 text-[10px] font-bold opacity-80 uppercase tracking-widest">نظام إدارة الأندية المتكامل</p>
                        </div>
                    </div>
                </div>

                {/* Interaction Section */}
                <div className="w-full p-8 pt-6 bg-white dark:bg-slate-900 flex flex-col justify-center">
                    <div className="w-full">
                        <div className="mb-6 text-center">
                            <h1 className="text-xl font-extrabold text-[#0f172a] dark:text-white mb-1">
                                تسجيل <span className="text-blue-600">الدخول</span>
                            </h1>
                            <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold">يرجى إدخال بيانات الاعتماد للوصول للحساب</p>
                        </div>

                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 p-3 rounded-2xl flex items-center justify-between gap-3 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <p className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">{success}</p>
                                    </div>
                                    <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-3 rounded-2xl flex items-center justify-between gap-3 overflow-hidden"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 bg-rose-100 dark:bg-rose-800 rounded-lg flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <p className="text-[10px] font-black text-rose-700 dark:text-rose-400">{error}</p>
                                    </div>
                                    <button onClick={() => setError('')} className="text-rose-400 hover:text-rose-600 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 mr-1 uppercase tracking-wider">اسم المستخدم</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold text-center dark:text-white"
                                    />
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 w-4 h-4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1.5 mr-1 uppercase tracking-wider">كلمة المرور</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-5 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold text-center dark:text-white"
                                    />
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 w-4 h-4" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1 mr-1 uppercase tracking-wider text-center">كود التحقق المرئي</label>
                                <div className="flex gap-3">
                                    <div
                                        onClick={refreshOTP}
                                        className="flex-1 h-12 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white text-xl font-black flex items-center justify-center rounded-2xl cursor-pointer select-none tracking-[6px]"
                                    >
                                        {visualOtp}
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={4}
                                        placeholder="0000"
                                        className="w-24 px-2 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-black text-center dark:text-white"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#1e40af] hover:bg-blue-700 text-white rounded-2xl font-black shadow-lg shadow-blue-500/10 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <span>دخول للمنصة</span>
                                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                            <p className="text-[9px] font-bold text-gray-400 dark:text-slate-600 mb-4 uppercase tracking-[0.2em]">POWERED BY FITNESS CLUB SO TECHNOLOGY</p>
                            <button
                                onClick={() => router.push('/')}
                                className="inline-flex items-center gap-2 text-[10px] font-black text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors uppercase tracking-widest"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                <span>العودة للرئيسية</span>
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
