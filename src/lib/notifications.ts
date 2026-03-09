import { db } from './supabase';

export const NotificationEngine = {
    /**
     * Run smart checks to populate the notifications table
     */
    sync: async () => {
        const session = db.getSession();
        if (!session || !session.clubId) return;

        try {
            const today = new Date().toISOString().split('T')[0];
            const existingNotifs = await db.getAll('notifications');

            // Helper to check if a specific notification event was already recorded today
            const isAlreadyNotified = (category: string, metadataKey: string, metadataValue: any) => {
                return existingNotifs.some((n: any) =>
                    n.category === category &&
                    n.createdAt.startsWith(today) &&
                    n.metadata && n.metadata[metadataKey] === metadataValue
                );
            };

            // 1. Check for Expiring Subscriptions (within 7 days)
            const subs = await db.getAll('subscriptions');
            const members = await db.getAll('members');

            const expiringSubs = subs.filter((s: any) => {
                const endDate = new Date(s.endDate);
                const now = new Date();
                const diff = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return diff >= 0 && diff <= 7 && s.status === 'نشط';
            });

            for (const sub of expiringSubs) {
                if (!isAlreadyNotified('subscriptions', 'subscriptionId', sub.id)) {
                    const member = members.find((m: any) => m.id === sub.memberId);
                    const endDateStr = new Date(sub.endDate).toLocaleDateString('ar-EG');

                    await db.notify({
                        title: 'اشتراك قارب على الانتهاء',
                        message: `اشتراك العضو ${member?.name || 'غير معروف'} ينتهي بتاريخ ${endDateStr}.`,
                        type: 'warning',
                        category: 'subscriptions',
                        link: `/admin/members/manage?id=${sub.memberId}`,
                        metadata: { subscriptionId: sub.id, memberId: sub.memberId }
                    });
                }
            }

            // 2. Check for Unpaid Invoices
            const invoices = await db.getAll('invoices');
            const unpaid = invoices.filter((i: any) => i.status === 'غير مدفوعة' || i.status === 'pending');

            if (unpaid.length > 0 && !isAlreadyNotified('finance', 'type', 'unpaid_summary')) {
                await db.notify({
                    title: 'تنبيه مالي: فواتير معلقة',
                    message: `يوجد ${unpaid.length} فواتير بانتظار التحصيل. يرجى مراجعة قسم المالية.`,
                    type: 'error',
                    category: 'finance',
                    link: '/admin/finance/invoices',
                    metadata: { type: 'unpaid_summary', count: unpaid.length }
                });
            }

            // 3. System Health / Backups (Placeholder for "Smart" logic)
            // Example: If no attendance was recorded today after 10 AM, maybe send a check
            /*
            const now = new Date();
            if (now.getHours() > 10) {
                const attendance = await db.getAll('attendance');
                const todayAttendance = attendance.filter((a: any) => a.date === today);
                if (todayAttendance.length === 0 && !isAlreadyNotified('system', 'type', 'attendance_check')) {
                    await db.notify({
                        title: 'تنبيه الحضور',
                        message: 'لم يتم تسجيل أي عمليات دخول اليوم حتى الآن. يرجى التأكد من عمل أجهزة البصمة.',
                        type: 'info',
                        category: 'attendance',
                        metadata: { type: 'attendance_check' }
                    });
                }
            }
            */

        } catch (error) {
            console.error("Notification Sync Error:", error);
        }
    }
};
