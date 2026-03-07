"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    Dumbbell,
    Moon,
    Sun,
    LogIn,
    PhoneCall,
    ArrowLeft,
    PlayCircle,
    IdCard,
    Building2,
    BarChart3,
    Mail,
    MapPin,
    Play,
    MessageCircle,
    Users,
    Tag,
    Clock,
    Sparkles,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
    const [darkMode, setDarkMode] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        // Check local storage or system preference for dark mode
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
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
        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300 font-['Tajawal',_sans-serif]">
            {/* Header */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                } border-b border-gray-100/50 dark:border-slate-800/50`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center shadow-lg">
                                <Dumbbell className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <div className="text-xl font-black text-[#0f172a] dark:text-white tracking-tight">FITNESS CLUB</div>
                                <div className="text-xs text-gray-400 dark:text-slate-500 font-medium">منصة النوادي الرياضية</div>
                            </div>
                        </div>

                        <nav className="hidden lg:flex items-center gap-8">
                            <Link href="#hero" className="text-sm font-bold text-[#1e3a8a] dark:text-blue-400 hover:text-[#2563eb] transition-colors">الرئيسية</Link>
                            <Link href="#features" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-white transition-colors">المميزات</Link>
                            <Link href="/offers" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-white transition-colors">العروض</Link>
                            <Link href="#clients" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-white transition-colors">عملائنا</Link>
                            <Link href="#contact" className="text-sm font-medium text-gray-600 dark:text-slate-400 hover:text-[#1e3a8a] dark:hover:text-white transition-colors">تواصل معنا</Link>
                        </nav>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={toggleDarkMode}
                                className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-yellow-400 rounded-xl hover:scale-110 transition-all border border-gray-100 dark:border-slate-700"
                            >
                                {darkMode ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5" />}
                            </button>

                            <Link href="/auth/login" className="hidden sm:flex items-center gap-2 px-4 py-2 border-2 border-[#1e3a8a] dark:border-blue-500 text-[#1e3a8a] dark:text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all">
                                <LogIn className="w-4 h-4" />
                                <span>تسجيل الدخول</span>
                            </Link>

                            <a href="tel:0591293770" className="hidden md:flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#10b981] to-[#059669] text-white rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all">
                                <PhoneCall className="w-4 h-4" />
                                <span>للتواصل والمبيعات: 0591293770</span>
                            </a>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section id="hero" className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
                <div className="absolute inset-0 opacity-30 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-blue-200/50 blur-[120px]"></div>
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-indigo-200/50 blur-[100px]"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="text-center lg:text-right"
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full text-blue-700 dark:text-blue-300 text-sm font-bold mb-6">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                                </span>
                                <span>النظام الأول في المملكة لإدارة النوادي الرياضية</span>
                            </div>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#0f172a] dark:text-white mb-6 leading-tight">
                                إدارة شاملة لجميع<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-blue-200">نواديك الرياضية</span>
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                                منصة متكاملة تربط أكثر من 50 نادي رياضي وصحي في المملكة العربية السعودية، مع نظام اشتراكات منفصل لكل نادي وربط مباشر مع الهوية الوطنية لتجربة سلسة وآمنة.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                                <Link href="/auth/login" className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0f172a] dark:bg-blue-600 hover:bg-[#1e293b] dark:hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all">
                                    <span>ابدأ الآن</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <button
                                    onClick={() => setIsVideoModalOpen(true)}
                                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white dark:bg-slate-800 border-2 border-gray-200 dark:border-slate-700 hover:border-[#1e3a8a] text-gray-700 dark:text-slate-300 hover:text-[#1e3a8a] dark:hover:text-white rounded-xl font-bold text-lg transition-all group"
                                >
                                    <PlayCircle className="text-blue-600 group-hover:scale-110 transition-transform w-6 h-6" />
                                    <span>شاهد العرض التوضيحي</span>
                                </button>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-3xl blur-3xl"></div>
                            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800 transition-colors bg-slate-900 aspect-video">
                                <img
                                    src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                                    alt="Fitness Hero"
                                    className="w-full h-full object-cover opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#1e3a8a]/60 dark:from-black/60 to-transparent"></div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 bg-white dark:bg-slate-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-4">المميزات الرئيسة</span>
                        <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-16">لماذا تختار <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">FITNESS CLUB</span>؟</h2>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<IdCard className="w-7 h-7" />}
                            title="تسجيل بالهوية"
                            desc="ربط مباشر وآمن مع نظام الهوية الوطنية لضمان دقة بيانات المشتركين وسهولة الوصول."
                            color="blue"
                        />
                        <FeatureCard
                            icon={<Building2 className="w-7 h-7" />}
                            title="إدارة نوادي متعددة"
                            desc="تحكم كامل في فروعك واشتراكات كل فرع على حدة مع تقارير مالية مجمعة أو تفصيلية."
                            color="green"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="w-7 h-7" />}
                            title="تتبع الأداء والتقارير"
                            desc="تحليل ذكي للبيانات والاشتراكات لمساعدتك على اتخاذ القرارات الصحيحة لنمو ناديك."
                            color="purple"
                        />
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-24 bg-slate-50 dark:bg-slate-900 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                        >
                            <span className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-bold mb-4">تواصل معنا</span>
                            <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-6">
                                نحن هنا لمساعدتك في <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">نمو أعمالك</span>
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-slate-400 mb-10">فريق الدعم الفني والمبيعات جاهز للرد على استفساراتكم على مدار الساعة. تواصل معنا عبر القنوات المفضلة لك.</p>

                            <div className="space-y-6">
                                <ContactInfo
                                    icon={<MessageCircle className="w-6 h-6" />}
                                    title="واتساب المبيعات"
                                    value="0591293770"
                                    color="green"
                                />
                                <ContactInfo
                                    icon={<Mail className="w-6 h-6" />}
                                    title="البريد الإلكتروني"
                                    value="support@fitnessclub.sa"
                                    color="blue"
                                />
                                <ContactInfo
                                    icon={<MapPin className="w-6 h-6" />}
                                    title="المقر الرئيسي"
                                    value="الرياض، المملكة العربية السعودية"
                                    color="red"
                                />
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-slate-700"
                        >
                            <form className="space-y-5">
                                <div className="grid sm:grid-cols-2 gap-5">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold dark:text-slate-300">الاسم الكريم</label>
                                        <input type="text" placeholder="مثلاً: خالد بن فهد" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold dark:text-slate-300">رقم الجوال</label>
                                        <input type="tel" placeholder="05xxxxxxxx" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none text-right" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold dark:text-slate-300">رسالتك للمبيعات</label>
                                    <textarea rows={4} placeholder="كيف يمكننا مساعدتك اليوم؟" className="w-full p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border-none focus:ring-2 focus:ring-blue-500 dark:text-white outline-none resize-none"></textarea>
                                </div>
                                <button className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-200 dark:shadow-none transition-all">إرسال الطلب الآن</button>
                            </form>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Clients Section Placeholder */}
            <section id="clients" className="py-24 bg-white dark:bg-slate-950 transition-colors">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="p-12 bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800 rounded-[3rem] border border-gray-100 dark:border-slate-700 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/20 dark:bg-blue-900/10 blur-3xl -mr-32 -mt-32"></div>
                        <div className="relative z-10">
                            <Users className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-6 opacity-30" />
                            <h2 className="text-3xl lg:text-5xl font-black text-[#0f172a] dark:text-white mb-6">عملائنا</h2>
                            <p className="text-lg text-gray-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">نحن فخورون بخدمة نخبة من الأندية الرياضية في جميع أنحاء المملكة. سيتم عرض قائمة شركاء النجاح هنا قريباً.</p>
                            <div className="flex flex-wrap justify-center gap-8 opacity-40 grayscale group-hover:grayscale-0 transition-all">
                                {/* Placeholder for logos */}
                                <div className="h-12 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">CLUB LOGO 1</div>
                                <div className="h-12 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">CLUB LOGO 2</div>
                                <div className="h-12 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">CLUB LOGO 3</div>
                                <div className="h-12 w-32 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center font-bold text-xs">CLUB LOGO 4</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-[#0f172a] dark:bg-slate-950 text-white py-16 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-right">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6 justify-center md:justify-start">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#3b82f6] flex items-center justify-center">
                                    <Dumbbell className="text-white w-6 h-6" />
                                </div>
                                <div>
                                    <div className="text-xl font-black">FITNESS CLUB</div>
                                    <div className="text-xs text-gray-400 dark:text-slate-500">منصة النوادي الرياضية</div>
                                </div>
                            </div>
                            <p className="text-gray-400 dark:text-slate-500 leading-relaxed">هذا التطبيق خاص بـ FITNESS CLUB لإدارة النوادي والاشتراكات بشكل ذكي وآمن.</p>
                        </div>

                        <div className="hidden lg:block"></div>
                        <div className="hidden lg:block"></div>

                        <div className="flex flex-col items-center md:items-start gap-4">
                            <h4 className="font-bold text-lg">روابط سريعة</h4>
                            <Link href="#hero" className="text-gray-400 hover:text-white transition-colors">الرئيسية</Link>
                            <Link href="#features" className="text-gray-400 hover:text-white transition-colors">المميزات</Link>
                            <Link href="#contact" className="text-gray-400 hover:text-white transition-colors">تواصل معنا</Link>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-800 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400 dark:text-slate-500 text-sm">© 2026 FITNESS CLUB. جميع الحقوق محفوظة</div>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><MessageCircle className="w-5 h-5" /></a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors"><Mail className="w-5 h-5" /></a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Video Modal */}
            <AnimatePresence>
                {isVideoModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsVideoModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10"
                        >
                            <button
                                onClick={() => setIsVideoModalOpen(false)}
                                className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="w-full h-full flex items-center justify-center bg-slate-900">
                                <div className="text-center space-y-4">
                                    <PlayCircle className="w-20 h-20 text-blue-500 mx-auto animate-pulse" />
                                    <p className="text-white font-bold text-xl">عرض توضيحي للنظام</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FeatureCard({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: 'blue' | 'green' | 'purple' }) {
    const colors = {
        blue: 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 hover:border-blue-500',
        green: 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400 hover:border-green-500',
        purple: 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 hover:border-purple-500'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`p-8 bg-gray-50 dark:bg-slate-900 rounded-3xl border-2 border-gray-100 dark:border-slate-800 transition-all hover:shadow-xl group text-right ${colors[color].split(' ').pop()}`}
        >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${colors[color].split(' ').slice(0, 3).join(' ')}`}>
                {icon}
            </div>
            <h3 className="text-xl font-black mb-3 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-slate-400 leading-relaxed">{desc}</p>
        </motion.div>
    );
}

function ContactInfo({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string, color: 'blue' | 'green' | 'red' }) {
    const iconColors = {
        blue: 'text-blue-500',
        green: 'text-green-500',
        red: 'text-red-500'
    };

    return (
        <div className="flex items-center gap-5 group">
            <div className={`w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center ${iconColors[color]} group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="text-right">
                <h4 className="font-black dark:text-white">{title}</h4>
                <p className="text-sm text-gray-500 dark:text-slate-400">{value}</p>
            </div>
        </div>
    );
}
