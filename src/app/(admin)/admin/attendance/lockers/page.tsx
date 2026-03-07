"use client";

import React from 'react';
import { LayoutGrid, Construction } from 'lucide-react';

export default function LockersPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4" dir="rtl">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center">
                <LayoutGrid className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white">إدارة الخزائن</h1>
            <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 px-4 py-2 rounded-xl border border-amber-100 dark:border-amber-900/20">
                <Construction className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-amber-600">قيد التطوير - سيتم إطلاقها قريباً</span>
            </div>
        </div>
    );
}
