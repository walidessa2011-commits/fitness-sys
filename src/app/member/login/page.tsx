"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Fingerprint,
    Lock,
    ArrowLeft,
    Loader2,
    CheckCircle2,
    AlertCircle,
    X,
    Dumbbell,
    Shield,
    Eye,
    EyeOff,
    ChevronLeft,
    Smartphone,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';

export default function MemberLoginPage() {
    const router = useRouter();
    const [nationalId, setNationalId] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [step, setStep] = useState<'id' | 'password'>('id');
    const [memberName, setMemberName] = useState('');
    const [memberPhoto, setMemberPhoto] = useState('');

    useEffect(() => {
        // Check if already logged in as member
        const session = localStorage.getItem('member_session');
        if (session) {
            router.push('/member/dashboard');
        }
    }, []);

    const handleCheckId = async () => {
        setError('');
        if (!nationalId || nationalId.length < 5) {
            setError('الرجاء إدخال رقم الهوية بشكل صحيح');
            return;
        }
        setLoading(true);

        try {
            const { data, error: dbError } = await supabase
                .from('members')
                .select('id, name, national_id, phone, photo, member_password, club_id, status')
                .eq('national_id', nationalId)
                .single();

            if (dbError || !data) {
                setError('رقم الهوية غير مسجل في النظام');
                setLoading(false);
                return;
            }

            if (!data.member_password) {
                setError('لم يتم تفعيل حسابك بعد، يرجى مراجعة إدارة النادي');
                setLoading(false);
                return;
            }

            setMemberName(data.name);
            setMemberPhoto(data.photo || '');
            setStep('password');
        } catch (e) {
            setError('حدث خطأ أثناء التحقق');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        setError('');
        if (!password) {
            setError('الرجاء إدخال كلمة المرور');
            return;
        }
        setLoading(true);

        try {
            const { data, error: dbError } = await supabase
                .from('members')
                .select('*')
                .eq('national_id', nationalId)
                .eq('member_password', password)
                .single();

            if (dbError || !data) {
                setError('كلمة المرور غير صحيحة');
                setLoading(false);
                return;
            }

            if (data.status === 'مجمد') {
                setError('عضويتك مجمدة حالياً، يرجى مراجعة إدارة النادي');
                setLoading(false);
                return;
            }

            // Convert snake_case to camelCase for the session
            const memberSession = {
                id: data.id,
                name: data.name,
                nationalId: data.national_id,
                phone: data.phone,
                email: data.email,
                photo: data.photo,
                clubId: data.club_id,
                membershipNumber: data.membership_number,
                gender: data.gender,
                vip: data.vip,
                status: data.status
            };

            setSuccess('تم التحقق بنجاح.. جاري الدخول');
            localStorage.setItem('member_session', JSON.stringify(memberSession));

            setTimeout(() => {
                router.push('/member/dashboard');
            }, 1200);
        } catch (e) {
            setError('حدث خطأ أثناء تسجيل الدخول');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-[#0a1628] to-slate-950 font-['Tajawal',_sans-serif] relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-600/5 rounded-full blur-[140px]" />
            </div>

            {/* Grid pattern overlay */}
            <div className="absolute inset-0 opacity-[0.02]"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.5) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-[380px] relative z-10"
            >
                {/* Status Bar Mockup */}
                <div className="flex items-center justify-between px-6 pb-4 text-white/40 text-[10px] font-bold">
                    <div className="flex items-center gap-1">
                        <Smartphone className="w-3 h-3" />
                        <span>Member App</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                            <div className="w-1 h-2 bg-white/30 rounded-full" />
                            <div className="w-1 h-2.5 bg-white/40 rounded-full" />
                            <div className="w-1 h-3 bg-white/50 rounded-full" />
                            <div className="w-1 h-3.5 bg-white/70 rounded-full" />
                        </div>
                    </div>
                </div>

                {/* Main Card */}
                <div className="bg-white/[0.05] backdrop-blur-2xl rounded-[2.5rem] border border-white/[0.08] shadow-2xl shadow-black/40 overflow-hidden">

                    {/* Header Glow Bar */}
                    <div className="h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-60" />

                    {/* Content Section */}
                    <div className="p-8 pt-10">
                        {/* Logo & Title */}
                        <div className="text-center mb-10">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl shadow-blue-600/30 border border-blue-500/20 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10" />
                                <img src="/logo.png" alt="Logo" className="w-12 h-12 object-contain relative z-10" />
                            </motion.div>
                            <h1 className="text-2xl font-extrabold text-white mb-2 tracking-tight">
                                بوابة <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">الأعضاء</span>
                            </h1>
                            <p className="text-white/30 text-[11px] font-bold">
                                سجّل دخولك باستخدام رقم الهوية وكلمة المرور
                            </p>
                        </div>

                        {/* Notifications */}
                        <AnimatePresence>
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-2xl flex items-center justify-between gap-3 overflow-hidden"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-emerald-500/20 rounded-xl flex items-center justify-center text-emerald-400 shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <p className="text-[11px] font-black text-emerald-400">{success}</p>
                                    </div>
                                </motion.div>
                            )}

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
                                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                    className="bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-2xl flex items-center justify-between gap-3 overflow-hidden"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-rose-500/20 rounded-xl flex items-center justify-center text-rose-400 shrink-0">
                                            <AlertCircle className="w-4 h-4" />
                                        </div>
                                        <p className="text-[11px] font-black text-rose-400">{error}</p>
                                    </div>
                                    <button onClick={() => setError('')} className="text-rose-400/50 hover:text-rose-400 transition-colors shrink-0">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence mode="wait">
                            {step === 'id' ? (
                                <motion.div
                                    key="step-id"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* National ID Input */}
                                    <div className="mb-6">
                                        <label className="block text-[10px] font-black text-white/30 mb-2.5 mr-1 uppercase tracking-widest">
                                            رقم الهوية الوطنية
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-400 transition-colors">
                                                <Fingerprint className="w-5 h-5" />
                                            </div>
                                            <input
                                                type="tel"
                                                value={nationalId}
                                                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                                                maxLength={10}
                                                placeholder="10xxxxxxxx"
                                                dir="ltr"
                                                className="w-full pr-14 pl-5 py-4.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all text-lg font-black text-center text-white placeholder-white/15 tracking-[0.15em] font-mono"
                                                onKeyDown={(e) => e.key === 'Enter' && handleCheckId()}
                                                autoFocus
                                            />
                                        </div>
                                        <p className="text-[9px] font-bold text-white/15 mt-2 text-center">
                                            أدخل رقم الهوية المسجل في ملفك بالنادي
                                        </p>
                                    </div>

                                    {/* Submit Button */}
                                    <button
                                        onClick={handleCheckId}
                                        disabled={loading || nationalId.length < 5}
                                        className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <span>التالي</span>
                                                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="step-password"
                                    initial={{ opacity: 0, x: 30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -30 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {/* Member Preview Card */}
                                    <div className="flex items-center gap-4 p-4 bg-white/[0.04] rounded-2xl border border-white/[0.06] mb-6">
                                        <div className="w-14 h-14 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-white/10 flex items-center justify-center shrink-0">
                                            {memberPhoto ? (
                                                <img src={memberPhoto} className="w-full h-full object-cover" alt={memberName} />
                                            ) : (
                                                <span className="text-xl font-black text-blue-400">{memberName.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0" dir="rtl">
                                            <div className="text-sm font-extrabold text-white truncate">{memberName}</div>
                                            <div className="text-[10px] font-bold text-white/30 font-mono tracking-wider" dir="ltr">{nationalId}</div>
                                        </div>
                                        <button
                                            onClick={() => { setStep('id'); setPassword(''); setError(''); }}
                                            className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-white/30 hover:text-white/60 transition-all shrink-0"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Password Input */}
                                    <div className="mb-6">
                                        <label className="block text-[10px] font-black text-white/30 mb-2.5 mr-1 uppercase tracking-widest">
                                            كلمة المرور
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500/50 group-focus-within:text-blue-400 transition-colors">
                                                <Lock className="w-5 h-5" />
                                            </div>
                                            <input
                                                type={showPassword ? "text" : "password"}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="أدخل كلمة المرور"
                                                className="w-full pr-14 pl-14 py-4.5 bg-white/[0.04] border border-white/[0.08] rounded-2xl outline-none focus:border-blue-500/40 focus:bg-white/[0.06] transition-all text-lg font-black text-center text-white placeholder-white/15 tracking-[0.1em]"
                                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                                autoFocus
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                        <p className="text-[9px] font-bold text-white/15 mt-2 text-center">
                                            كلمة المرور الممنوحة لك من إدارة النادي
                                        </p>
                                    </div>

                                    {/* Login Button */}
                                    <button
                                        onClick={handleLogin}
                                        disabled={loading || !password}
                                        className="w-full py-4.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-extrabold text-sm shadow-2xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-40 disabled:cursor-not-allowed group active:scale-[0.98]"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Shield className="w-5 h-5" />
                                                <span>تسجيل الدخول</span>
                                            </>
                                        )}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="px-8 pb-8 pt-4 border-t border-white/[0.04]">
                        <div className="flex items-center justify-center gap-6 text-white/20">
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="flex items-center gap-1.5 text-[10px] font-black hover:text-blue-400 transition-colors uppercase tracking-wider"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                <span>دخول المشرفين</span>
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            <button
                                onClick={() => router.push('/')}
                                className="flex items-center gap-1.5 text-[10px] font-black hover:text-blue-400 transition-colors uppercase tracking-wider"
                            >
                                <ChevronLeft className="w-3 h-3" />
                                <span>الرئيسية</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom branding */}
                <div className="text-center mt-6">
                    <div className="flex items-center justify-center gap-2 text-white/10 text-[9px] font-bold uppercase tracking-[0.2em]">
                        <Sparkles className="w-3 h-3" />
                        <span>Fitness Club Solutions</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
