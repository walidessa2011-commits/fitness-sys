"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Tag,
    ArrowRight,
    Clock,
    Sparkles,
    ChevronRight,
    Dumbbell,
    Star,
    Percent,
    ArrowLeft,
    Moon,
    Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const dummyOffers = [
    {
        id: '1',
        title: 'عرض الصيف الذهبي',
        description: 'اشتراك 3 أشهر + شهر مجاني شامل دخول المسبح والساونا.',
        price: '999',
        originalPrice: '1500',
        clubName: 'نادي الطاقة - الرياض',
        expiryDate: '2026-06-30',
        image: 'https://images.unsplash.com/photo-1571902251103-d87389ad68aa?q=80&w=1470&auto=format&fit=crop',
        category: 'اشتراك سنوي',
        isPromoted: true
    },
    {
        id: '2',
        title: 'خصم الـ 50% للطلاب',
        description: 'وفر نصف قيمة الاشتراك عند إبراز البطاقة الجامعية. يشمل جميع الصالات.',
        price: '250',
        originalPrice: '500',
        clubName: 'بودي ستايل - جدة',
        expiryDate: '2026-08-15',
        image: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=1470&auto=format&fit=crop',
        category: 'عرض خاص',
        isPromoted: false
    },
    {
        id: '3',
        title: 'باقة الملاكمة للمبتدئين',
        description: '12 حصة تدريبية مع مدرب دولي + قفازات هدية مجانية.',
        price: '600',
        originalPrice: '850',
        clubName: 'ذا روك ستوديو - الدمام',
        expiryDate: '2026-04-10',
        image: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1374&auto=format&fit=crop',
        category: 'تمارين خاصة',
        isPromoted: false
    }
];

export default function OffersPage() {
    const [darkMode, setDarkMode] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setDarkMode(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setDarkMode(true);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-['Tajawal',_sans-serif]">
            {/* Nav */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}>
                <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg">
                            <Dumbbell className="text-white w-5 h-5" />
                        </div>
                        <span className="text-lg font-black text-slate-900 dark:text-white">FITNESS CLUB</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={toggleDarkMode}
                            className="w-10 h-10 flex items-center justify-center bg-white dark:bg-slate-800 text-slate-600 dark:text-yellow-400 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                        <Link href="/" className="text-sm font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                            <span>العودة للرئيسية</span>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-32 pb-16 px-4 bg-gradient-to-b from-blue-600/10 to-transparent">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-black mb-6"
                    >
                        <Tag className="w-3.5 h-3.5" />
                        <span>عروض حصرية لفترة محدودة</span>
                    </motion.div>
                    <h1 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6">أحدث العروض والخصومات</h1>
                    <p className="text-lg text-slate-600 dark:text-slate-400">استعرض أفضل العروض المقدمة من نخبة النوادي الرياضية في المملكة. ابدأ رحلة التغيير اليوم ووفر أكثر.</p>
                </div>
            </section>

            {/* Offers Grid */}
            <section className="pb-24 px-4">
                <div className="max-w-7xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {dummyOffers.map((offer, index) => (
                        <motion.div
                            key={offer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="group relative bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all"
                        >
                            {/* Image Header */}
                            <div className="relative h-56 overflow-hidden">
                                <img
                                    src={offer.image}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    alt={offer.title}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {offer.isPromoted && (
                                        <div className="px-3 py-1 bg-yellow-400 text-yellow-950 text-[10px] font-black rounded-full flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            <span>مميز</span>
                                        </div>
                                    )}
                                    <div className="px-3 py-1 bg-blue-600 text-white text-[10px] font-black rounded-full uppercase">
                                        {offer.category}
                                    </div>
                                </div>
                                <div className="absolute bottom-4 right-4">
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-3xl font-black text-white">{offer.price}</span>
                                        <span className="text-xs text-blue-200 font-bold">ريال سعودي</span>
                                    </div>
                                    <div className="text-slate-400 line-through text-xs font-bold">بدلاً من {offer.originalPrice}</div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-8">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    <span>{offer.clubName}</span>
                                </div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {offer.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-2">
                                    {offer.description}
                                </p>

                                <div className="h-px bg-slate-100 dark:bg-slate-800 mb-6"></div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs">
                                        <Clock className="w-4 h-4 text-orange-500" />
                                        <span>ينتهي في: {offer.expiryDate}</span>
                                    </div>
                                    <button className="p-3 bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-4 bg-blue-600 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 blur-[100px] -ml-48 -mt-48 rounded-full"></div>
                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl lg:text-4xl font-black text-white mb-6">هل أنت صاحب نادي رياضي؟</h2>
                    <p className="text-blue-100 text-lg mb-10">انضم إلينا اليوم وأضف عروض ناديك لتصل إلى آلاف المشتركين في جميع أنحاء المملكة.</p>
                    <Link href="/auth/login" className="inline-flex items-center gap-3 px-10 py-4 bg-white text-blue-600 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl">
                        <span>أضف عرضك الآن</span>
                        <Sparkles className="w-5 h-5" />
                    </Link>
                </div>
            </section>

            {/* Footer Copy */}
            <footer className="py-12 bg-slate-950 text-slate-500 text-center text-sm">
                <p>© 2026 FITNESS CLUB. جميع الحقوق محفوظة</p>
            </footer>
        </div>
    );
}
