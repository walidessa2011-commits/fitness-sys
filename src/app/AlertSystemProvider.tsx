"use client";

import { useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { CheckCircle2, AlertCircle, Info as InfoIcon, X } from 'lucide-react';

export default function AlertSystemProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Overriding the default browser alert to use modern toasts
            const originalAlert = window.alert;
            window.alert = (msg) => {
                if (typeof msg !== 'string') {
                    originalAlert(msg);
                    return;
                }

                // Analyze message content to determine Toast type (Success, Error, Info)
                const isError = msg.includes('خطأ') || msg.includes('تعذر') || msg.includes('ليس لديك') || msg.includes('محجوز') || msg.includes('غير موجود') || msg.includes('يجب');
                const isSuccess = msg.includes('نجاح') || msg.includes('تم');


                if (isError) {
                    toast.custom((t) => (
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-rose-200/50 dark:border-rose-900/30 px-4 py-3 rounded-[20px] shadow-2xl flex items-center justify-center gap-2.5 text-rose-600 dark:text-rose-400 font-tajawal min-w-[240px] max-w-sm ring-1 ring-black/5 transition-all">
                            <div className="w-7 h-7 rounded-full bg-rose-100/50 dark:bg-rose-900/40 flex items-center justify-center shrink-0">
                                <AlertCircle className="w-4 h-4" />
                            </div>
                            <span className="text-[12px] font-black text-center leading-tight flex-1">{msg}</span>
                        </div>
                    ), { duration: 4000 });
                } else if (isSuccess) {
                    toast.custom((t) => (
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-900/30 px-4 py-3 rounded-[20px] shadow-2xl flex items-center justify-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-tajawal min-w-[240px] max-w-sm ring-1 ring-black/5 transition-all">
                            <div className="w-7 h-7 rounded-full bg-emerald-100/50 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <span className="text-[12px] font-black text-center leading-tight flex-1">{msg}</span>
                        </div>
                    ), { duration: 3500 });
                } else {
                    toast.custom((t) => (
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-blue-200/50 dark:border-blue-900/30 px-4 py-3 rounded-[20px] shadow-2xl flex items-center justify-center gap-2.5 text-blue-600 dark:text-blue-400 font-tajawal min-w-[240px] max-w-sm ring-1 ring-black/5 transition-all">
                            <div className="w-7 h-7 rounded-full bg-blue-100/50 dark:bg-blue-900/40 flex items-center justify-center shrink-0">
                                <InfoIcon className="w-4 h-4" />
                            </div>
                            <span className="text-[12px] font-black text-center leading-tight flex-1">{msg}</span>
                        </div>
                    ), { duration: 3000 });
                }
            };
        }
    }, []);

    return (
        <>
            {children}
            <Toaster
                position="top-center"
                dir="rtl"
                toastOptions={{
                    unstyled: true,
                }}
            />
        </>
    );
}
