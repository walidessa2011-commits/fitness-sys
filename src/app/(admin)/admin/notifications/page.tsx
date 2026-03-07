"use client";

import React, { useState, useEffect } from 'react';
import {
    Bell,
    AlertTriangle,
    Info,
    CheckCircle2,
    XCircle,
    CalendarClock,
    UserPlus,
    Wallet,
    ShieldAlert,
    Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { auth, User as UserType } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NotificationsPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [loading, setLoading] = useState(true);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            router.push('/auth/login');
            return;
        }
        setUser(currentUser);
        loadNotifications(currentUser);
    }, [router]);

    const loadNotifications = async (currentUser: UserType) => {
        setLoading(true);
        try {
            const notifs = [];

            // 1. License Expiry Check
            if (currentUser.systemExpiryDate) {
                const expiry = new Date(currentUser.systemExpiryDate);
                const today = new Date();
                const diffTime = expiry.getTime() - today.getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                if (diffDays <= 30) {
                    notifs.push({
                        id: `sys-exp-${diffDays}`,
                        title: 'تنبيه الاشتراك الأساسي',
                        message: diffDays <= 0 ? 'انتهى اشتراك النظام! يرجى التجديد لتجنب التوقف.' : `متبقي ${diffDays} يوم على انتهاء ترخيص النظام الخاص بناديك.`,
                        date: new Date().toISOString(),
                        type: diffDays <= 5 ? 'error' : 'warning',
                        icon: <ShieldAlert />,
                        link: '/admin/system-settings'
                    });
                }
            }

            // 2. Subscriptions Expiring Soon
            const subs = await db.getAll('subscriptions');
            const members = await db.getAll('members');
            const expiringSubs = subs.filter((s: any) => {
                const endDate = new Date(s.endDate);
                const today = new Date();
                const diff = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                return diff >= 0 && diff <= 7 && s.status === 'نشط';
            });

            expiringSubs.forEach((sub: any) => {
                const member = members.find((m: any) => m.id === sub.memberId);
                const diffDays = Math.ceil((new Date(sub.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                notifs.push({
                    id: `sub-${sub.id}`,
                    title: 'اشتراك قارب على الانتهاء',
                    message: `اشتراك العضو ${member?.name || 'غير معروف'} (رقم ${sub.subscriptionNumber || '---'}) سينتهي خلال ${diffDays} يوم.`,
                    date: new Date().toISOString(),
                    type: 'warning',
                    icon: <CalendarClock />,
                    link: '/admin/members/manage?id=' + sub.memberId
                });
            });

            // 3. Unpaid Invoices (Today)
            const invoices = await db.getAll('invoices');
            const unpaidInvoices = invoices.filter((inv: any) => inv.status === 'غير مدفوعة');

            if (unpaidInvoices.length > 0) {
                notifs.push({
                    id: `inv-unpaid-today`,
                    title: 'فواتير غير مدفوعة',
                    message: `يوجد لديك ${unpaidInvoices.length} فواتير معلقة بانتظار السداد اليوم.`,
                    date: new Date().toISOString(),
                    type: 'error',
                    icon: <Wallet />,
                    link: '/admin/finance/invoices'
                });
            }

            setNotifications(notifs);

        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    const getIcon = (type: string, customIcon: any) => {
        if (customIcon) return React.cloneElement(customIcon, { className: 'w-5 h-5' });
        switch (type) {
            case 'error': return <XCircle className="w-5 h-5" />;
            case 'success': return <CheckCircle2 className="w-5 h-5 icon-glow" />;
            case 'warning': return <AlertTriangle className="w-5 h-5" />;
            default: return <Info className="w-5 h-5" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'error': return 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/10 dark:border-rose-900/30';
            case 'success': return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/10 dark:border-emerald-900/30';
            case 'warning': return 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/10 dark:border-amber-900/30';
            default: return 'bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30';
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-4xl mx-auto pb-10" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Bell className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">مركز الإشعارات</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحديثات النظام وتنبيهات الأعضاء والإدارة</p>
                    </div>
                </div>
            </div>

            {/* Notifications List */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden min-h-[50vh]">
                {loading ? (
                    <div className="flex items-center justify-center h-40">
                        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin opacity-50" />
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                        <Bell className="w-16 h-16 opacity-20 mb-4" />
                        <p className="font-black text-sm">لا توجد إشعارات جديدة</p>
                        <p className="text-[10px] font-bold mt-1">كل شيء يعمل بشكل ممتاز!</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-400 dark:divide-slate-800/50">
                        {notifications.map((notif, index) => (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                key={notif.id}
                                className={`p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${notif.type === 'error' ? 'bg-rose-50/30 dark:bg-rose-900/5' : ''}`}
                            >
                                <div className="flex items-start gap-4 flex-1">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${getColor(notif.type)}`}>
                                        {getIcon(notif.type, notif.icon)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white">{notif.title}</h3>
                                            <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 flex items-center gap-1"><Clock className="w-3 h-3" /> اليوم</span>
                                        </div>
                                        <p className="text-[11px] font-bold text-gray-600 dark:text-slate-400 leading-relaxed max-w-2xl">{notif.message}</p>
                                    </div>
                                </div>

                                {notif.link && (
                                    <Link href={notif.link} className="shrink-0 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 text-[10px] font-black px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        عرض التفاصيل
                                    </Link>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
