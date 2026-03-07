"use client";

import React, { useState, useEffect } from 'react';
import {
    User,
    Mail,
    Phone,
    MapPin,
    Shield,
    Camera,
    Save,
    Loader2,
    Calendar,
    Briefcase,
    Activity,
    Lock,
    RefreshCw,
    Building,
    CheckCircle2,
    XCircle,
    UserCircle,
    Fingerprint,
    ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User as UserType } from '@/lib/auth';

export default function AdminProfile() {
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [avatar, setAvatar] = useState('');

    useEffect(() => {
        loadUserProfile();
    }, []);

    const loadUserProfile = async () => {
        setLoading(true);
        const currentUser = auth.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
            try {
                const dbUser = await db.getById('users', currentUser.id);
                if (dbUser) {
                    setName(dbUser.name || '');
                    setUsername(dbUser.username || '');
                    setEmail(dbUser.email || '');
                    setPhone(dbUser.phone || '');
                    setAvatar(dbUser.avatar || '');
                } else {
                    setName(currentUser.name || '');
                    setUsername(currentUser.username || '');
                    setAvatar(currentUser.avatar || '');
                }
            } catch (err) {
                console.error("Failed to load user data from db", err);
                setName(currentUser.name || '');
                setUsername(currentUser.username || '');
                setAvatar(currentUser.avatar || '');
            }
        }
        setLoading(false);
    };

    const validateForm = () => {
        if (!name.trim()) return 'يرجى إدخال الاسم الكامل';
        if (!username.trim()) return 'يرجى إدخال اسم المستخدم';
        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'صيغة البريد الإلكتروني غير صحيحة';
        return null;
    }

    const handleSave = async () => {
        if (!user) return;

        const error = validateForm();
        if (error) {
            alert(error);
            return;
        }

        setSaving(true);
        try {
            const allUsers = await db.getAll('users');
            const duplicateUsername = allUsers.find(
                (u: any) => u.username === username && u.id !== user.id
            );

            if (duplicateUsername) {
                alert('اسم المستخدم (Username) محجوز لشخص آخر.');
                setSaving(false);
                return;
            }

            const updates = {
                name,
                username,
                avatar
            };

            await db.update('users', user.id, updates);

            const sessionStr = localStorage.getItem('fitness_club_session_v2');
            if (sessionStr) {
                const session = JSON.parse(sessionStr);
                localStorage.setItem('fitness_club_session_v2', JSON.stringify({
                    ...session,
                    name,
                    username,
                    avatar
                }));
            }

            alert('تم حفظ البيانات بنجاح!');
            window.location.reload();
        } catch (error) {
            console.error('Save error:', error);
            alert('حدث خطأ غير متوقع أثناء الحفظ.');
        } finally {
            setSaving(false);
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert('عذراً، حجم الصورة يجب أن لا يتجاوز 2 ميجابايت.');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[60vh] items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">

            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <UserCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">الملف الشخصي للمسؤول</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">إصدار التحكم في الحساب والصلاحيات الأساسية</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-blue-50 dark:bg-blue-900/10 px-3 py-1.5 rounded-xl border border-blue-100 dark:border-blue-900/20 flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest leading-none">تأمين كامل</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left Column: Avatar & Quick Summary */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-col items-center text-center">
                        <div className="relative group cursor-pointer mb-5">
                            <div className="w-24 h-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 border-4 border-white dark:border-slate-900 shadow-xl overflow-hidden relative z-10 transition-transform group-hover:scale-105">
                                {avatar ? (
                                    <img src={avatar} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <User className="w-10 h-10" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Camera className="w-6 h-6 text-white" />
                                </div>
                            </div>
                            <input type="file" accept="image/*" onChange={handleAvatarChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" />
                        </div>

                        <h2 className="text-base font-black text-slate-900 dark:text-white mb-1 leading-tight">{name || 'مسؤول النظام'}</h2>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg text-[9px] font-black border border-indigo-100 dark:border-indigo-900/30 uppercase tracking-widest mb-6">
                            <Shield className="w-3 h-3" />
                            {user?.role?.replace('_', ' ') || 'SYSTEM ADMIN'}
                        </div>

                        <div className="w-full space-y-2 pt-6 border-t border-gray-200 dark:border-slate-800">
                            <SmallInfoRow label="تاريخ الانضمام" value={new Date().toLocaleDateString('ar-SA')} icon={<Calendar className="w-3 h-3 text-indigo-400" />} />
                            <SmallInfoRow label="حالة الدخول" value="نشط الآن" icon={<Activity className="w-3 h-3 text-emerald-400" />} />
                            <SmallInfoRow label="مستوى الأمان" value="عالي" icon={<Lock className="w-3 h-3 text-amber-400" />} />
                        </div>
                    </div>

                    <div className="bg-slate-900 p-5 rounded-2xl text-white relative overflow-hidden shadow-xl shadow-indigo-900/10 border border-slate-800">
                        <div className="relative z-10">
                            <h3 className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Security ID</h3>
                            <p className="text-[10px] font-mono opacity-50 truncate tracking-widest">{user?.id || '---'}</p>
                        </div>
                        <Fingerprint className="absolute -bottom-4 -left-4 w-20 h-20 text-white/5 -rotate-12" />
                    </div>
                </div>

                {/* Right Column: Edit Forms */}
                <div className="lg:col-span-8 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-gray-300 dark:border-slate-800">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Briefcase className="w-3 h-3 text-blue-500" /> المعلومات المهنية والحساب
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">الاسم الكامل المعتمد</label>
                                <div className="relative group">
                                    <User className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input value={name} onChange={e => setName(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner" placeholder="الاسم الرباعي" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-1">اسم المستخدم (Username)</label>
                                <div className="relative group">
                                    <UserCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-300 group-focus-within:text-blue-500 transition-colors" />
                                    <input dir="ltr" value={username} onChange={e => setUsername(e.target.value)} className="w-full pr-10 pl-4 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-none rounded-xl text-xs font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner font-mono text-left" placeholder="username" />
                                </div>
                            </div>


                        </div>

                        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-8 py-2.5 rounded-xl font-black text-[11px] shadow-lg transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 icon-glow" />}
                                <span>{saving ? 'جاري المزامنة...' : 'حفظ التغييرات'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-dashed border-gray-200 dark:border-slate-700 flex items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm"><Lock className="w-5 h-5" /></div>
                            <div>
                                <h4 className="text-xs font-black text-slate-900 dark:text-white leading-tight">تغيير كلمة المرور</h4>
                                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">تحديث بيانات الدخول السرية</p>
                            </div>
                        </div>
                        <button className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:underline decoration-2 underline-offset-4">إعداد كلمة مرور جديدة ←</button>
                    </div>
                </div>
            </div>

            <footer className="flex items-center justify-between px-2 pt-2 border-t border-gray-200 dark:border-slate-800 text-[9px] font-black text-gray-300 dark:text-slate-600 uppercase tracking-widest">
                <span>© 2024 PROFILE_SECURE_V1</span>
                <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><div className="w-1 h-1 rounded-full bg-emerald-500" /> IDENTITY_VERIFIED</span>
                </div>
            </footer>
        </div>
    );
}

function SmallInfoRow({ label, value, icon }: any) {
    return (
        <div className="flex items-center justify-between p-2 px-3 bg-slate-50/50 dark:bg-slate-800/40 rounded-xl border border-gray-200/30 dark:border-slate-800/50 transition-all hover:bg-white dark:hover:bg-slate-800 group">
            <div className="flex items-center gap-2 text-gray-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors">
                {icon}
                <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <span className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{value}</span>
        </div>
    );
}
