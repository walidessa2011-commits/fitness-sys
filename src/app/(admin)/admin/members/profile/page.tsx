"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { db } from '@/lib/supabase';
import {
    ChevronRight,
    User,
    Calendar,
    Award,
    Clock,
    CreditCard,
    Activity,
    Shield,
    Camera,
    Phone,
    Mail,
    MapPin,
    AlertCircle,
    CheckCircle2,
    Settings,
    Dumbbell,
    LogOut,
    Crown,
    Edit3,
    Plus,
    BarChart3,
    ArrowUpRight,
    QrCode,
    History,
    Wallet,
    Loader2,
    Printer,
    DownloadCloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function MemberProfilePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get('id');

    const [member, setMember] = useState<any>(null);
    const [subscription, setSubscription] = useState<any>(null);
    const [stats, setStats] = useState({
        attendanceDays: 0,
        balance: 0,
        lastVisit: '---',
        level: 'جديد'
    });
    const [loading, setLoading] = useState(true);
    const [showIDCard, setShowIDCard] = useState(false);
    const [club, setClub] = useState<any>(null);

    // Modals State
    const [showMeasurements, setShowMeasurements] = useState(false);
    const [showInvoices, setShowInvoices] = useState(false);
    const [showAttendance, setShowAttendance] = useState(false);
    const [showFreeze, setShowFreeze] = useState(false);
    const [showRenew, setShowRenew] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    // Data for Modals
    const [memberInvoices, setMemberInvoices] = useState<any[]>([]);
    const [memberAttendanceLogs, setMemberAttendanceLogs] = useState<any[]>([]);
    const [measurements, setMeasurements] = useState({
        weight: '',
        height: '',
        chest: '',
        waist: '',
        arms: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    // Renewal Form Data
    const [prices, setPrices] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [coaches, setCoaches] = useState<any[]>([]);
    const [revenueTypes, setRevenueTypes] = useState<any[]>([]);
    const [profileClubSettings, setProfileClubSettings] = useState<any>(null);
    const [renewForm, setRenewForm] = useState({
        priceId: '',
        startDate: new Date().toISOString().split('T')[0],
        paymentMethod: 'كاش',
        notes: '',
        discountPercent: 0,
        promotionId: '',
        coachId: ''
    });

    // Edit Form Data
    const [editForm, setEditForm] = useState<any>({});

    useEffect(() => {
        if (id) {
            loadMember();
        } else {
            router.push('/admin/members');
        }
    }, [id]);

    async function loadMember() {
        try {
            setLoading(true);
            const [memberData, allSubs, allAttendance, allRevenues, allClubs] = await Promise.all([
                db.getById('members', id as string),
                db.getAll('subscriptions'),
                db.getAll('attendance'),
                db.getAll('revenueEntries'),
                db.getAll('clubs')
            ]);

            if (memberData) {
                setMember(memberData);

                // Find club
                const userClub = allClubs.find((c: any) => c.id === (memberData.clubId || memberData.club_id));
                setClub(userClub);

                // Find active subscription
                const activeSub = allSubs.find((s: any) =>
                    (s.memberId === id || s.member_id === id) &&
                    s.status === 'نشط'
                );
                setSubscription(activeSub);

                // Calculate stats
                const memberAttendance = allAttendance.filter((a: any) => a.memberId === id || a.member_id === id);
                const memberRevenues = allRevenues.filter((r: any) => r.note?.includes(memberData.name) || r.memberId === id);

                const lastVisit = memberAttendance.length > 0
                    ? new Date(memberAttendance[0].createdAt || memberAttendance[0].created_at).toLocaleDateString()
                    : '---';

                setStats({
                    attendanceDays: memberAttendance.length,
                    balance: memberRevenues.reduce((acc: number, r: any) => acc + Number(r.amount), 0),
                    lastVisit,
                    level: memberAttendance.length > 20 ? 'محترف' : memberAttendance.length > 5 ? 'مستمر' : 'جديد'
                });

                setMemberInvoices(memberRevenues);
                setMemberAttendanceLogs(memberAttendance);
                setEditForm({ ...memberData });

                // Smart Renewal Logic: Default start date to end of current sub or today
                const effectiveStartDate = activeSub?.endDate
                    ? new Date(new Date(activeSub.endDate).getTime() + 86400000).toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0];

                setRenewForm(prev => ({
                    ...prev,
                    startDate: effectiveStartDate,
                    priceId: activeSub?.priceId || ''
                }));

                // Load existing measurements
                const allMeasurements = await db.getAll('member_measurements');
                const memberMs = allMeasurements.find((m: any) => m.member_id === id);
                if (memberMs) {
                    setMeasurements({
                        weight: memberMs.weight || '',
                        height: memberMs.height || '',
                        chest: memberMs.chest || '',
                        waist: memberMs.waist || '',
                        arms: memberMs.arms || ''
                    });
                }
            } else {
                alert('عضو غير موجود');
                router.push('/admin/members');
            }
        } catch (error) {
            console.error('Error loading member:', error);
        } finally {
            setLoading(false);
        }
    }

    async function loadRenewalData() {
        if (prices.length > 0) return; // Only load once
        const clubId = await db.getClubId();
        const [pricesData, typesData, activitiesData, promoData, empsData, revTypesData, clubSettingsData] = await Promise.all([
            db.getAll('subscription_prices'),
            db.getAll('subscription_types'),
            db.getAll('activities'),
            db.getAll('promotions'),
            db.getAll('employees'),
            db.getAll('revenueTypes'),
            db.getAll('club_settings')
        ]);
        setPrices(pricesData?.filter((p: any) => p.status === 'نشط') || []);
        setTypes(typesData || []);
        setActivities(activitiesData || []);
        setPromotions(promoData?.filter((p: any) => p.status === 'نشط') || []);
        setCoaches(empsData?.filter((e: any) => e.jobRole === 'coach') || []);
        setRevenueTypes(revTypesData || []);
        const mySettings = clubSettingsData?.find((s: any) => s.clubId === clubId || s.club_id === clubId);
        setProfileClubSettings(mySettings || null);
    }

    // Financial calculations for renewal
    const calculateFinancials = () => {
        const priceRecord = prices.find(p => p.id === renewForm.priceId);
        const typeRecord = types.find(t => t.id === priceRecord?.typeId);
        const promoRecord = promotions.find(p => p.id === renewForm.promotionId);

        let durationDays = parseInt(typeRecord?.durationDays || '30');
        if (promoRecord?.extraDays) durationDays += parseInt(promoRecord.extraDays);

        const start = new Date(renewForm.startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + durationDays);

        const base = parseFloat(priceRecord?.price || '0');
        const promoDiscount = parseFloat(promoRecord?.discountPercent || '0');
        const manualDiscount = parseFloat(renewForm.discountPercent.toString()) || 0;
        const effectiveDiscount = promoRecord ? promoDiscount : manualDiscount;

        const discAmount = base * (effectiveDiscount / 100);
        const due = base - discAmount;
        const dynamicVatRate = parseFloat(profileClubSettings?.vatPercent || profileClubSettings?.vat_percent || '15') / 100;
        const vat = due * dynamicVatRate;
        const total = due + vat;

        return {
            duration: durationDays,
            endDate: end.toISOString().split('T')[0],
            basePrice: base,
            discountAmount: discAmount,
            amountDue: due,
            vatAmount: vat,
            total,
            priceRecord
        };
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin opacity-40" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest animate-pulse">جاري تحميل بيانات العضو...</p>
            </div>
        );
    }

    if (!member) return null;

    return (
        <div dir="rtl">
            <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-10 no-print">

                {/* Ultra Compact Header */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.push('/admin/members')}
                            className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-indigo-600 transition-all border border-slate-300 dark:border-slate-700"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-900 dark:text-white shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
                            {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <User className="w-6 h-6 opacity-20" />}
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">ملف العضو الشخصي</h1>
                                {member.vip && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                            </div>
                            <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-1">
                                {member.name} — {member.membershipNumber || `ID: ${member.id.substring(0, 8)}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={async () => {
                                await loadRenewalData();
                                setShowRenew(true);
                            }}
                            className="btn-premium btn-premium-blue px-4 py-2 rounded-xl font-black text-[11px] shadow-sm transition-all flex items-center gap-1.5 active:scale-95"
                        >
                            <Plus className="w-4 h-4 icon-glow" />
                            <span>تجديد الاشتراك</span>
                        </button>
                        <button
                            onClick={() => setShowEdit(true)}
                            className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl border border-slate-300 dark:border-slate-700 hover:text-indigo-600 transition-all"
                        >
                            <Edit3 className="w-4 h-4 icon-glow" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Profile Details Sidebar */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-300 dark:border-slate-800">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Shield className="w-3 h-3 text-indigo-500" /> معلومات الحساب
                            </div>
                            <div className="space-y-1">
                                <SmallInfoRow label="الجوال" value={member.phone} icon={<Phone className="w-3 h-3 text-blue-400" />} mono />
                                <SmallInfoRow label="البريد" value={member.email || '---'} icon={<Mail className="w-3 h-3 text-indigo-400" />} />
                                <SmallInfoRow label="الميلاد" value={member.birthDate || '---'} icon={<Calendar className="w-3 h-3 text-emerald-400" />} />
                                <SmallInfoRow label="العنوان" value={member.address || '---'} icon={<MapPin className="w-3 h-3 text-rose-400" />} />
                            </div>

                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-800">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">بطاقة الدخول الرقمية</span>
                                    <QrCode className="w-4 h-4 text-slate-300" />
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex flex-col items-center justify-center border border-dashed border-gray-200 dark:border-slate-700">
                                    <div
                                        onClick={() => setShowIDCard(true)}
                                        className="w-36 h-36 bg-white dark:bg-slate-900 rounded-2xl border border-gray-300 dark:border-slate-800 flex items-center justify-center shadow-sm relative overflow-hidden group cursor-pointer hover:border-indigo-500/30 transition-all"
                                    >
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${member.id}`}
                                            className="w-24 h-24 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                                            alt="Member QR"
                                        />
                                        <div className="absolute inset-0 bg-indigo-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-3 font-mono">#{member.id.substring(0, 12).toUpperCase()}</span>
                                    <button
                                        onClick={() => setShowIDCard(true)}
                                        className="mt-4 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                                    >
                                        <Printer className="w-3.5 h-3.5" /> طباعة الهوية
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-8 flex flex-col gap-2.5">
                        {/* Subscription Widget */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden">
                            <div className="p-4 px-6 bg-indigo-600 text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md shadow-inner">
                                        <Award className="w-4.5 h-4.5" />
                                    </div>
                                    <div>
                                        <h3 className="text-xs font-black uppercase tracking-tighter">الاشتراك الحالي</h3>
                                        <p className="text-[8px] text-indigo-100 font-bold uppercase tracking-widest mt-0.5">الباقة والبيانات المالية</p>
                                    </div>
                                </div>
                                {subscription ? (
                                    <div className="flex items-center gap-1.5 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 uppercase font-black text-[9px] tracking-tighter text-emerald-300">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> {subscription.status || 'نشط'}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30 uppercase font-black text-[9px] tracking-tighter text-amber-300">
                                        <AlertCircle className="w-3.5 h-3.5" /> غير مفعل
                                    </div>
                                )}
                            </div>

                            <div className="p-6">
                                {subscription ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                        <InfoBlock label="نوع الباقة" value={subscription.subscriptionName || '---'} />
                                        <InfoBlock label="تاريخ البدء" value={subscription.startDate || '---'} />
                                        <InfoBlock label="تاريخ الانتهاء" value={subscription.endDate || '---'} />
                                        <InfoBlock label="إجمالي المبلغ" value={`${Number(subscription.totalAmount).toLocaleString()} SAR`} highlight />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-slate-700">
                                        <BarChart3 className="w-10 h-10 text-slate-200 mb-2" />
                                        <span className="text-[11px] font-black text-gray-400 uppercase tracking-widest">لا يوجد اشتراك نشط</span>
                                        <button
                                            onClick={async () => {
                                                await loadRenewalData();
                                                setShowRenew(true);
                                            }}
                                            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-500/20 hover:scale-105 transition-all"
                                        >
                                            تفعيل اشتراك جديد
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <TinyStatCard label="أيام الحضور" value={stats.attendanceDays} unit="يوم" icon={<Dumbbell className="w-4 h-4 text-blue-500" />} color="blue" />
                            <TinyStatCard label="الرصيد المالي" value={stats.balance.toLocaleString()} unit="SAR" icon={<Wallet className="w-4 h-4 text-emerald-500" />} color="emerald" />
                            <TinyStatCard label="آخر زيارة" value={stats.lastVisit} unit="" icon={<History className="w-4 h-4 text-indigo-500" />} color="indigo" />
                            <TinyStatCard label="المستوى" value={stats.level} unit="" icon={<BarChart3 className="w-4 h-4 text-amber-500" />} color="amber" />
                        </div>

                        {/* Actions Panel */}
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-gray-300 dark:border-slate-800">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                <Settings className="w-3.5 h-3.5 text-slate-400" /> إجراءات الإدارة المتقدمة
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <QuickActionBtn
                                    onClick={() => setShowMeasurements(true)}
                                    label="قياسات الجسم"
                                    icon={<Activity className="w-5 h-5" />}
                                    color="blue"
                                />
                                <QuickActionBtn
                                    onClick={() => setShowInvoices(true)}
                                    label="سجل الفواتير"
                                    icon={<CreditCard className="w-5 h-5 icon-glow" />}
                                    color="emerald"
                                />
                                <QuickActionBtn
                                    onClick={() => setShowAttendance(true)}
                                    label="سجل الحضور"
                                    icon={<Clock className="w-5 h-5" />}
                                    color="indigo"
                                />
                                <QuickActionBtn
                                    onClick={() => setShowFreeze(true)}
                                    label="تجميد الاشتراك"
                                    icon={<LogOut className="w-5 h-5 icon-glow" />}
                                    color="rose"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Implementations OUTSIDE no-print */}
            <AnimatePresence>
                {/* ID Card Modal */}
                {showIDCard && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowIDCard(false)} className="absolute inset-0 bg-slate-900/95 backdrop-blur-xl no-print" />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative flex flex-col items-center gap-8">
                            <div id="print-area" className="w-[350px] h-[500px] bg-white dark:bg-slate-900 rounded-[35px] shadow-2xl overflow-hidden border-8 border-white dark:border-indigo-600 relative ring-1 ring-slate-200 dark:ring-white/10 print:m-0 print:shadow-none print:border-none">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-900 to-black h-[180px]" />
                                <div className="relative px-8 pt-10 text-center flex flex-col items-center text-white print:text-black">
                                    <div className="flex items-center gap-2 mb-6 no-print">
                                        <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"><Dumbbell className="w-4 h-4 text-white" /></div>
                                        <span className="text-[10px] font-black text-white uppercase tracking-widest leading-none mt-1">{club?.name || 'فيتنس الرياض'}</span>
                                    </div>
                                    <div className="w-28 h-28 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-slate-100 print:shadow-none print:border-gray-200">
                                        {member.photo ? <img src={member.photo} className="w-full h-full object-cover" /> : <User className="w-12 h-12 text-slate-300 m-8" />}
                                    </div>
                                    <h2 className="text-lg font-black text-slate-900 dark:text-white mb-0.5 leading-tight print:text-black">{member.name}</h2>
                                    <div className="flex items-center gap-2 mb-6 text-indigo-600 dark:text-indigo-400 font-black text-[9px] uppercase tracking-tighter print:text-indigo-800">
                                        <Crown className="w-3 h-3" /> VIP MEMBER · #{member.membershipNumber || member.id.substring(0, 6).toUpperCase()}
                                    </div>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-indigo-500/20 flex flex-col items-center mb-6 print:bg-white print:border-gray-300">
                                        <div className="bg-white p-2 rounded-2xl shadow-inner border border-slate-300 ring-4 ring-indigo-50 dark:ring-indigo-500/10 mb-3 print:ring-0">
                                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${member.id}`} className="w-24 h-24" alt="Digital Key" />
                                        </div>
                                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-[0.3em] print:text-black">Digital Identity Key</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 w-full px-2 border-t border-slate-300 dark:border-slate-800 pt-6 print:border-gray-200">
                                        <div className="text-right">
                                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">تاريخ الانتهاء</p>
                                            <p className="text-[10px] font-black text-gray-900 dark:text-indigo-400 font-mono italic print:text-black">{subscription?.endDate || '31-12-2026'}</p>
                                        </div>
                                        <div className="text-left border-r pr-4 border-slate-300 dark:border-slate-800 print:border-gray-200">
                                            <p className="text-[8px] font-black text-gray-400 uppercase mb-1">الفئة</p>
                                            <p className="text-[10px] font-black text-gray-900 dark:text-indigo-400 print:text-black">{subscription?.subscriptionName || 'بلاتيني'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-0 w-full text-center no-print">
                                    <p className="text-[7px] font-black text-gray-300 uppercase tracking-[0.2em]">© {new Date().getFullYear()} PRO GYM SOLUTIONS · VALID IDENTITY</p>
                                </div>
                            </div>
                            <div className="flex gap-4 no-print">
                                <button onClick={() => window.print()} className="bg-white hover:bg-indigo-50 text-indigo-900 px-8 py-3 rounded-2xl font-black text-[11px] shadow-2xl transition-all flex items-center gap-2 border-b-4 border-slate-200 active:scale-95"><Printer className="w-4 h-4 icon-glow" /> طباعة البطاقة</button>
                                <button onClick={() => setShowIDCard(false)} className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3 rounded-2xl font-black text-[11px] shadow-2xl border border-white/10 active:scale-95">إغلاق</button>
                            </div>
                        </motion.div>
                    </div>
                )}

                {/* Body Measurements Modal */}
                {showMeasurements && (
                    <Modal title="قياسات جسم العضو" onClose={() => setShowMeasurements(false)}>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="الوزن (كجم)" value={measurements.weight} onChange={(v: string) => setMeasurements({ ...measurements, weight: v })} />
                                <InputField label="الطول (سم)" value={measurements.height} onChange={(v: string) => setMeasurements({ ...measurements, height: v })} />
                                <InputField label="الصدر" value={measurements.chest} onChange={(v: string) => setMeasurements({ ...measurements, chest: v })} />
                                <InputField label="الخصر" value={measurements.waist} onChange={(v: string) => setMeasurements({ ...measurements, waist: v })} />
                                <InputField label="الذراع" value={measurements.arms} onChange={(v: string) => setMeasurements({ ...measurements, arms: v })} />
                            </div>
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        const allM = await db.getAll('member_measurements');
                                        const existing = allM.find((m: any) => m.member_id === id);
                                        if (existing) {
                                            await db.update('member_measurements', existing.id, measurements);
                                        } else {
                                            await db.add('member_measurements', { ...measurements, member_id: id, club_id: member.clubId });
                                        }
                                        alert('تم حفظ القياسات بنجاح');
                                        setShowMeasurements(false);
                                    } catch (e) {
                                        console.error(e);
                                    } finally {
                                        setIsSaving(false);
                                    }
                                }}
                                disabled={isSaving}
                                className="w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest active:scale-95 transition-all"
                            >
                                {isSaving ? 'جاري الحفظ...' : 'حفظ القياسات'}
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Invoices Modal */}
                {showInvoices && (
                    <Modal title="سجل فواتير العضو" onClose={() => setShowInvoices(false)}>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {memberInvoices.length > 0 ? memberInvoices.map((inv, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{new Date(inv.createdAt || inv.created_at).toLocaleDateString()}</p>
                                        <p className="text-xs font-black text-slate-900 dark:text-white mt-1">{inv.note || 'اشتراك عضوية'}</p>
                                    </div>
                                    <div className="text-left font-black text-indigo-600 text-xs">{Number(inv.amount).toLocaleString()} SAR</div>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 font-bold text-[10px] uppercase">لا توجد سجلات</div>
                            )}
                        </div>
                    </Modal>
                )}

                {/* Attendance Modal */}
                {showAttendance && (
                    <Modal title="سجل الحضور" onClose={() => setShowAttendance(false)}>
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {memberAttendanceLogs.length > 0 ? memberAttendanceLogs.map((log, idx) => (
                                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600"><Clock className="w-4 h-4 icon-glow" /></div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 dark:text-white">{new Date(log.createdAt || log.created_at).toLocaleDateString()}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{new Date(log.createdAt || log.created_at).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                    <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full uppercase">حاضر</span>
                                </div>
                            )) : (
                                <div className="text-center py-10 text-slate-400 font-bold text-[10px] uppercase">لا يوجد سجل</div>
                            )}
                        </div>
                    </Modal>
                )}

                {/* Freeze Modal */}
                {showFreeze && (
                    <Modal title="تجميد الاشتراك" onClose={() => setShowFreeze(false)}>
                        <div className="space-y-6">
                            <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl">
                                <p className="text-[10px] font-bold text-amber-700 dark:text-amber-500 leading-relaxed">تجميد الاشتراك سيوقف إمكانية الدخول مؤقتاً وسيتم تمديد نهاية الاشتراك بنفس المدة.</p>
                            </div>
                            <button
                                onClick={() => {
                                    alert('تم الطلب بنجاح');
                                    setShowFreeze(false);
                                }}
                                className="w-full py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase active:scale-95 transition-all"
                            >
                                تجميد الآن
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Smart Renew Modal */}
                {showRenew && (
                    <Modal title="تجديد اشتراك العضو" onClose={() => setShowRenew(false)}>
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">باقة الاشتراك</label>
                                    <select
                                        value={renewForm.priceId}
                                        onChange={(e) => setRenewForm({ ...renewForm, priceId: e.target.value })}
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none cursor-pointer"
                                    >
                                        <option value="">-- اختر الباقة --</option>
                                        {prices.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {activities.find(a => a.id === p.activityId)?.name} | {p.subscriptionName} | {p.price} SAR
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">تاريخ البدء</label>
                                    <input
                                        type="date"
                                        value={renewForm.startDate}
                                        onChange={(e) => setRenewForm({ ...renewForm, startDate: e.target.value })}
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                                    <select
                                        value={renewForm.paymentMethod}
                                        onChange={(e) => setRenewForm({ ...renewForm, paymentMethod: e.target.value })}
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none"
                                    >
                                        <option value="كاش">كاش</option>
                                        <option value="شبكة">شبكة</option>
                                        <option value="تحويل">تحويل</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">خصم يدوي %</label>
                                    <input
                                        type="number"
                                        value={renewForm.discountPercent}
                                        onChange={(e) => setRenewForm({ ...renewForm, discountPercent: parseFloat(e.target.value) || 0 })}
                                        className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>

                            {renewForm.priceId && (
                                <div className="p-4 bg-indigo-600 rounded-2xl text-white">
                                    <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-2">
                                        <span className="text-[10px] font-black uppercase opacity-60">تاريخ الانتهاء</span>
                                        <span className="text-xs font-bold">{calculateFinancials().endDate}</span>
                                    </div>
                                    <div className="flex justify-between items-baseline">
                                        <span className="text-[10px] font-black uppercase opacity-60">المبلغ الإجمالي</span>
                                        <span className="text-xl font-black">{Math.round(calculateFinancials().total)} SAR</span>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    if (!renewForm.priceId) return alert('الرجاء اختيار الباقة');
                                    setIsSaving(true);
                                    try {
                                        const fin = calculateFinancials();
                                        const newSub = {
                                            memberId: id,
                                            priceId: renewForm.priceId,
                                            activityId: fin.priceRecord?.activityId,
                                            typeId: fin.priceRecord?.typeId,
                                            startDate: renewForm.startDate,
                                            endDate: fin.endDate,
                                            basePrice: fin.basePrice,
                                            discountPercent: renewForm.discountPercent,
                                            discountAmount: fin.discountAmount,
                                            amountDue: fin.amountDue,
                                            vatPercent: parseFloat(profileClubSettings?.vatPercent || profileClubSettings?.vat_percent || '15'),
                                            vatAmount: fin.vatAmount,
                                            totalAmount: fin.total,
                                            paymentMethod: renewForm.paymentMethod,
                                            paymentStatus: 'مدفوع',
                                            notes: renewForm.notes,
                                            status: 'نشط',
                                            clubId: member.clubId || member.club_id,
                                            createdAt: new Date().toISOString()
                                        };

                                        await db.add('subscriptions', newSub);
                                        await db.add('revenueEntries', {
                                            clubId: newSub.clubId,
                                            amount: fin.total,
                                            date: renewForm.startDate,
                                            paymentMethod: renewForm.paymentMethod,
                                            note: `تجديد اشتراك العضو: ${member.name} - ${fin.priceRecord?.subscriptionName}`
                                        });

                                        alert('تم تجديد الاشتراك بنجاح');
                                        setShowRenew(false);
                                        loadMember();
                                    } catch (e) { console.error(e); }
                                    finally { setIsSaving(false); }
                                }}
                                disabled={isSaving || !renewForm.priceId}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                            >
                                {isSaving ? 'جاري التنفيذ...' : 'تأكيد التجديد الفوري'}
                            </button>
                        </div>
                    </Modal>
                )}

                {/* Edit Profile Modal */}
                {showEdit && (
                    <Modal title="تعديل بيانات العضو" onClose={() => setShowEdit(false)}>
                        <div className="space-y-4">
                            <InputField label="اسم العضو" value={editForm.name} onChange={(v: string) => setEditForm({ ...editForm, name: v })} />
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="رقم الجوال" value={editForm.phone} onChange={(v: string) => setEditForm({ ...editForm, phone: v })} />
                                <InputField label="البريد الإلكتروني" value={editForm.email} onChange={(v: string) => setEditForm({ ...editForm, email: v })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="رقم الهوية" value={editForm.nationalId} onChange={(v: string) => setEditForm({ ...editForm, nationalId: v })} />
                                <InputField label="تاريخ الميلاد" value={editForm.birthDate} onChange={(v: string) => setEditForm({ ...editForm, birthDate: v })} />
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <input
                                    type="checkbox"
                                    checked={!!editForm.vip}
                                    onChange={(e) => setEditForm({ ...editForm, vip: e.target.checked })}
                                    className="w-4 h-4 text-indigo-600 rounded"
                                />
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">عضوية ذهبية VIP</span>
                            </div>
                            <button
                                onClick={async () => {
                                    setIsSaving(true);
                                    try {
                                        await db.update('members', id as string, editForm);
                                        alert('تم تحديث البيانات بنجاح');
                                        setShowEdit(false);
                                        loadMember();
                                    } catch (e) { console.error(e); }
                                    finally { setIsSaving(false); }
                                }}
                                disabled={isSaving}
                                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase shadow-xl shadow-indigo-200 active:scale-95 transition-all"
                            >
                                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                            </button>
                        </div>
                    </Modal>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 0;
                    }
                    .no-print, .print-hidden, nav, header, aside { display: none !important; }
                    body { 
                        margin: 0; 
                        padding: 0; 
                        background: white !important; 
                        color: black !important;
                    }
                    #print-area {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(1.5);
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}

function SmallInfoRow({ label, value, icon, mono = false }: any) {
    return (
        <div className="flex items-center justify-between p-3 px-4 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-gray-200/30 dark:border-slate-800/50 transition-all group hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm">
            <div className="flex items-center gap-3">
                <div className="opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
                <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
            </div>
            <span className={`text-[10px] font-black group-hover:text-emerald-600 transition-colors ${mono ? 'font-mono' : ''} dark:text-white`}>{value}</span>
        </div>
    );
}

function TinyStatCard({ label, value, unit, icon, color }: any) {
    const colors: any = {
        blue: 'bg-blue-50 dark:bg-blue-900/10 text-blue-600',
        emerald: 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600',
        indigo: 'bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600',
        amber: 'bg-amber-50 dark:bg-amber-900/10 text-amber-600'
    };

    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-gray-300 dark:border-slate-800 flex flex-col gap-3 transition-all hover:scale-[1.02] cursor-default">
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-300 dark:text-slate-500 uppercase tracking-widest leading-none">{label}</span>
                <div className={`p-2 rounded-xl ${colors[color] || colors.blue}`}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-1 mt-auto">
                <span className="text-xl font-black text-slate-900 dark:text-white leading-none">{value}</span>
                {unit && <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">{unit}</span>}
            </div>
        </div>
    );
}

function InfoBlock({ label, value, highlight = false }: any) {
    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">{label}</span>
            <span className={`text-[11px] font-black ${highlight ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-900 dark:text-white'}`}>{value}</span>
        </div>
    );
}

function QuickActionBtn({ label, icon, color, onClick }: any) {
    const theme: any = {
        blue: {
            bg: 'bg-blue-50/50 dark:bg-blue-500/5',
            border: 'border-blue-100/50 dark:border-blue-500/20 hover:border-blue-500/50 dark:hover:border-blue-500/60',
            text: 'text-blue-600 dark:text-blue-400',
            glow: 'hover:shadow-[0_0_25px_-5px_rgba(59,130,246,0.3)] dark:hover:shadow-[0_0_35px_-5px_rgba(59,130,246,0.5)]',
            iconGlow: 'group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.6)]'
        },
        emerald: {
            bg: 'bg-emerald-50/50 dark:bg-emerald-500/5',
            border: 'border-emerald-100/50 dark:border-emerald-500/20 hover:border-emerald-500/50 dark:hover:border-emerald-500/60',
            text: 'text-emerald-600 dark:text-emerald-400',
            glow: 'hover:shadow-[0_0_25px_-5px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_0_35px_-5px_rgba(16,185,129,0.5)]',
            iconGlow: 'group-hover:drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]'
        },
        indigo: {
            bg: 'bg-indigo-50/50 dark:bg-indigo-500/5',
            border: 'border-indigo-100/50 dark:border-indigo-500/20 hover:border-indigo-500/50 dark:hover:border-indigo-500/60',
            text: 'text-indigo-600 dark:text-indigo-400',
            glow: 'hover:shadow-[0_0_25px_-5px_rgba(99,102,241,0.3)] dark:hover:shadow-[0_0_35px_-5px_rgba(99,102,241,0.5)]',
            iconGlow: 'group-hover:drop-shadow-[0_0_8px_rgba(99,102,241,0.6)]'
        },
        amber: {
            bg: 'bg-amber-50/50 dark:bg-amber-500/5',
            border: 'border-amber-100/50 dark:border-amber-500/20 hover:border-amber-500/50 dark:hover:border-amber-500/60',
            text: 'text-amber-600 dark:text-amber-400',
            glow: 'hover:shadow-[0_0_25px_-5px_rgba(245,158,11,0.3)] dark:hover:shadow-[0_0_35px_-5px_rgba(245,158,11,0.5)]',
            iconGlow: 'group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
        },
        rose: {
            bg: 'bg-rose-50/50 dark:bg-rose-500/5',
            border: 'border-rose-100/50 dark:border-rose-500/20 hover:border-rose-500/50 dark:hover:border-rose-500/60',
            text: 'text-rose-600 dark:text-rose-400',
            glow: 'hover:shadow-[0_0_25px_-5px_rgba(244,63,94,0.3)] dark:hover:shadow-[0_0_35px_-5px_rgba(244,63,94,0.5)]',
            iconGlow: 'group-hover:drop-shadow-[0_0_8px_rgba(244,63,94,0.6)]'
        }
    };

    const s = theme[color] || theme.blue;

    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col items-center justify-center p-6 rounded-[2.5rem] border transition-all duration-500 active:scale-95 group overflow-hidden ${s.bg} ${s.border} ${s.glow} hover:bg-white dark:hover:bg-slate-800/80`}
        >
            {/* Subtle Gradient Glow Layer */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 dark:opacity-0 dark:group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-br from-white via-transparent to-transparent`} />

            <div className={`mb-4 transition-all duration-500 group-hover:scale-125 group-hover:-translate-y-1 ${s.text} ${s.iconGlow}`}>
                {icon}
            </div>

            <span className={`text-[10px] font-black uppercase tracking-tight transition-all duration-500 group-hover:tracking-widest ${s.text} group-hover:text-slate-900 dark:group-hover:text-white`}>
                {label}
            </span>

            {/* Bottom Glow Line */}
            <div className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] group-hover:w-1/3 transition-all duration-700 rounded-full ${s.bg.replace('bg-', 'bg-').replace('/5', '/60')}`} />
        </button>
    );
}

function Modal({ title, children, onClose }: any) {
    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-white dark:bg-slate-900 w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden">
                <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                    <h3 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">{title}</h3>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 hover:bg-blue-600 hover:text-white rounded-xl shadow-sm transition-all border border-emerald-100 dark:border-emerald-900/30 group/btn active:scale-90">
                        <Plus className="w-4 h-4 icon-glow" />
                    </button>
                </div>
                <div className="p-8">{children}</div>
            </motion.div>
        </div>
    );
}

function InputField({ label, value, onChange }: any) {
    return (
        <div className="space-y-1.5 flex-1 text-right">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">{label}</label>
            <input
                type="text" value={value ?? ""} onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-4 py-3 text-xs font-black text-slate-900 dark:text-white outline-none transition-all"
            />
        </div>
    );
}
