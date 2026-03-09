import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    icon?: React.ReactNode;
    variant?: 'danger' | 'info';
    loading?: boolean;
}

export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    title = "تأكيد الحذف",
    message = "هل أنت متأكد من رغبتك في حذف هذا السجل؟ لا يمكن التراجع عن هذه العملية.",
    confirmText = "نعم، حذف",
    icon,
    variant = 'danger',
    loading = false
}: DeleteModalProps) {
    const isDanger = variant === 'danger';

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-[320px] rounded-[1.5rem] shadow-2xl relative overflow-hidden border border-gray-100 dark:border-slate-800 p-5 text-center"
                    >
                        <div className={`w-14 h-14 ${isDanger ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'} rounded-2xl flex items-center justify-center mx-auto mb-4 relative`}>
                            <div className={`absolute inset-0 rounded-2xl ${isDanger ? 'bg-rose-500/20' : 'bg-blue-500/20'} animate-ping opacity-20`}></div>
                            {icon || <Trash2 className="w-6 h-6 relative z-10" />}
                        </div>

                        <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1 font-tajawal">{title}</h3>
                        <p className="text-[11px] font-bold text-gray-500 dark:text-slate-400 mb-5 leading-snug font-tajawal px-2">
                            {message}
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={onConfirm}
                                disabled={loading}
                                className={`flex-1 py-2.5 ${isDanger ? 'bg-rose-600 hover:bg-rose-700' : 'bg-blue-600 hover:bg-blue-700'} text-white rounded-xl font-black text-[11px] shadow-md transition-all active:scale-95 disabled:opacity-50`}
                            >
                                {loading ? 'جاري...' : confirmText}
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 rounded-xl font-black text-[11px] hover:bg-gray-100 transition-all font-tajawal"
                            >
                                تراجع
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
