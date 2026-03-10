"use client";

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { PlusCircle, Loader2, Search, UserPlus, FileText, Link2, CheckCircle2, Save, UserPlus2, Wallet, Calendar, ArrowRightLeft, CreditCard, ChevronDown, Activity, Info, Gift, Settings2, UserCog, UserCheck, Clock, Check, Shield, User, ChevronUp, MoreHorizontal, Printer, Download, Share2, XCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AddMemberModal } from '@/components/members/AddMemberModal';
import { DatePicker } from '@/components/ui/date-picker';
import DeleteModal from '@/components/DeleteModal';

export default function SubscriptionsPage() {
    const [prices, setPrices] = useState<any[]>([]);
    const [activities, setActivities] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [memberSubscriptions, setMemberSubscriptions] = useState<any[]>([]);
    const [revenueTypes, setRevenueTypes] = useState<any[]>([]);
    const [promotions, setPromotions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedMember, setSelectedMember] = useState<any>(null);
    const [memberSearch, setMemberSearch] = useState('');
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);

    // Form states
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedPriceId, setSelectedPriceId] = useState('');
    const [selectedCoachId, setSelectedCoachId] = useState('');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [paymentMethod, setPaymentMethod] = useState('كاش');
    const [paymentStatus, setPaymentStatus] = useState('مدفوع');
    const [notes, setNotes] = useState('');
    const [discountPercent, setDiscountPercent] = useState(0);
    const [vatPercent, setVatPercent] = useState(15);
    const [couponCode, setCouponCode] = useState('');
    const [coaches, setCoaches] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [selectedPromotionId, setSelectedPromotionId] = useState('');
    const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
    const [activeMenuSubId, setActiveMenuSubId] = useState<string | null>(null);
    const [selectedActionSub, setSelectedActionSub] = useState<any>(null);
    const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
    const [bonusDays, setBonusDays] = useState(0);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [systemSettings, setSystemSettings] = useState<any>(null);
    const [clubSettings, setClubSettings] = useState<any>(null);
    const [clubProfile, setClubProfile] = useState<any>(null);
    const [multiPayment, setMultiPayment] = useState({ cash: 0, network: 0, transfer: 0 });
    const [confirmConfig, setConfirmConfig] = useState({
        title: '',
        message: '',
        confirmText: '',
        variant: 'danger' as 'danger' | 'info',
        icon: null as React.ReactNode,
        onConfirm: () => { }
    });

    // Derived Financials
    const [financials, setFinancials] = useState({
        duration: 0,
        endDate: '',
        basePrice: 0,
        discountAmount: 0,
        amountDue: 0,
        vatAmount: 0,
        total: 0
    });

    useEffect(() => {
        loadData();
    }, []);

    // Handle outside click to close dropdown menu
    useEffect(() => {
        const handleClickOutside = () => {
            if (activeMenuSubId) {
                setActiveMenuSubId(null);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [activeMenuSubId]);

    // Automatic Receipt Printing based on settings
    useEffect(() => {
        if (isReceiptModalOpen && receiptData && clubSettings?.printReceiptPos) {
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [isReceiptModalOpen, receiptData, clubSettings]);

    const loadData = async () => {
        setLoading(true);
        const clubId = await db.getClubId();
        const [pricesData, activitiesData, typesData, membersData, subsData, empsData, revTypesData, promoData, settingsData, clubSettingsData, clubProfileData] = await Promise.all([
            db.getAll('subscription_prices'),
            db.getAll('activities'),
            db.getAll('subscription_types'),
            db.getAll('members'),
            db.getAll('subscriptions'),
            db.getAll('employees'),
            db.getAll('revenueTypes'),
            db.getAll('promotions'),
            db.getAll('system_settings'),
            db.getAll('club_settings'),
            db.getAll('club_profiles')
        ]);
        setPrices(pricesData?.filter((p: any) => p.status === 'نشط') || []);
        setActivities(activitiesData || []);
        setTypes(typesData || []);
        setMembers(membersData || []);
        setMemberSubscriptions(subsData || []);
        setCoaches(empsData?.filter((e: any) => e.jobRole === 'coach') || []);
        setRevenueTypes(revTypesData || []);
        setPromotions(promoData?.filter((p: any) => p.status === 'نشط' || p.status === 'Active' || !p.status) || []);
        setSystemSettings(settingsData && settingsData.length > 0 ? settingsData[0] : null);

        // Load club-specific settings (VAT, receipt, etc.)
        const myClubSettings = clubSettingsData?.find((s: any) => s.clubId === clubId || s.club_id === clubId);
        setClubSettings(myClubSettings || null);
        if (myClubSettings?.vat_percent !== undefined && myClubSettings?.vat_percent !== null) {
            setVatPercent(parseFloat(myClubSettings.vat_percent));
        } else if (myClubSettings?.vatPercent !== undefined && myClubSettings?.vatPercent !== null) {
            setVatPercent(parseFloat(myClubSettings.vatPercent));
        }
        // Load club profile (organization identity)
        const myProfile = clubProfileData?.find((p: any) => p.clubId === clubId || p.club_id === clubId);
        setClubProfile(myProfile || null);
        setLoading(false);
    };

    useEffect(() => {
        if (!selectedPriceId) return;

        const priceRecord = prices.find(p => p.id === selectedPriceId);
        const typeRecord = types.find(t => t.id === priceRecord?.typeId);
        const promoRecord = promotions.find(p => p.id === selectedPromotionId);

        let durationDays = parseInt(typeRecord?.durationDays || '30');
        if (promoRecord?.extraDays) {
            durationDays += parseInt(promoRecord.extraDays);
        }

        const start = new Date(startDate);
        const end = new Date(start);
        end.setDate(end.getDate() + durationDays);

        const base = parseFloat(priceRecord?.price || '0');
        const promoDiscount = parseFloat(promoRecord?.discountPercent || '0');
        const manualDiscount = parseFloat(discountPercent.toString()) || 0;

        // Use promotion discount if applicable, otherwise manual
        const effectiveDiscount = promoRecord ? promoDiscount : manualDiscount;

        const discAmount = base * (effectiveDiscount / 100);
        const due = base - discAmount;
        const vat = due * (vatPercent / 100);
        const total = due + vat;

        setFinancials({
            duration: durationDays,
            endDate: end.toISOString().split('T')[0],
            basePrice: base,
            discountAmount: discAmount,
            amountDue: due,
            vatAmount: vat,
            total: total
        });
    }, [selectedPriceId, startDate, discountPercent, prices, types, vatPercent, selectedPromotionId, promotions]);

    const getActivityName = (idOrIds: any) => {
        if (!idOrIds || (Array.isArray(idOrIds) && idOrIds.length === 0)) return 'غير معروف';
        const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
        const names = ids.map(id => activities.find(a => a.id === id)?.name).filter(Boolean);
        return names.length > 0 ? names.join(' + ') : 'غير معروف';
    };
    const getTypeName = (id: string) => types.find(t => t.id === id)?.name || 'غير معروف';

    const filteredMembers = members.filter(m =>
        (m.name?.includes(memberSearch)) ||
        (m.phone?.includes(memberSearch)) ||
        (m.nationalId?.includes(memberSearch)) ||
        (m.membershipNumber?.includes(memberSearch))
    );

    const handleSelectMember = (m: any) => {
        setSelectedMember(m);
        setMemberSearch(m.name);
        setShowMemberDropdown(false);
        setIsFormOpen(false);
    };

    const handleSaveSubscription = async () => {
        if (!selectedMember || !selectedPriceId) return;
        setIsSaving(true);
        try {
            const priceRecord = prices.find(p => p.id === selectedPriceId);

            const multiPaymentNote = paymentMethod === 'طرق متعددة'
                ? `\n[تفصيل الدفع: كاش: ${multiPayment.cash}, شبكة: ${multiPayment.network}, تحويل: ${multiPayment.transfer}]`
                : '';

            const newSub = {
                memberId: selectedMember.id,
                priceId: selectedPriceId,
                activityId: (priceRecord?.activitiesList && priceRecord.activitiesList.length > 0) ? priceRecord.activitiesList[0] : priceRecord?.activityId,
                typeId: priceRecord?.typeId,
                coachId: selectedCoachId || null,
                promotionId: selectedPromotionId || null,
                startDate: startDate,
                endDate: financials.endDate,
                basePrice: financials.basePrice,
                discountPercent: selectedPromotionId ? 0 : discountPercent,
                promotionDiscount: selectedPromotionId ? promotions.find(p => p.id === selectedPromotionId)?.discountPercent : 0,
                discountAmount: financials.discountAmount,
                amountDue: financials.amountDue,
                vatPercent: vatPercent,
                vatAmount: financials.vatAmount,
                totalAmount: financials.total,
                paymentMethod: paymentMethod,
                paymentStatus: paymentStatus,
                notes: notes + multiPaymentNote,
                couponCode: couponCode,
                status: 'نشط',
                clubId: selectedMember.clubId || db.getClubId(),
                createdAt: new Date().toISOString()
            };

            const result = await db.add('subscriptions', newSub);

            // Record in Revenue Entries if paid
            if (paymentStatus === 'مدفوع') {
                const revenueTypeName = priceRecord?.revenueType || 'اشتراكات عامة';
                const revenueType = revenueTypes.find(t => t.name === revenueTypeName);

                await db.add('revenueEntries', {
                    clubId: newSub.clubId,
                    typeId: revenueType?.id || null,
                    amount: financials.total,
                    date: startDate,
                    paymentMethod: paymentMethod,
                    note: `اشتراك جديد: ${selectedMember.name} - ${priceRecord?.subscriptionName}`
                });
            }

            const subsData = await db.getAll('subscriptions');
            setMemberSubscriptions(subsData || []);

            setIsSubscriptionModalOpen(false);
            setReceiptData({ ...newSub, id: result?.id || '---' });
            setIsReceiptModalOpen(true);
            setIsFormOpen(false);
            // alert('تم تسجيل الاشتراك بنجاح!');
        } catch (error) {
            console.error(error);
            alert('حدث خطأ أثناء تسجيل الاشتراك');
        }
        setIsSaving(false);
    };

    const handleAction = async (sub: any, actionType: string) => {
        setActiveMenuSubId(null);
        setSelectedActionSub(sub);

        try {
            switch (actionType) {
                case 'freeze':
                    setConfirmConfig({
                        title: 'إيقاف الاشتراك',
                        message: 'هل أنت متأكد من إيقاف هذا الاشتراك مؤقتاً؟ سيتم تجميد أيام الاشتراك المتبقية.',
                        confirmText: 'نعم، إيقاف مؤقت',
                        variant: 'info',
                        icon: <Clock className="w-6 h-6 relative z-10" />,
                        onConfirm: async () => {
                            await db.update('subscriptions', sub.id, { status: 'موقوف' });
                            await loadData();
                        }
                    });
                    setIsConfirmModalOpen(true);
                    break;
                case 'activate':
                    await db.update('subscriptions', sub.id, { status: 'نشط' });
                    await loadData();
                    break;
                case 'cancel':
                    setConfirmConfig({
                        title: 'إلغاء الاشتراك',
                        message: 'هل أنت متأكد من طلب إرجاع (إلغاء) هذا الاشتراك؟ سيتم تغيير الحالة إلى ملغي.',
                        confirmText: 'نعم، إلغاء الاشتراك',
                        variant: 'danger',
                        icon: <XCircle className="w-6 h-6 relative z-10" />,
                        onConfirm: async () => {
                            await db.update('subscriptions', sub.id, { status: 'ملغي' });
                            await loadData();
                        }
                    });
                    setIsConfirmModalOpen(true);
                    break;
                case 'bonus':
                    setIsBonusModalOpen(true);
                    setBonusDays(0);
                    break;
                case 'print_receipt':
                    setReceiptData(sub);
                    setIsReceiptModalOpen(true);
                    break;
                default:
                    alert('هذا الإجراء غير مفعل حالياً وسيتم إضافته قريباً');
                    console.log('Action not implemented');
                    break;
            }
        } catch (error) {
            console.error('Action error:', error);
        }
    };

    const handleAddBonus = async () => {
        if (!selectedActionSub || bonusDays <= 0) return;
        try {
            const currentEnd = new Date(selectedActionSub.endDate);
            currentEnd.setDate(currentEnd.getDate() + bonusDays);

            await db.update('subscriptions', selectedActionSub.id, {
                endDate: currentEnd.toISOString().split('T')[0],
                notes: (selectedActionSub.notes || '') + `\n[تم إضافة ${bonusDays} أيام مكافأة في ${new Date().toLocaleDateString()}]`
            });

            await loadData();
            setIsBonusModalOpen(false);
            alert('تم إضافة الأيام بنجاح');
        } catch (error) {
            alert('خطأ في إضافة الأيام');
        }
    };

    const currentMemberSubs = memberSubscriptions.filter(s => s.memberId === selectedMember?.id);

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* Ultra Compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 px-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <UserPlus className="w-5 h-5 icon-glow" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tighter">تسجيل عضوية واشتراك جديد</h2>
                        <p className="text-[10px] font-bold text-gray-400">نظام إدارة العضويات والاشتراكات الموحد</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsAddMemberOpen(true)} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-black shadow-lg shadow-indigo-600/20 transition-all active:scale-[0.98]">
                        <PlusCircle className="w-3.5 h-3.5" />
                        إضافة عضو جديد
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Slim Sidebar - Member Selection */}
                <div className="lg:col-span-1 space-y-3">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 pb-3 shadow-sm border border-gray-300 dark:border-slate-800">
                        <div className="flex flex-col gap-2 relative">
                            {/* Trigger Button */}
                            <div
                                onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                                className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-slate-700 rounded-xl text-[11px] font-bold cursor-pointer flex justify-between items-center shadow-sm hover:border-indigo-400 transition-all text-indigo-700 dark:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/80"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Search className="w-3.5 h-3.5" />
                                    <span>{selectedMember ? selectedMember.name : "من فضلك اضغط للبحث عن عميل"}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`} />
                            </div>

                            {/* Dropdown Menu */}
                            <AnimatePresence>
                                {showMemberDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 5 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-[100] overflow-hidden flex flex-col"
                                    >
                                        <div className="p-2 border-b border-gray-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 sticky top-0">
                                            <div className="relative">
                                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                                <input
                                                    autoFocus
                                                    type="text"
                                                    value={memberSearch}
                                                    onChange={(e) => setMemberSearch(e.target.value)}
                                                    placeholder="ابحث بالاسم، الحرف، الهاتف، أو السجل..."
                                                    className="w-full pr-9 pl-4 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold outline-none focus:border-indigo-500 transition-all dark:text-white"
                                                    onClick={(e) => e.stopPropagation()}
                                                />
                                            </div>
                                        </div>

                                        <div className="max-h-60 overflow-y-auto custom-scrollbar divide-y divide-gray-100 dark:divide-slate-700">
                                            {filteredMembers.length > 0 ? filteredMembers.map(m => (
                                                <div key={m.id} onClick={() => handleSelectMember(m)} className="p-3 hover:bg-indigo-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors flex flex-col justify-center">
                                                    <div className="font-black text-xs text-slate-900 dark:text-white">{m.name}</div>
                                                    <div className="text-[10px] text-gray-400 mt-1 flex gap-2"><span>{m.phone}</span> • <span>{m.membershipNumber || m.id.substring(0, 6)}</span></div>
                                                </div>
                                            )) : (
                                                <div className="p-6 text-center text-xs font-bold text-gray-400 flex flex-col items-center justify-center gap-2">
                                                    <Info className="w-5 h-5 opacity-50" />
                                                    لا توجد نتائج مطابقة
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {selectedMember ? (
                            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="pt-3 border-t border-gray-200 dark:border-slate-800 mt-3 space-y-3">
                                {/* Profile Picture Area */}
                                <div className="flex flex-col items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-600 font-black text-2xl border border-white dark:border-slate-900 shadow-sm overflow-hidden relative">
                                        {selectedMember.avatar ? (
                                            <img src={selectedMember.avatar} alt="صورة العضو" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-7 h-7 text-indigo-300" />
                                        )}
                                        {selectedMember.vip && (
                                            <div className="absolute top-0 right-0 w-6 h-6 bg-amber-500 rounded-full border-2 border-white flex items-center justify-center text-white">
                                                <Shield className="w-3 h-3" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs font-black text-indigo-700 dark:text-indigo-400 mt-1.5">{selectedMember.name}</div>
                                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">عضو للآن : {(selectedMember.createdAt?.split('T')[0] || '---')}</div>
                                </div>

                                {/* Detailed Info Table */}
                                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-slate-800 mb-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                                    <DetailRow label="رقم العضوية" value={selectedMember.membershipNumber || selectedMember.id?.substring(0, 8) || '---'} />
                                    <DetailRow label="اسم العميل" value={selectedMember.name || '---'} />
                                    <DetailRow label="رقم الهوية" value={selectedMember.nationalId || '---'} />
                                    <DetailRow label="رقم الجوال" value={selectedMember.phone || '---'} />
                                    <DetailRow label="البريد الإلكتروني" value={selectedMember.email || '---'} />
                                    <DetailRow label="تاريخ الميلاد" value={selectedMember.birthDate || '---'} />
                                    <DetailRow label="الجنسية" value={selectedMember.nationality || '---'} />
                                    <DetailRow label="العنوان" value={selectedMember.address || '---'} />
                                    <DetailRow label="عميل VIP" value={
                                        <div className="flex items-center">
                                            <input type="checkbox" readOnly checked={selectedMember.vip || false} className="w-3.5 h-3.5 rounded text-indigo-600 bg-gray-100 border-gray-300 outline-none" />
                                        </div>
                                    } />
                                    <DetailRow label="موظف المبيعات" value={auth.getCurrentUser()?.name || 'sys admin'} color="text-gray-500" />
                                </div>

                                {/* Actions Block */}
                                <div className="flex items-center justify-center gap-3 py-2 border-y border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                                    <button className="flex items-center gap-1.5 text-[9px] font-black text-slate-700 dark:text-gray-300 hover:text-indigo-600 transition-colors">
                                        <FileText className="w-3 h-3" />
                                        عرض العقد الإلكتروني
                                    </button>
                                    <div className="w-px h-3 bg-gray-300 dark:bg-slate-700"></div>
                                    <button className="flex items-center gap-1.5 text-[9px] font-black text-slate-700 dark:text-gray-300 hover:text-emerald-600 transition-colors">
                                        <Share2 className="w-3 h-3" />
                                        إرسال العقد الإلكتروني
                                    </button>
                                </div>

                                {/* Coupon */}
                                <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 p-3 rounded-xl flex flex-col items-center gap-2 relative overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.02)] mt-1.5">
                                    <div className="w-full flex justify-between items-center mb-0.5">
                                        <span className="text-[9px] font-black text-gray-500">كوبون خصم</span>
                                        <Gift className="w-3.5 h-3.5 text-rose-500" />
                                    </div>
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                        className="w-full text-center text-lg font-black text-amber-500 bg-transparent outline-none uppercase placeholder-gray-200 dark:placeholder-slate-700"
                                        placeholder="TWEDUE"
                                    />
                                    <button className="w-full bg-[#62c130] hover:bg-[#52a826] text-white py-1.5 rounded-lg text-[10px] font-black transition-colors">
                                        تخصيص الكوبون
                                    </button>
                                </div>

                            </motion.div>
                        ) : (
                            <div className="py-10 text-center text-[10px] font-bold text-gray-300 italic flex flex-col items-center gap-2">
                                <div className="w-8 h-8 rounded-full border border-dashed border-gray-200 flex items-center justify-center"><Search className="w-4 h-4 icon-glow" /></div>
                                اختر عضو لبدء الاشتراك
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Registration Content */}
                <div className="lg:col-span-3 space-y-4">

                    {selectedMember ? (
                        <>
                            {/* Registration Form - Ultra Compact */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800">
                                <div className="p-3 px-4 border-b border-gray-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
                                    <h3 className="text-[11px] font-black text-gray-500 uppercase flex items-center gap-2">
                                        <Wallet className="w-3.5 h-3.5 text-indigo-500" /> إدارة اشتراكات العضو
                                    </h3>
                                    <button
                                        onClick={() => setIsSubscriptionModalOpen(true)}
                                        className="bg-blue-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl font-black text-[11px] shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2 active:scale-95"
                                    >
                                        <PlusCircle className="w-4 h-4 icon-glow" />
                                        <span>إضافة اشتراك جديد</span>
                                    </button>
                                </div>

                            </div>

                            {/* Previous Subscriptions Log */}
                            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800">
                                <div className="p-3 px-4 border-b border-gray-200 dark:border-slate-800 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" />
                                    <h3 className="text-[11px] font-black text-gray-500 uppercase">سجل اشتراكات العميل المكتشفة</h3>
                                </div>
                                <div className="">
                                    <table className="table-display-premium">
                                        <thead className="table-header-premium">
                                            <tr>
                                                <th className="px-2 py-1.5 text-center first:rounded-tr-2xl border-l border-white/5 w-10">الحالة</th>
                                                <th className="px-3 py-1.5 text-right border-l border-white/5 last:border-l-0">رقم العضوية</th>
                                                <th className="px-3 py-1.5 text-right border-l border-white/5 last:border-l-0">اسم المشترك</th>
                                                <th className="px-3 py-1.5 text-right border-l border-white/5 last:border-l-0">نوع الاشتراك</th>
                                                <th className="px-3 py-1.5 text-center border-l border-white/5 last:border-l-0">بداية الاشتراك</th>
                                                <th className="px-3 py-1.5 text-center border-l border-white/5 last:border-l-0">نهاية الاشتراك</th>
                                                <th className="px-3 py-1.5 text-center last:rounded-tl-2xl border-l border-white/5 last:border-l-0">الإجراءات</th>
                                            </tr>
                                        </thead>

                                        <tbody className="divide-y divide-gray-400 dark:divide-slate-800 text-[11px] font-bold">
                                            {currentMemberSubs.length > 0 ? (
                                                currentMemberSubs.map((sub) => (
                                                    <React.Fragment key={sub.id}>
                                                        <tr className={`table-row-premium hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors border-b border-gray-200 dark:border-slate-800 cursor-pointer ${expandedSubId === sub.id ? 'bg-cyan-50/30' : ''} ${activeMenuSubId === sub.id ? 'relative z-[110]' : ''}`} onClick={() => setExpandedSubId(expandedSubId === sub.id ? null : sub.id)}>
                                                            <td className="px-2 py-1.5 text-center border-l border-gray-100/20">
                                                                <div className="flex justify-center items-center">
                                                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-black ${sub.status === 'موقوف' ? 'bg-orange-500 text-white shadow-sm' :
                                                                        (sub.status === 'ملغي' || (sub.endDate && sub.endDate < new Date().toISOString().split('T')[0]) ? 'bg-rose-500 text-white shadow-sm' :
                                                                            'bg-emerald-500 text-white shadow-sm')
                                                                        }`}>
                                                                        {sub.status === 'موقوف' ? 'موقوف' : (sub.status === 'ملغي' || (sub.endDate && sub.endDate < new Date().toISOString().split('T')[0]) ? 'منتهي' : (sub.status || 'نشط'))}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-1.5 font-black text-gray-500 border-l border-gray-100/20 last:border-l-0">{selectedMember.membershipNumber || selectedMember.id.substring(0, 6)}</td>
                                                            <td className="px-4 py-1.5 text-right font-black text-slate-900 dark:text-white border-l border-gray-100/20 last:border-l-0">{selectedMember.name}</td>
                                                            <td className="px-4 py-1.5 border-l border-gray-100/20 last:border-l-0">
                                                                <div className="flex flex-col">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <span className="text-slate-900 dark:text-white font-black">{getActivityName(sub.activityId)}</span>
                                                                        {sub.promotionId && (
                                                                            <span className="bg-rose-100 text-rose-600 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                                                                <Gift className="w-2.5 h-2.5" />
                                                                                عرض
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[9px] text-gray-400">{getTypeName(sub.typeId)}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-1.5 text-center text-gray-600 font-bold border-l border-gray-100/20 last:border-l-0">{sub.startDate}</td>
                                                            <td className="px-4 py-1.5 text-center text-rose-500 font-bold border-l border-gray-100/20 last:border-l-0">{sub.endDate}</td>
                                                            <td className="px-4 py-1.5 text-center border-l border-gray-100/20 last:border-l-0">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <div className="relative">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setActiveMenuSubId(activeMenuSubId === sub.id ? null : sub.id);
                                                                            }}
                                                                            className="bg-[#1e293b] hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
                                                                        >
                                                                            <span>الإجراءات</span>
                                                                            <ChevronDown className={`w-3 h-3 transition-transform ${activeMenuSubId === sub.id ? 'rotate-180' : ''}`} />
                                                                        </button>

                                                                        <AnimatePresence>
                                                                            {activeMenuSubId === sub.id && (
                                                                                <motion.div
                                                                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                                                    className="absolute left-0 mt-2 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-gray-300 dark:border-slate-800 z-[110] overflow-hidden"
                                                                                >
                                                                                    <div className="flex flex-col text-right">
                                                                                        {[
                                                                                            { label: 'طباعة إيصال الدفع', action: 'print_receipt', color: 'border-rose-600' },
                                                                                            { label: 'تعديل اشتراك العضوية', action: 'edit', color: 'border-amber-500' },
                                                                                            { label: 'طلب إرجاع الاشتراك', action: 'cancel', color: 'border-slate-800' },
                                                                                            { label: sub.status === 'موقوف' ? 'تفعيل الاشتراك' : 'إيقاف مؤقت للاشتراك', action: sub.status === 'موقوف' ? 'activate' : 'freeze', color: sub.status === 'موقوف' ? 'border-emerald-500' : 'border-amber-400' },
                                                                                            { label: 'عرض بيانات توقف العضوية', action: 'view_hold', color: 'border-sky-500' },
                                                                                            { label: 'تبديل الاشتراك مع عضو آخر', action: 'transfer', color: 'border-emerald-500' },
                                                                                            { label: 'وضع قيود على الاشتراك', action: 'restrict', color: 'border-orange-500' },
                                                                                            { label: 'مكافئة أيام إضافية', action: 'bonus', color: 'border-purple-500' },
                                                                                            { label: 'طباعة بطاقة الحضور', action: 'print_attendance', color: 'border-rose-600' },
                                                                                            { label: 'طباعة كارت التعريف', action: 'print_id', color: 'border-emerald-500' },
                                                                                            { label: 'طباعة تقرير الدخول للأنشطة', action: 'print_report', color: 'border-sky-500' },
                                                                                        ].map((item, idx) => (
                                                                                            <button
                                                                                                key={idx}
                                                                                                onClick={(e) => { e.stopPropagation(); handleAction(sub, item.action); }}
                                                                                                className={`px-4 py-2.5 text-[10px] font-black text-gray-700 dark:text-gray-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-r-4 ${item.color} text-right flex items-center justify-between group border-b border-gray-200 dark:border-slate-800/50 last:border-none`}
                                                                                            >
                                                                                                <span>{item.label}</span>
                                                                                            </button>
                                                                                        ))}
                                                                                    </div>
                                                                                </motion.div>
                                                                            )}
                                                                        </AnimatePresence>
                                                                    </div>
                                                                    {expandedSubId === sub.id ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                        <AnimatePresence>
                                                            {expandedSubId === sub.id && (
                                                                <tr>
                                                                    <td colSpan={7} className="p-0 border-none border-l border-gray-100/20 last:border-l-0">
                                                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                                                            <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-gray-300 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">

                                                                                {/* Right Section: Subscription Details */}
                                                                                <div className="space-y-3">
                                                                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-800 divide-y divide-gray-400 dark:divide-slate-800 shadow-sm">
                                                                                        <DetailRow label="تاريخ التسجيل" value={sub.createdAt ? new Date(sub.createdAt).toLocaleString('en-US', { hour12: true }) : '---'} />
                                                                                        <DetailRow label="التسجيل بواسطة" value={sub.createdBy || auth.getCurrentUser()?.name || 'مدير النظام'} />
                                                                                        <DetailRow label="تاريخ آخر تعديل" value={sub.updatedAt ? new Date(sub.updatedAt).toLocaleString('en-US', { hour12: true }) : '---'} />
                                                                                        <DetailRow label="التعديل بواسطة" value={sub.updatedBy || '---'} />
                                                                                        <DetailRow label="عدد مرات الحضور" value={sub.attendanceCount || 0} />
                                                                                        <DetailRow
                                                                                            label="حالة الاشتراك"
                                                                                            value={
                                                                                                <div className="flex items-center gap-2">
                                                                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${sub.status === 'نشط' ? 'bg-emerald-100 text-emerald-600' : sub.status === 'موقوف' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'}`}>
                                                                                                        {sub.status || 'نشط'}
                                                                                                    </span>
                                                                                                    {sub.status === 'موقوف' && (
                                                                                                        <button
                                                                                                            onClick={(e) => { e.stopPropagation(); handleAction(sub, 'activate'); }}
                                                                                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-0.5 rounded-lg shadow-sm text-[9px] font-black transition-colors"
                                                                                                        >
                                                                                                            تفعيل الآن
                                                                                                        </button>
                                                                                                    )}
                                                                                                </div>
                                                                                            }
                                                                                        />
                                                                                        <DetailRow label="اشتراك قابل للإيقاف" value={sub.status === 'نشط' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-gray-400" />} />
                                                                                        <DetailRow label="تحت إشراف المدرب" value={sub.coachId ? coaches.find(c => c.id === sub.coachId)?.name : 'غير محدد'} color="text-indigo-600" />
                                                                                    </div>
                                                                                </div>

                                                                                {/* Left Section: Financials & Days */}
                                                                                <div className="space-y-3">
                                                                                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-300 dark:border-slate-800 p-3 space-y-2 shadow-sm">
                                                                                        <div className="flex justify-between items-center text-[10px] font-black">
                                                                                            <span className="text-emerald-600 uppercase tracking-widest">قيمة الاشتراك</span>
                                                                                            <span className="text-slate-900 dark:text-white">{sub.basePrice}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center text-[10px] font-black">
                                                                                            <span className="text-rose-500 uppercase tracking-widest">الخصم %</span>
                                                                                            <span className="text-slate-900 dark:text-white">{sub.discountPercent || (sub.promotionDiscount || 0)}</span>
                                                                                        </div>
                                                                                        <div className="flex justify-between items-center text-[11px] font-black">
                                                                                            <span className="text-gray-400 uppercase tracking-widest">القيمة المضافة</span>
                                                                                            <span className="text-slate-900 dark:text-white font-bold">{sub.vatAmount || 0}</span>
                                                                                        </div>
                                                                                        <div className="pt-2 border-t border-gray-200 dark:border-slate-800 flex justify-between items-center text-[11px] md:text-[12px] font-black">
                                                                                            <span className="text-emerald-600 uppercase tracking-widest">الإجمالي</span>
                                                                                            <span className="text-slate-900 dark:text-white">{sub.totalAmount}</span>
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="bg-white dark:bg-slate-900 rounded-xl border-t-4 border-amber-400 shadow-sm overflow-hidden">
                                                                                        <div className="grid grid-cols-7 text-center">
                                                                                            {['الجمعة', 'الخميس', 'الأربعاء', 'الثلاثاء', 'الاثنين', 'الأحد', 'السبت'].map((day) => (
                                                                                                <div key={day} className="py-2 text-[10px] font-black text-white bg-cyan-400 border-x border-white/20">
                                                                                                    {day}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                        <div className="p-3 bg-slate-50/50 dark:bg-slate-800/50 flex justify-center items-center">
                                                                                            <button className="bg-white dark:bg-slate-900 border border-emerald-400 text-emerald-500 px-5 py-1.5 rounded-lg text-[10px] md:text-xs font-black shadow-sm hover:bg-emerald-50 transition-all">تخصيص الأكاديمية</button>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>

                                                                            </div>
                                                                        </motion.div>
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </AnimatePresence>
                                                    </React.Fragment>
                                                ))
                                            ) : (
                                                <tr><td colSpan={7} className="py-14 text-center text-gray-300 italic opacity-60 border-l border-gray-100/20 last:border-l-0">لا توجد بيانات اشتراك سجلت سابقاً لهذا العميل</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50/30 dark:bg-slate-900/30 rounded-3xl border-2 border-dashed border-gray-300 dark:border-slate-800/50">
                            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-3 text-center max-w-xs">
                                <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-slate-800 flex items-center justify-center text-indigo-200 dark:text-slate-700 shadow-inner">
                                    <Search className="w-6 h-6" />
                                </div>
                                <h3 className="text-sm font-black text-gray-400 dark:text-slate-500 uppercase tracking-tighter">انتظار اختيار العميل</h3>
                                <p className="text-[10px] font-bold text-gray-400 dark:text-slate-600 leading-relaxed px-4">يرجى البحث عن العميل عن طريق الاسم أو رقم الجوال من القائمة الجانبية للبدء في إجراءات الاشتراك</p>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>

            <AddMemberModal
                isOpen={isAddMemberOpen}
                onClose={() => setIsAddMemberOpen(false)}
                onSuccess={() => {
                    loadData();
                    alert('تم إضافة العضو بنجاح!');
                }}
            />

            <AnimatePresence>
                {isBonusModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/20"
                        >
                            <div className="flex flex-col items-center text-center gap-6">
                                <div className="w-20 h-20 bg-purple-50 dark:bg-purple-900/20 rounded-[2rem] flex items-center justify-center text-purple-600">
                                    <Gift className="w-10 h-10" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">إضافة أيام مكافأة</h3>
                                    <p className="text-xs font-bold text-gray-400 mt-2">قم بتحديد عدد الأيام الإضافية التي ترغب بإضافتها لهذا الاشتراك</p>
                                </div>

                                <div className="w-full space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-gray-300 dark:border-slate-800">
                                        <label className="text-[10px] font-black text-gray-400 uppercase mb-2 block text-right">عدد الأيام</label>
                                        <input
                                            type="number"
                                            value={bonusDays}
                                            onChange={(e) => setBonusDays(parseInt(e.target.value) || 0)}
                                            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-800 rounded-xl py-3 text-center text-xl font-black outline-none focus:ring-2 ring-purple-500/20 transition-all font-mono"
                                            placeholder="0"
                                        />
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleAddBonus}
                                            className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-xs shadow-lg shadow-purple-500/20 transition-all"
                                        >
                                            تأكيد الإضافة
                                        </button>
                                        <button
                                            onClick={() => setIsBonusModalOpen(false)}
                                            className="px-6 py-4 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all"
                                        >
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DeleteModal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                onConfirm={async () => {
                    await confirmConfig.onConfirm();
                    setIsConfirmModalOpen(false);
                }}
                title={confirmConfig.title}
                message={confirmConfig.message}
                confirmText={confirmConfig.confirmText}
                variant={confirmConfig.variant}
                icon={confirmConfig.icon}
            />

            {/* Comprehensive Subscription Modal */}
            <AnimatePresence>
                {isSubscriptionModalOpen && selectedMember && (
                    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 30 }}
                            className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/20 w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Modal Header */}
                            <div className="p-6 border-b border-gray-300 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                        <Wallet className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">نافذة تسجيل الاشتراك</h2>
                                        <p className="text-[10px] font-bold text-gray-400">للعضو: <span className="text-indigo-600">{selectedMember.name}</span></p>
                                    </div>
                                </div>
                                <button onClick={() => setIsSubscriptionModalOpen(false)} className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm border border-gray-300 dark:border-slate-700">
                                    <PlusCircle className="w-5 h-5 rotate-45" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                                    {/* Main Form Section */}
                                    <div className="lg:col-span-8 space-y-6">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">باقة الاشتراك</label>
                                                <select
                                                    value={selectedPriceId}
                                                    onChange={(e) => setSelectedPriceId(e.target.value)}
                                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all dark:text-white"
                                                >
                                                    <option value="">-- اختر الباقة --</option>
                                                    {prices.map(p => (
                                                        <option key={p.id} value={p.id}>{p.subscriptionName || getActivityName(p.activitiesList || p.activityId)} | {getTypeName(p.typeId)} | {p.price} ريال</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">تاريخ البدء</label>
                                                <input
                                                    type="date"
                                                    value={startDate}
                                                    onChange={(e) => setStartDate(e.target.value)}
                                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all dark:text-white"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">طريقة الدفع</label>
                                                <select
                                                    value={paymentMethod}
                                                    onChange={(e) => setPaymentMethod(e.target.value)}
                                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all dark:text-white"
                                                >
                                                    <option value="كاش">نقدي (Cash)</option>
                                                    <option value="شبكة">مدى / بطاقة</option>
                                                    <option value="تحويل">تحويل بنكي</option>
                                                    <option value="تابي">تابي (Tabby)</option>
                                                    <option value="تمارا">تمارا (Tamara)</option>
                                                    <option value="stcpay">STC Pay</option>
                                                    <option value="طرق متعددة">طرق دفع متعددة</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">المدرب المشرف</label>
                                                <select
                                                    value={selectedCoachId}
                                                    onChange={(e) => setSelectedCoachId(e.target.value)}
                                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all dark:text-white"
                                                >
                                                    <option value="">-- اختياري --</option>
                                                    {coaches.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest px-1 flex items-center gap-1.5">
                                                    <Gift className="w-3 h-3" /> العروض الترويجية
                                                </label>
                                                <select
                                                    value={selectedPromotionId}
                                                    onChange={(e) => setSelectedPromotionId(e.target.value)}
                                                    className={`w-full bg-rose-50/50 dark:bg-rose-500/5 border ${selectedPromotionId ? 'border-rose-500' : 'border-rose-200/50 dark:border-rose-900/20'} rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-rose-500/20 transition-all dark:text-white`}
                                                >
                                                    <option value="">-- بدون عرض ترويجي --</option>
                                                    {promotions
                                                        .filter(p => !p.priceId || p.priceId === selectedPriceId || !selectedPriceId)
                                                        .map(p => (
                                                            <option key={p.id} value={p.id}>
                                                                {p.name} ({p.discountPercent}% خصم)
                                                                {p.priceId && !selectedPriceId ? ' [باقة محددة]' : ''}
                                                            </option>
                                                        ))}
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">خصم يدوي %</label>
                                                <input
                                                    type="number"
                                                    disabled={!!selectedPromotionId}
                                                    value={discountPercent}
                                                    onChange={(e) => setDiscountPercent(parseFloat(e.target.value) || 0)}
                                                    className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all dark:text-white disabled:opacity-40"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ملاحظات إضافية</label>
                                            <textarea
                                                rows={3}
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="أضف ملاحظات عن الدفع أو شروط خاصة..."
                                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-700/50 rounded-[1.5rem] px-5 py-3.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all dark:text-white resize-none"
                                            />
                                        </div>

                                        {/* Multi-Payment Breakdown UI */}
                                        <AnimatePresence>
                                            {paymentMethod === 'طرق متعددة' && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-indigo-50 dark:bg-indigo-950/20 rounded-[2rem] p-6 border border-indigo-100 dark:border-indigo-900/30 space-y-4"
                                                >
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <CreditCard className="w-4 h-4 text-indigo-500" />
                                                        <h4 className="text-[11px] font-black text-indigo-700 dark:text-indigo-400 uppercase tracking-widest">تجزئة المبالغ المدفوعة</h4>
                                                    </div>
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mr-1">كاش (Cash)</label>
                                                            <input
                                                                type="number"
                                                                value={multiPayment.cash}
                                                                onChange={(e) => setMultiPayment({ ...multiPayment, cash: parseFloat(e.target.value) || 0 })}
                                                                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mr-1">شبكة (POS)</label>
                                                            <input
                                                                type="number"
                                                                value={multiPayment.network}
                                                                onChange={(e) => setMultiPayment({ ...multiPayment, network: parseFloat(e.target.value) || 0 })}
                                                                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                                                            />
                                                        </div>
                                                        <div className="space-y-1.5">
                                                            <label className="text-[9px] font-black text-indigo-400 uppercase tracking-tighter mr-1">تحويل (Transfer)</label>
                                                            <input
                                                                type="number"
                                                                value={multiPayment.transfer}
                                                                onChange={(e) => setMultiPayment({ ...multiPayment, transfer: parseFloat(e.target.value) || 0 })}
                                                                className="w-full bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800/50 rounded-xl px-4 py-2.5 text-xs font-black outline-none focus:ring-2 ring-indigo-500/20 transition-all"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-between items-center pt-2 border-t border-indigo-100 dark:border-indigo-900/50">
                                                        <div className="text-[9px] font-black text-indigo-500">مجموع التقسيم: <span className={multiPayment.cash + multiPayment.network + multiPayment.transfer !== Math.round(financials.total) ? 'text-rose-500' : 'text-emerald-500'}>{multiPayment.cash + multiPayment.network + multiPayment.transfer} ريال</span></div>
                                                        <div className="text-[9px] font-black text-indigo-500">المبلغ المطلوب: <span>{Math.round(financials.total)} ريال</span></div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Sidebar Summary */}
                                    <div className="lg:col-span-4 space-y-6">
                                        <div className="bg-indigo-600 rounded-[2rem] p-6 text-white shadow-2xl shadow-indigo-200 dark:shadow-none space-y-6">
                                            <div className="flex justify-between items-center opacity-60">
                                                <span className="text-[10px] font-black uppercase">ملخص التكاليف والمدة</span>
                                                <Shield className="w-5 h-5" />
                                            </div>

                                            <div className="space-y-4 border-b border-indigo-400/30 pb-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold opacity-70">مدة الاشتراك:</span>
                                                    <span className="text-xs font-black">{financials.duration} يوم</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold opacity-70">ينتهي في:</span>
                                                    <span className="text-xs font-black">{financials.endDate}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-bold opacity-70">السعر الأساسي:</span>
                                                    <span className="text-sm font-black">{financials.basePrice} SAR</span>
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <span className="text-[10px] font-bold opacity-70">المبلغ المطلوب سداده:</span>
                                                <div className="text-3xl font-black">{Math.round(financials.total)} <small className="text-xs font-bold opacity-50">SAR</small></div>
                                                <p className="text-[8px] font-bold opacity-50">التكلفة تشمل ضريبة القيمة المضافة 15%</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={handleSaveSubscription}
                                                disabled={isSaving || !selectedPriceId}
                                                className="col-span-2 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black text-xs shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                                                تأكيد تسجيل الاشتراك
                                            </button>
                                            <button
                                                onClick={() => setIsSubscriptionModalOpen(false)}
                                                className="col-span-2 py-3.5 bg-gray-50 dark:bg-slate-800 text-gray-400 rounded-2xl font-black text-[10px] hover:text-slate-600 transition-all border border-gray-300 dark:border-slate-700"
                                            >
                                                إلغاء العملية
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Receipt Modal */}
            <AnimatePresence>
                {isReceiptModalOpen && receiptData && (
                    <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto print:p-0 print:bg-white print:backdrop-blur-none" dir="rtl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl overflow-hidden print:shadow-none print:rounded-none flex flex-col my-auto"
                        >
                            {/* Toolbar - Hidden in Print */}
                            <div className="p-4 bg-slate-100 dark:bg-slate-800 flex justify-between items-center print:hidden border-b border-gray-300 dark:border-slate-700">
                                <div className="flex gap-2">
                                    <button onClick={() => window.print()} className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95 no-print">
                                        <Printer className="w-4 h-4 icon-glow" /> طباعة الإيصال
                                    </button>
                                    <button className="px-5 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-gray-200 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-300 transition-all no-print">
                                        <Download className="w-4 h-4 icon-glow" /> تحميل PDF
                                    </button>
                                </div>
                                <button onClick={() => setIsReceiptModalOpen(false)} className="w-8 h-8 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-sm no-print">
                                    <X className="w-4 h-4 icon-glow" />
                                </button>
                            </div>

                            {/* Helper for ZATCA QR TLV Encoding (Phase 1) */}
                            {(() => {
                                const sellerName = clubProfile?.nameAr || clubProfile?.name_ar || "Fitness Club";
                                const vatNumber = clubProfile?.taxNumber || clubProfile?.tax_number || "000000000000000";
                                const timestamp = receiptData.createdAt || new Date().toISOString();
                                const totalAmount = receiptData.totalAmount?.toString() || "0";
                                const vatAmount = receiptData.vatAmount?.toString() || "0";

                                // Simple TLV Hex generation
                                const toHex = (tag: number, value: string) => {
                                    const tagHex = tag.toString(16).padStart(2, '0');
                                    const utf8 = unescape(encodeURIComponent(value));
                                    const lenHex = utf8.length.toString(16).padStart(2, '0');
                                    let valHex = "";
                                    for (let i = 0; i < utf8.length; i++) valHex += utf8.charCodeAt(i).toString(16).padStart(2, '0');
                                    return tagHex + lenHex + valHex;
                                };

                                const tlv = toHex(1, sellerName) + toHex(2, vatNumber) + toHex(3, timestamp) + toHex(4, totalAmount) + toHex(5, vatAmount);
                                // Convert hex to base64
                                const base64Tlv = btoa(tlv.match(/\w{2}/g)?.map(a => String.fromCharCode(parseInt(a, 16))).join("") || "");
                                receiptData.zatcaQr = base64Tlv;
                                return null;
                            })()}

                            {/* Printable Receipt Content */}
                            <div id="receipt-content" className="p-4 md:p-10 bg-white dark:bg-slate-900 text-slate-800 dark:text-white print:text-black print:p-0 print:w-[80mm] print:mx-auto">
                                {[1, ...(clubSettings?.printTwoReceipts ? [2] : [])].map((copy, idx) => (
                                    <React.Fragment key={idx}>
                                        <div className={`${idx > 0 ? 'mt-10 border-t-2 border-dashed border-gray-400 pt-10' : ''}`}>
                                            {/* Header with Club Info */}
                                            <div className="flex flex-col md:flex-row justify-between items-center md:items-start mb-6 md:mb-12 border-b-2 md:border-b-4 border-indigo-600 pb-4 md:pb-8 gap-4 print:border-black print:mb-4">
                                                <div className="flex-1 text-center md:text-right print:text-center">
                                                    <h1 className="text-xl md:text-3xl font-black text-indigo-600 mb-1 uppercase tracking-tighter leading-tight print:text-black print:text-lg">
                                                        {clubProfile?.nameAr || clubProfile?.name_ar || systemSettings?.siteName || 'FITNESS CLUB KSA'}
                                                    </h1>
                                                    {(clubProfile?.nameEn || clubProfile?.name_en) && (
                                                        <h2 className="text-[10px] md:text-sm font-black text-slate-400 mb-2 md:mb-3 uppercase tracking-wider print:text-[8px]">
                                                            {clubProfile.nameEn || clubProfile.name_en}
                                                        </h2>
                                                    )}
                                                    <div className="text-[9px] md:text-[11px] font-bold text-slate-500 flex flex-col gap-0.5 md:gap-1.5 uppercase tracking-widest leading-relaxed print:text-[8px]">
                                                        <span>{clubProfile?.address || systemSettings?.address || 'المملكة العربية السعودية'}</span>
                                                        <span>الهاتف: {clubProfile?.phone || systemSettings?.contactPhone || '---'}</span>
                                                        {(clubProfile?.taxNumber || clubProfile?.tax_number) && (
                                                            <span>الرقم الضريبي: {clubProfile.taxNumber || clubProfile.tax_number}</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-20 h-20 md:w-32 md:h-32 bg-slate-50 dark:bg-slate-800/50 rounded-2xl md:rounded-3xl border border-slate-300 flex items-center justify-center overflow-hidden shadow-inner print:border-none print:w-16 print:h-16">
                                                    {(clubProfile?.logoUrl || clubProfile?.logo_url) ? (
                                                        <img src={clubProfile.logoUrl || clubProfile.logo_url} alt="Club Logo" className="w-full h-full object-contain p-2" />
                                                    ) : (
                                                        <div className="w-full h-full bg-indigo-600 flex items-center justify-center text-white font-black text-lg">FC</div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex flex-col md:flex-row justify-between items-center md:items-center mb-6 md:mb-10 bg-slate-50 dark:bg-slate-800/30 p-4 md:p-8 rounded-2xl md:rounded-[2rem] border border-gray-300 dark:border-slate-800 shadow-sm relative overflow-hidden print:p-2 print:bg-transparent print:border-dashed print:rounded-none">
                                                <div className="text-center md:text-right print:text-right w-full md:w-auto">
                                                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 mt-1">بيانات العضو المشترك</div>
                                                    <div className="text-sm md:text-2xl font-black text-indigo-600 tracking-tight leading-none mb-1 print:text-black">{members.find((m: any) => m.id === receiptData.memberId)?.name || 'عضو غير معروف'}</div>
                                                </div>
                                                <div className="text-center md:text-left print:text-left mt-2 md:mt-0 w-full md:w-auto border-t md:border-t-0 pt-2 md:pt-0">
                                                    <div className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1 mt-1">رقم الإيصال الضريبي</div>
                                                    <div className="text-sm md:text-xl font-black font-mono text-slate-800 dark:text-white leading-none print:text-black">FIX-{receiptData.id?.slice(-8).toUpperCase()}</div>
                                                </div>
                                            </div>

                                            {/* Subscription Details Table */}
                                            <div className="space-y-4 md:space-y-8">
                                                <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl md:rounded-[2rem] overflow-hidden shadow-sm print:border-collapse print:rounded-none print:border-black">
                                                    <table className="w-full text-right border-collapse">
                                                        <thead>
                                                            <tr className="bg-slate-900 text-white text-[8px] md:text-[10px] font-black uppercase tracking-widest print:bg-gray-100 print:text-black">
                                                                <th className="px-3 py-3 md:px-8 md:py-5 border-l border-white/5 last:border-l-0 print:border-black">البيان</th>
                                                                <th className="px-3 py-3 md:px-8 md:py-5 text-center border-l border-white/5 last:border-l-0 print:border-black">التاريخ</th>
                                                                <th className="px-3 py-3 md:px-8 md:py-5 text-center border-l border-white/5 last:border-l-0 print:border-black">المبلغ</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-300 dark:divide-slate-800 print:divide-black">
                                                            <tr className="text-[10px] md:text-sm font-bold">
                                                                <td className="px-3 py-4 md:px-8 md:py-7 border-l border-gray-100/20 last:border-l-0 print:border-black">
                                                                    <div className="text-xs md:text-md font-black text-indigo-600 mb-1 leading-tight print:text-black">
                                                                        {activities.find((a: any) => a.id === receiptData.activityId)?.name} - {types.find((t: any) => t.id === receiptData.typeId)?.name}
                                                                    </div>
                                                                    <div className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">
                                                                        ينتهي: <span className="text-rose-500 font-mono">{receiptData.endDate}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-4 md:px-8 md:py-7 text-center text-slate-600 font-black border-l border-gray-100/20 last:border-l-0 print:border-black">
                                                                    {new Date().toLocaleDateString('en-GB')}
                                                                </td>
                                                                <td className="px-3 py-4 md:px-8 md:py-7 text-center text-slate-900 dark:text-white font-black text-xs md:text-lg border-l border-gray-100/20 last:border-l-0 print:border-black">
                                                                    {receiptData.totalAmount} <small className="text-[8px] opacity-40">SAR</small>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </div>

                                                {/* Financial Breakdown */}
                                                <div className="flex justify-end">
                                                    <div className="w-full md:max-w-sm space-y-2 md:space-y-4 bg-slate-50/50 dark:bg-slate-800/20 p-4 md:p-8 rounded-xl md:rounded-[2rem] border border-gray-300 dark:border-slate-800 print:p-2 print:border-dashed print:rounded-none">
                                                        <div className="flex justify-between items-center text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                            <span>المبلغ الأساسي</span>
                                                            <span className="text-slate-800 dark:text-white print:text-black">{receiptData.basePrice} SAR</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[9px] md:text-xs font-bold text-rose-500 uppercase tracking-widest leading-none">
                                                            <span>الخصم ({receiptData.discountPercent || receiptData.promotionDiscount || 0}%)</span>
                                                            <span>-{receiptData.discountAmount} SAR</span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest leading-none">
                                                            <span>الضريبة ({receiptData.vatPercent || vatPercent}%)</span>
                                                            <span className="text-slate-800 dark:text-white print:text-black">{receiptData.vatAmount} SAR</span>
                                                        </div>
                                                        <div className="pt-4 md:pt-6 border-t border-indigo-100 dark:border-slate-800 flex justify-between items-center text-lg md:text-3xl font-black text-indigo-600 tracking-tighter leading-none print:text-black print:border-black">
                                                            <span>الإجمالي</span>
                                                            <span>{receiptData.totalAmount} <small className="text-[8px] md:text-xs opacity-50 font-bold">SAR</small></span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Footer Note */}
                                            <div className="mt-8 md:mt-16 text-center">
                                                <div className="p-4 md:p-8 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl md:rounded-[2.5rem] print:rounded-none print:border-black print:p-2">
                                                    <div className="text-[8px] md:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2 mt-1 print:text-black">طريقة السداد: {receiptData.paymentMethod}</div>

                                                    {/* ZATCA QR Code Area */}
                                                    <div className="flex flex-col items-center gap-2 mt-4 mb-4">
                                                        <div className="p-2 bg-white border border-gray-200 rounded-xl shadow-inner print:border-black">
                                                            <img
                                                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(receiptData.zatcaQr || "")}`}
                                                                alt="ZATCA Tax QR"
                                                                className="w-24 h-24 md:w-32 md:h-32"
                                                            />
                                                        </div>
                                                        <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] print:text-black">ZATCA COMPLIANT QR</span>
                                                    </div>

                                                    <p className="mt-4 text-[8px] md:text-[10px] font-bold text-slate-400 italic max-w-sm mx-auto leading-relaxed print:text-black">
                                                        {clubSettings?.receiptFooter || clubSettings?.receipt_footer || `نشكركم لاختياركم ${systemSettings?.siteName || 'FITNESS CLUB'}. يرجى الاحتفاظ بهذا الإيصال.`}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {idx === 0 && clubSettings?.printTwoReceipts && (
                                            <div className="text-center text-[10px] text-gray-500 py-4 font-black uppercase tracking-[0.5em] no-print">--- نسخة ثانية للفاتورة ---</div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                @media print {
                    @page {
                        size: 80mm auto;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        width: 80mm !important;
                    }
                    .no-print, .print-hidden, nav, header, aside, .fixed.inset-0:not(.z-[600]) {
                        display: none !important;
                    }
                    .fixed.z-[600] {
                        position: static !important;
                        background: white !important;
                        backdrop-filter: none !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 80mm !important;
                        height: auto !important;
                        overflow: visible !important;
                        display: block !important;
                    }

                    #receipt-content {
                        display: block !important;
                        width: 80mm !important;
                        min-width: 80mm !important;
                        margin: 0 auto !important;
                        padding: 4mm !important;
                        border: none !important;
                    }
                    .shadow-2xl, .shadow-xl, .shadow-md, .shadow-sm, .shadow-inner {
                        box-shadow: none !important;
                    }
                    .rounded-[2.5rem], .rounded-[2rem], .rounded-3xl, .rounded-2xl {
                        border-radius: 0 !important;
                    }
                }
                .no-print {
                    display: block;
                }
                @media print {
                    .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    );
}

function InfoField({ label, value, color = "" }: any) {
    return (
        <div className="bg-slate-50/50 dark:bg-slate-800/10 p-2 px-3 rounded-xl border border-gray-200/50 dark:border-slate-800 font-bold">
            <div className="text-[9px] text-gray-400 uppercase mb-0.5">{label}</div>
            <div className={`text-[11px] text-slate-900 dark:text-white truncate ${color}`}>{value}</div>
        </div>
    );
}

function DetailRow({ label, value, color = "text-slate-900 dark:text-white" }: any) {
    return (
        <div className="flex justify-between items-center px-3 py-1.5 text-[10px] md:text-[11px] font-bold">
            <span className="text-gray-400">{label}</span>
            <span className={color}>{value}</span>
        </div>
    );
}

function FinancialRow({ label, value }: any) {
    return (
        <div className="flex justify-between items-center text-[11px] font-bold">
            <span className="opacity-70">{label} :</span>
            <span className="font-black">{value}</span>
        </div>
    );
}
