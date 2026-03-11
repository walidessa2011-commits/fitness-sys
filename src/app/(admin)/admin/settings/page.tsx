"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Globe,
    Building2,
    Mail,
    Phone,
    MapPin,
    Save,
    Link as LinkIcon,
    AlertTriangle,
    Loader2,
    Facebook,
    Twitter,
    Instagram,
    Youtube,
    Zap,
    Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';

interface GeneralSettings {
    id: string;
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    facebookUrl: string;
    twitterUrl: string;
    instagramUrl: string;
    youtubeUrl: string;
    maintenanceMode: boolean;
    seoKeywords: string;
}

export default function GeneralSettings() {
    const [settings, setSettings] = useState<GeneralSettings>({
        id: '1',
        siteName: 'Fitness Club Solutions',
        siteDescription: 'أفضل نادي دائم للياقتك وبناء جسمك',
        contactEmail: 'info@fitnessclub.ksa',
        contactPhone: '+966 50 000 0000',
        address: 'شارع الملك فهد، الرياض، المملكة العربية السعودية',
        facebookUrl: '',
        twitterUrl: '',
        instagramUrl: '',
        youtubeUrl: '',
        maintenanceMode: false,
        seoKeywords: 'جيم, كمال أجسام, لياقة, رياض, سعودية'
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'general' | 'contact' | 'social' | 'advanced'>('general');

    useEffect(() => {
        const sessionStr = localStorage.getItem('fitness_club_session_v2');
        const currentUser = sessionStr ? JSON.parse(sessionStr) : null;
        if (!currentUser || currentUser.role !== 'super_admin') {
            window.location.href = '/admin/dashboard';
            return;
        }
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            let data = await db.getAll('system_settings');
            if (data && data.length > 0) {
                setSettings(data[0]);
            } else {
                await db.add('system_settings', settings);
            }
        } catch (error) {
            console.error("Error loading settings", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await db.update('system_settings', settings.id, settings);
            alert('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            alert('حدث خطأ أثناء حفظ الإعدادات');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-[1400px] mx-auto pb-10">
            {/* compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إعدادات الموقع العامة</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">الهوية، التواصل، والخيارات المتقدمة</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="btn-premium btn-premium-blue px-6 py-2 rounded-xl font-black text-[11px] shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-1.5 disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-4 h-4 icon-glow" />}
                    <span>{saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Tabs Sidebar - ultra compact */}
                <div className="lg:col-span-2 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
                    <CompactTab id="general" active={activeTab} icon={Globe} label="البيانات" onClick={setActiveTab} />
                    <CompactTab id="contact" active={activeTab} icon={Phone} label="التواصل" onClick={setActiveTab} />
                    <CompactTab id="social" active={activeTab} icon={LinkIcon} label="السوشيال" onClick={setActiveTab} />
                    <CompactTab id="advanced" active={activeTab} icon={Shield} label="متقدم" onClick={setActiveTab} />
                </div>

                {/* Content Area - Full Width Style */}
                <div className="lg:col-span-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 divide-y divide-gray-400 dark:divide-slate-800"
                        >
                            {/* General Tab */}
                            {activeTab === 'general' && (
                                <Section title="البيانات الأساسية" icon={<Building2 className="w-4 h-4" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6">
                                        <InputField label="اسم الموقع / النادي" name="siteName" value={settings.siteName} onChange={handleChange} icon={<Building2 className="w-3.5 h-3.5" />} />
                                        <InputField label="الكلمات المفتاحية (SEO)" name="seoKeywords" value={settings.seoKeywords} onChange={handleChange} icon={<Zap className="w-3.5 h-3.5" />} />
                                        <div className="col-span-2">
                                            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">وصف الموقع</label>
                                            <textarea name="siteDescription" value={settings.siteDescription} onChange={handleChange} rows={2} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none shadow-inner" />
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {/* Contact Tab */}
                            {activeTab === 'contact' && (
                                <Section title="معلومات التواصل" icon={<Mail className="w-4 h-4" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6">
                                        <InputField label="البريد الإلكتروني" name="contactEmail" value={settings.contactEmail} onChange={handleChange} icon={<Mail className="w-3.5 h-3.5" />} type="email" />
                                        <InputField label="رقم الجوال" name="contactPhone" value={settings.contactPhone} onChange={handleChange} icon={<Phone className="w-3.5 h-3.5" />} />
                                        <div className="col-span-2">
                                            <InputField label="العنوان الفعلي" name="address" value={settings.address} onChange={handleChange} icon={<MapPin className="w-3.5 h-3.5" />} />
                                        </div>
                                    </div>
                                </Section>
                            )}

                            {/* Social Tab */}
                            {activeTab === 'social' && (
                                <Section title="منصات التواصل" icon={<LinkIcon className="w-4 h-4" />}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 p-6">
                                        <InputField label="فيسبوك" name="facebookUrl" value={settings.facebookUrl} onChange={handleChange} icon={<Facebook className="w-3.5 h-3.5" />} dir="ltr" />
                                        <InputField label="تويتر / X" name="twitterUrl" value={settings.twitterUrl} onChange={handleChange} icon={<Twitter className="w-3.5 h-3.5" />} dir="ltr" />
                                        <InputField label="انستقرام" name="instagramUrl" value={settings.instagramUrl} onChange={handleChange} icon={<Instagram className="w-3.5 h-3.5" />} dir="ltr" />
                                        <InputField label="يوتيوب" name="youtubeUrl" value={settings.youtubeUrl} onChange={handleChange} icon={<Youtube className="w-3.5 h-3.5" />} dir="ltr" />
                                    </div>
                                </Section>
                            )}

                            {/* Advanced Tab */}
                            {activeTab === 'advanced' && (
                                <Section title="وضع الصيانة" icon={<AlertTriangle className="w-4 h-4" />}>
                                    <div className="p-8 flex flex-col items-center">
                                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 p-4 rounded-xl flex items-start gap-4 max-w-2xl mb-6">
                                            <AlertTriangle className="w-5 h-5 text-amber-500 mt-1" />
                                            <div>
                                                <h4 className="text-xs font-black text-amber-900 dark:text-amber-400 mb-1">تنبيه هام</h4>
                                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed">تفعيل وضع الصيانة سيمنع جميع المستخدمين من الدخول للنظام باستثناء المشرفين العامين.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 cursor-pointer select-none" onClick={() => handleChange({ target: { name: 'maintenanceMode', type: 'checkbox', checked: !settings.maintenanceMode } } as any)}>
                                            <div className={`w-14 h-8 rounded-full relative transition-all duration-300 ${settings.maintenanceMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700 shadow-inner'}`}>
                                                <motion.div
                                                    animate={{ x: settings.maintenanceMode ? (document.dir === 'rtl' ? -30 : 30) : 0 }}
                                                    className="absolute top-1 left-1 rtl:right-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                                />
                                            </div>
                                            <span className={`text-xs font-black ${settings.maintenanceMode ? 'text-amber-600' : 'text-slate-400'}`}>وضع الصيانة مغلق</span>
                                        </div>
                                    </div>
                                </Section>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

function CompactTab({ id, active, icon: Icon, label, onClick }: any) {
    const isActive = active === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`flex flex-col lg:flex-row items-center gap-2 px-4 py-3 rounded-xl transition-all whitespace-nowrap ${isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none font-black' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold'
                }`}
        >
            <Icon className={`w-4 h-4 ${isActive ? 'scale-110' : 'opacity-50'}`} />
            <span className="text-[10px]">{label}</span>
        </button>
    );
}

function Section({ title, icon, children }: any) {
    return (
        <div className="animate-in fade-in slide-in-from-right-2 duration-300">
            <div className="px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 flex items-center gap-2 border-b border-gray-200 dark:border-slate-800">
                <div className="text-indigo-600">{icon}</div>
                <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{title}</h3>
            </div>
            {children}
        </div>
    );
}

function InputField({ label, name, value, onChange, icon, type = "text", dir }: any) {
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">{label}</label>
            <div className="relative group">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">{icon}</div>}
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    dir={dir}
                    className={`w-full ${icon ? 'pl-9' : 'px-4'} pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner`}
                />
            </div>
        </div>
    );
}
