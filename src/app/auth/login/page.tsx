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
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
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
            alert('تم تسجيل الخروج بنجاح');
            localStorage.removeItem('logout_success');
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
            alert('تم تسجيل الدخول بنجاح');
            localStorage.setItem('fitness_club_session_v2', JSON.stringify(result.user));

            // Role-based redirection
            setTimeout(() => {
                const { role } = result.user!;
                if (role === 'super_admin') router.push('/admin/dashboard');
                else if (role === 'club_admin') router.push('/admin/dashboard');
                else if (['receptionist', 'accountant', 'coach'].includes(role)) router.push('/admin/dashboard');
                else if (role === 'member') router.push('/member/dashboard');
            }, 1000);
        } else {
            alert(result.message || 'حدث خطأ في تسجيل الدخول');
            setLoading(false);
            refreshOTP();
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-950 transition-colors duration-300 font-['Tajawal',_sans-serif]">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-[900px] min-h-[550px] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-gray-100 dark:border-slate-800"
            >
                {/* Left Visual Side */}
                <div className="w-full lg:w-[45%] bg-gradient-to-br from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] p-10 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] rounded-full bg-blue-400 blur-[100px]"></div>
                        <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-600 blur-[80px]"></div>
                    </div>

                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Dumbbell className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-wide">FITNESS CLUB KSA</span>
                    </div>

                    <div className="relative z-10 text-center py-10">
                        <h2 className="text-3xl font-extrabold mb-4">أهلاً بك مجدداً</h2>
                        <p className="text-blue-100 text-lg">سجل دخولك للوصول إلى أدوات الإدارة والتقارير</p>

                        <div className="mt-12 flex justify-center">
                            <motion.div
                                animate={{ rotate: [-3, 3, -3] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 w-64 transform shadow-xl"
                            >
                                <ShieldCheck className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                                <p className="text-sm font-bold">حماية ثنائية للمستأجرين</p>
                                <p className="text-[10px] text-blue-200 mt-2">بياناتك مشفرة ومنعزلة تماماً</p>
                            </motion.div>
                        </div>
                    </div>

                    <div className="relative z-10">
                        <p className="text-xs text-blue-200 opacity-80">نظام إدارة النوادي الرياضية المتكامل</p>
                    </div>
                </div>

                {/* Right Interaction Side */}
                <div className="w-full lg:w-[55%] p-6 lg:p-10 bg-white dark:bg-slate-900 flex flex-col justify-center">
                    <div className="max-w-[360px] mx-auto w-full">
                        <div className="mb-8 text-center lg:text-right">
                            <h1 className="text-2xl font-extrabold text-[#0f172a] dark:text-white mb-2">
                                تسجيل <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">الدخول</span>
                            </h1>
                            <p className="text-gray-400 dark:text-slate-500 text-xs">يرجى إدخال بيانات الاعتماد للوصول للحساب</p>
                        </div>



                        <form onSubmit={handleLogin} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-2 mr-1">اسم المستخدم / رقم الهوية</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold text-center dark:text-white"
                                    />
                                    <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-600 dark:text-slate-400 mb-2 mr-1">كلمة المرور</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full px-5 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm font-bold text-center dark:text-white"
                                    />
                                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-600 w-5 h-5" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-500 dark:text-slate-500 mb-1 mr-1">كود التحقق المرئي</label>
                                <div className="flex gap-3">
                                    <div
                                        onClick={refreshOTP}
                                        className="flex-1 bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] text-white text-2xl font-black flex items-center justify-center rounded-2xl cursor-pointer select-none tracking-[4px]"
                                    >
                                        {visualOtp}
                                    </div>
                                    <input
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                        maxLength={4}
                                        placeholder="كود"
                                        className="w-24 px-2 py-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg font-black text-center dark:text-white"
                                    />
                                </div>
                                <div className="mt-2 flex items-center justify-between px-1">
                                    <span className="text-[10px] font-bold text-red-500">تحديث خلال {timeLeft}ث</span>
                                    <div className="w-32 bg-gray-100 dark:bg-slate-800 rounded-full h-1 overflow-hidden">
                                        <motion.div
                                            initial={{ width: "100%" }}
                                            animate={{ width: `${(timeLeft / 30) * 100}%` }}
                                            className="h-full bg-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-[#0f172a] dark:bg-blue-600 hover:bg-[#1e293b] dark:hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-gray-200 dark:shadow-none transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 disabled:opacity-70"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <span>دخول للمنصة</span>
                                        <ArrowLeft className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 pt-6 border-t border-gray-100 dark:border-slate-800 text-center">
                            <p className="text-[10px] text-gray-400 dark:text-slate-600 mb-4">جميع الحقوق محفوظة &copy; 2026</p>
                            <button
                                onClick={() => router.push('/')}
                                className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 transition-colors"
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
