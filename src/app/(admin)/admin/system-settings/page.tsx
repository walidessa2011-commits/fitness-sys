"use client";

import React, { useState, useEffect } from 'react';
import {
    Settings,
    Save,
    CheckCircle2,
    Printer,
    ShieldCheck,
    Smartphone,
    CreditCard,
    PauseCircle,
    Hash,
    Percent,
    FileText,
    Loader2,
    Database,
    Zap,
    Lock,
    Palette,
    RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db, supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SystemSettingsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [settings, setSettings] = useState<any>({
        copyUserData: false,
        enableDailyTicketTax: false,
        printReceiptPos: true,
        printTicketReceiptPos: true,
        entryBarriers: true,
        verifyBankTransfers: false,
        paidPause: false,
        mandatoryPauseFee: false,
        customerCodeStart: 2000,
        vatPercent: 15,
        printTwoReceipts: false,
        receiptFooter: '',
        themeHeaderBg: '#1e40af',
        themeHeaderFrom: '#1e3a8a',
        themeHeaderTo: '#2563eb',
        themeTableBg: '#f8fafc',
        themeTableText: '#475569',
        themeButtonBg: '#2563eb',
        themeButtonText: '#ffffff'
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        loadSettings(user.clubId);
    }, [router]);

    async function loadSettings(clubId?: string) {
        if (!clubId) {
            setLoading(false);
            return;
        }

        try {
            const data = await db.getAll('club_settings');
            let clubSettings = data.find((s: any) => s.clubId === clubId || s.club_id === clubId);

            // If not found in getAll, try to fetch directly from database to be absolutely sure
            if (!clubSettings) {
                const { data: directData } = await supabase
                    .from('club_settings')
                    .select('*')
                    .eq('club_id', clubId)
                    .single();

                if (directData) {
                    clubSettings = directData;
                }
            }

            if (clubSettings) {
                // Ensure all expected fields are present even if new ones were added to schema
                setSettings({
                    ...settings,
                    ...clubSettings,
                    clubId: clubId // ensure clubId is kept
                });
            } else {
                const initial = {
                    clubId: clubId,
                    copyUserData: false,
                    enableDailyTicketTax: false,
                    printReceiptPos: true,
                    printTicketReceiptPos: true,
                    entryBarriers: true,
                    verifyBankTransfers: false,
                    paidPause: false,
                    mandatoryPauseFee: false,
                    customerCodeStart: 2000,
                    vatPercent: 15,
                    printTwoReceipts: false,
                    receiptFooter: '',
                    themeHeaderBg: '#1e40af',
                    themeHeaderFrom: '#1e3a8a',
                    themeHeaderTo: '#2563eb',
                    themeTableBg: '#f8fafc',
                    themeTableText: '#475569',
                    themeButtonBg: '#2563eb',
                    themeButtonText: '#ffffff'
                };

                try {
                    const created = await db.add('club_settings', initial);
                    if (created) setSettings(created);
                } catch (addErr) {
                    // Fail-safe: try to fetch one last time
                    const { data: finalFetch } = await supabase.from('club_settings').select('*').eq('club_id', clubId).single();
                    if (finalFetch) setSettings({ ...settings, ...finalFetch });
                }
            }
        } catch (error) {
            console.error('Error loading settings:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!settings.clubId) {
            alert('خطأ: لم يتم تحديد معرف النادي');
            return;
        }

        setSaving(true);
        try {
            // Ensure numeric values are valid and names are consistent
            const finalSettings = {
                ...settings,
                customerCodeStart: parseInt(settings.customerCodeStart?.toString() || '2000') || 2000,
                vatPercent: parseFloat(settings.vatPercent?.toString() || '15') || 15
            };

            if (settings.id) {
                await db.update('club_settings', settings.id, finalSettings);
            } else {
                const created = await db.add('club_settings', finalSettings);
                if (created) setSettings(created);
            }

            // Trigger global reload to apply theme changes instantly
            window.dispatchEvent(new Event('club-profile-updated'));

            alert('تم حفظ الإعدادات بنجاح');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('حدث خطأ أثناء حفظ الإعدادات. يرجى التأكد من وجود جدول club_settings في قاعدة البيانات.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10" dir="rtl">
            {/* ultra compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Settings className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إعدادات النظام التشغيلية</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تخصيص الخيارات المالية والتقنية للفرع</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                        <Zap className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                        <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-400">نظام ذكي متكامل</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="btn-premium btn-premium-blue px-6 py-2 rounded-xl font-black text-[11px] shadow-md transition-all flex items-center gap-1.5 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-4 h-4 icon-glow" />}
                        <span>حفظ التعديلات</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Switches Grid - Full Width Style */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden divide-y divide-gray-400 dark:divide-slate-800">
                        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2">
                            <Database className="w-3.5 h-3.5 text-indigo-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">الخيارات التشغيلية</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2">
                            <ToggleItem label="نسخ بيانات المستخدمين للأجهزة" checked={settings.copyUserData} onChange={(v) => setSettings((prev: any) => ({ ...prev, copyUserData: v }))} icon={<Smartphone />} />
                            <ToggleItem label="التحقق من التحويلات البنكية" checked={settings.verifyBankTransfers} onChange={(v) => setSettings((prev: any) => ({ ...prev, verifyBankTransfers: v }))} icon={<CreditCard />} />
                            <ToggleItem label="تفعيل ضريبة التذاكر اليومية" checked={settings.enableDailyTicketTax} onChange={(v) => setSettings((prev: any) => ({ ...prev, enableDailyTicketTax: v }))} icon={<Percent />} />
                            <ToggleItem label="هل يوجد إيقاف مدفوع" checked={settings.paidPause} onChange={(v) => setSettings((prev: any) => ({ ...prev, paidPause: v }))} icon={<PauseCircle />} />
                            <ToggleItem label="طباعة الإيصال على طابعة POS" checked={settings.printReceiptPos} onChange={(v) => setSettings((prev: any) => ({ ...prev, printReceiptPos: v }))} icon={<Printer />} />
                            <ToggleItem label="الإيقاف برسوم إجباري" checked={settings.mandatoryPauseFee} onChange={(v) => setSettings((prev: any) => ({ ...prev, mandatoryPauseFee: v }))} icon={<ShieldCheck />} />
                            <ToggleItem label="طباعة إيصال التذكرة طابعة POS" checked={settings.printTicketReceiptPos} onChange={(v) => setSettings((prev: any) => ({ ...prev, printTicketReceiptPos: v }))} icon={<FileText />} />
                            <ToggleItem label="طباعة الإيصال نسختين" checked={settings.printTwoReceipts} onChange={(v) => setSettings((prev: any) => ({ ...prev, printTwoReceipts: v }))} icon={<FileText />} />
                            <ToggleItem label="أجهزة الدخول - Barriers" checked={settings.entryBarriers} onChange={(v) => setSettings((prev: any) => ({ ...prev, entryBarriers: v }))} icon={<Lock />} />
                        </div>
                    </div>

                    {/* Theme Customization Grid */}
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden divide-y divide-gray-400 dark:divide-slate-800 mt-4">
                        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Palette className="w-3.5 h-3.5 text-indigo-600" />
                                <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">المظهر العام والألوان الذكية</h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSettings((prev: any) => ({
                                    ...prev,
                                    themeHeaderBg: '#1e40af',
                                    themeHeaderFrom: '#1e3a8a',
                                    themeHeaderTo: '#2563eb',
                                    themeTableBg: '#f8fafc',
                                    themeTableText: '#475569',
                                    themeButtonBg: '#2563eb',
                                    themeButtonText: '#ffffff'
                                }))}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/40 rounded-lg text-[10px] font-black transition-colors"
                            >
                                <RefreshCw className="w-3 h-3" />
                                إستعادة الألوان الأساسية
                            </button>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <ColorPickerField label="لون الهيدر الرئيسي" value={settings.themeHeaderBg} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeHeaderBg: v }))} />
                            <ColorPickerField label="لون الهيدر الأيمن (تدرج)" value={settings.themeHeaderFrom} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeHeaderFrom: v }))} />
                            <ColorPickerField label="لون الهيدر الأيسر (تدرج)" value={settings.themeHeaderTo} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeHeaderTo: v }))} />
                            <ColorPickerField label="لون خلفية ترويسة الجداول" value={settings.themeTableBg} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeTableBg: v }))} />
                            <ColorPickerField label="لون خط ترويسة الجداول" value={settings.themeTableText} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeTableText: v }))} />
                            <ColorPickerField label="لون أزرار النظام" value={settings.themeButtonBg} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeButtonBg: v }))} />
                            <ColorPickerField label="لون خط الأزرار" value={settings.themeButtonText} onChange={(v) => setSettings((prev: any) => ({ ...prev, themeButtonText: v }))} />
                        </div>
                    </div>
                </div>

                {/* Vertical Inputs */}
                <div className="lg:col-span-4 space-y-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden divide-y divide-gray-400 dark:divide-slate-800">
                        <div className="px-5 py-3 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5 text-indigo-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">القيم والنسب</h3>
                        </div>
                        <div className="p-5 space-y-4">
                            <InputField label="بداية كود العملاء" value={settings.customerCodeStart} onChange={(v) => setSettings((prev: any) => ({ ...prev, customerCodeStart: parseInt(v) }))} icon={<Hash />} type="number" />
                            <InputField label="نسبة القيمة المضافة (%)" value={settings.vatPercent} onChange={(v) => setSettings((prev: any) => ({ ...prev, vatPercent: parseFloat(v) }))} icon={<Percent />} type="number" />
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">تذييل إيصال الدفع</label>
                                <textarea
                                    value={settings.receiptFooter ?? ''}
                                    onChange={(e) => setSettings((prev: any) => ({ ...prev, receiptFooter: e.target.value }))}
                                    rows={3}
                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-4 text-[11px] font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none shadow-inner"
                                    placeholder="مثلاً: نسعد بخدمتكم دائماً..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 p-4 rounded-xl flex items-start gap-4">
                        <CheckCircle2 className="w-4 h-4 text-amber-500 mt-0.5" />
                        <p className="text-[10px] font-bold text-amber-700/80 dark:text-amber-500/80 leading-relaxed">تعديل هذه الإعدادات سيؤثر مباشرة على العمليات اليومية للنادي والفواتير ونظام الدخول.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ToggleItem({ label, checked, onChange, icon }: { label: string; checked: boolean; onChange: (v: boolean) => void; icon: any }) {
    return (
        <div className="flex items-center justify-between py-2.5 group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-2 rounded-xl transition-all cursor-pointer select-none" onClick={() => onChange(!checked)}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${checked ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 dark:bg-slate-800 text-gray-400'}`}>
                    {React.cloneElement(icon, { className: 'w-3.5 h-3.5' })}
                </div>
                <span className={`text-[11px] font-bold transition-colors ${checked ? 'text-slate-900 dark:text-white' : 'text-gray-400'}`}>{label}</span>
            </div>
            <div className={`w-11 h-6 rounded-full relative transition-all duration-300 ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                <motion.div
                    animate={{ x: checked ? -22 : 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-1 left-1 rtl:right-1 w-4 h-4 bg-white rounded-full shadow-sm"
                />
            </div>
        </div>
    );
}

function InputField({ label, value, onChange, icon, type = "text" }: { label: string; value: any; onChange: (v: string) => void; icon?: any; type?: string }) {
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">{label}</label>
            <div className="relative group">
                {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-600 transition-colors">{React.cloneElement(icon, { className: 'w-3.5 h-3.5' })}</div>}
                <input
                    type={type}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
                />
            </div>
        </div>
    );
}

function ColorPickerField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest pr-2">{label}</label>
            <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 ring-1 ring-gray-300 dark:ring-slate-700 shadow-inner">
                    <input
                        type="color"
                        value={value || '#ffffff'}
                        onChange={e => onChange(e.target.value)}
                        className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                    />
                </div>
                <input
                    type="text"
                    value={value || ''}
                    onChange={e => onChange(e.target.value)}
                    placeholder="#000000"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[11px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all font-mono text-left shadow-inner uppercase uppercase"
                    dir="ltr"
                />
            </div>
        </div>
    );
}
