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
    X,
    ShieldCheck,
    Cpu,
    Zap,
    Trophy,
    ArrowRight,
    Search,
    ChevronDown,
    Activity,
    LineChart,
    Database,
    Cloud,
    Wallet
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NewProposedLanding() {
    const [darkMode, setDarkMode] = useState(false);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeAccordion, setActiveAccordion] = useState<number | null>(null);

    useEffect(() => {
        // Handle theme
        if (localStorage.getItem('theme') === 'dark' ||
            (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setDarkMode(true);
            document.documentElement.classList.add('dark');
        }

        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
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
        <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 transition-colors duration-500 font-['Tajawal',_sans-serif]" dir="rtl">

            {/* 💎 Premium Navigation */}
            <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                ? 'bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shadow-2xl py-3 border-b border-gray-200/50 dark:border-slate-800/50'
                : 'bg-transparent py-6'
                }`}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-blue-500/10 active:scale-95 transition-all overflow-hidden border border-slate-100">
                            <img src="/logo.png" alt="Fitness Club Solutions Logo" className="w-8 h-8 object-contain" />
                        </Link>
                        <div className="leading-tight">
                            <div className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">Fitness Club Solutions</div>
                            <div className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">المستقبل في إدارة النوادي</div>
                        </div>
                    </div>

                    <nav className="hidden xl:flex items-center gap-10">
                        {[
                            { label: 'الرئيسية', href: '#home' },
                            { label: 'المميزات', href: '#features' },
                            { label: 'الرؤية', href: '#vision' },
                            { label: 'تواصل معنا', href: '#contact' }
                        ].map((item, i) => (
                            <Link key={i} href={item.href} className="text-[13px] font-black text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all relative group">
                                {item.label}
                                <span className="absolute -bottom-1 right-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full rounded-full"></span>
                            </Link>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        <button onClick={toggleDarkMode} className="w-11 h-11 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 hover:scale-110 transition-all">
                            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
                        </button>

                        <Link href="/member/login" className="hidden sm:flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs hover:shadow-2xl hover:bg-blue-700 hover:scale-105 active:scale-95 transition-all">
                            <Users className="w-4 h-4" />
                            <span>بوابة الأعضاء</span>
                        </Link>
                        <Link href="/auth/login" className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-black text-xs hover:shadow-2xl hover:scale-105 active:scale-95 transition-all">
                            <LogIn className="w-4 h-4" />
                            <span>دخول النظام</span>
                        </Link>
                    </div>
                </div>
            </header>

            {/* 🔥 Hero Spotlight */}
            <section id="home" className="relative pt-32 lg:pt-52 pb-24 overflow-hidden">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/10 dark:bg-blue-600/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 dark:bg-indigo-600/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-full mb-8">
                                <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" />
                                <span className="text-[11px] font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">الإصدار 3.5 المطور كلياً</span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-slate-950 to-slate-700 dark:from-white dark:to-slate-400">
                                القوة <span className="text-blue-600">الذكية</span> لإدارة<br />
                                ناديك الرياضي
                            </h1>

                            <p className="text-base lg:text-lg text-slate-500 dark:text-slate-400 leading-relaxed max-w-xl mb-8 font-medium">
                                الحل الشامل والوحيد في المملكة الذي يجمع بين سهولة الاستخدام، قوة التقارير المالية، والربط الذكي للبيانات لتجربة إدارة غير مسبوقة.
                            </p>

                            <div className="flex flex-wrap gap-5">
                                <Link href="/auth/login" className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[1.5rem] font-black shadow-2xl shadow-blue-500/30 flex items-center gap-3 transition-all hover:-translate-y-1">
                                    <span>ابدأ ناديك اليوم</span>
                                    <ArrowLeft className="w-5 h-5" />
                                </Link>
                                <button onClick={() => setIsVideoModalOpen(true)} className="px-10 py-5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-[1.5rem] font-black flex items-center gap-3 transition-all border border-slate-300 dark:border-slate-800">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white"><Play className="w-3.5 h-3.5 fill-current" /></div>
                                    <span>جولة سريعة</span>
                                </button>
                            </div>

                            <div className="mt-16 flex items-center gap-10 opacity-40">
                                <div className="text-center">
                                    <div className="text-2xl font-black dark:text-white">+50</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest">نادي نشط</div>
                                </div>
                                <div className="w-px h-10 bg-slate-300 dark:bg-slate-800" />
                                <div className="text-center">
                                    <div className="text-2xl font-black dark:text-white">100%</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest">دقة مالية</div>
                                </div>
                                <div className="w-px h-10 bg-slate-300 dark:bg-slate-800" />
                                <div className="text-center">
                                    <div className="text-2xl font-black dark:text-white">Live</div>
                                    <div className="text-[9px] font-bold uppercase tracking-widest">تحديثات فورية</div>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 1 }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[3rem] blur-2xl opacity-20 animate-pulse" />
                            <div className="relative bg-slate-900 border-[12px] border-slate-100 dark:border-slate-800 rounded-[3rem] shadow-2xl overflow-hidden aspect-video group cursor-pointer" onClick={() => setIsVideoModalOpen(true)}>
                                <video
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    className="w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform duration-1000"
                                >
                                    <source src="https://assets.mixkit.co/videos/preview/mixkit-gym-man-training-hard-with-dumbbells-4811-large.mp4" type="video/mp4" />
                                </video>
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-2xl shadow-blue-500 relative z-10"
                                    >
                                        <Play className="w-8 h-8 fill-current ml-1" />
                                    </motion.button>
                                </div>
                                <div className="absolute bottom-6 right-8 left-8 text-white z-10">
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 opacity-70">شاهد النظام الآن</div>
                                    <div className="text-sm font-bold truncate">مقدمة سريعة عن Fitness Club SO</div>
                                </div>
                            </div>

                            {/* Floating Analytics Card */}
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="absolute -right-8 top-1/2 -translate-y-1/2 p-5 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 z-20 hidden md:block"
                            >
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                        <LineChart className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-slate-400 font-bold uppercase">نمو الإيرادات</div>
                                        <div className="text-sm font-black text-slate-900 dark:text-white">+24.8%</div>
                                    </div>
                                </div>
                                <div className="flex gap-1 items-end h-12">
                                    {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                                        <div key={i} className="flex-1 bg-blue-600/20 rounded-sm" style={{ height: `${h}%` }}>
                                            <div className="w-full bg-blue-600 rounded-sm" style={{ height: `${h - 20}%` }} />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 🎯 Services Ecosystem */}
            <section id="features" className="py-20 bg-slate-50 dark:bg-slate-950/50">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">المنظومة المتكاملة</span>
                        <h2 className="text-3xl lg:text-4xl font-extrabold dark:text-white mb-4 leading-tight">حلول ذكية لكل زاوية في عملك</h2>
                        <p className="text-sm lg:text-base text-slate-500 dark:text-slate-400 font-medium leading-relaxed">قمنا ببناء Fitness Club SO ليكون رفيقك التقني الذي لا ينام، حيث يدير كل شيء من اللحظة الأولى لدخول العميل وحتى خروج التقارير المالية الختامية.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <ServiceBox
                            icon={<IdCard className="w-7 h-7" />}
                            title="إدارة المشتركين"
                            desc="تسجيل آمن، إدارة عضويات ذكية، تتبع الحالة، وتحكم كامل في اشتراكات كل فرد."
                            color="blue"
                        />
                        <ServiceBox
                            icon={<Wallet className="w-7 h-7" />}
                            title="الاستقرار المالي"
                            desc="تتبع الإيرادات والمصروفات، إدارة الخزينة، وإصدار تقارير PDF فورية."
                            color="emerald"
                        />
                        <ServiceBox
                            icon={<ShieldCheck className="w-7 h-7" />}
                            title="أمان لا يضاهى"
                            desc="تشفير كامل للبيانات، نظام صلاحيات دقيق، ونسخ احتياطي سحابي مستمر."
                            color="rose"
                        />
                        <ServiceBox
                            icon={<Users className="w-7 h-7" />}
                            title="إدارة الموظفين"
                            desc="تنظيم أدوار المدربين والمكاتب الأمامية مع تتبع الأداء والحضور."
                            color="amber"
                        />
                        <ServiceBox
                            icon={<Database className="w-7 h-7" />}
                            title="قاعدة بيانات موحدة"
                            desc="اربط جميع فروعك في نظام واحد وتحكم بمركزية تامة من أي مكان."
                            color="indigo"
                        />
                        <ServiceBox
                            icon={<Zap className="w-7 h-7" />}
                            title="تنبيهات ذكية"
                            desc="نظام إشعارات للاشتراكات المنتهية، العمليات الهامة، والتقارير اليومية."
                            color="blue"
                        />
                    </div>
                </div>
            </section>

            {/* 👁️ Vision & Values */}
            <section id="vision" className="py-20 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600 pointer-events-none opacity-[0.03] dark:opacity-[0.05]" />
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-4 pt-12">
                                    <div className="aspect-[4/5] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                        <img src="/vision-gym-1.png" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Excellent Gym Environment" />
                                        <div className="absolute inset-0 bg-blue-600/20 mix-blend-overlay" />
                                    </div>
                                    <div className="h-32 bg-blue-600 rounded-[2rem] flex items-center justify-center p-8 text-white shadow-2xl shadow-blue-500/20">
                                        <Trophy className="w-10 h-10" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-40 bg-slate-100 dark:bg-slate-900 rounded-[2rem] border border-slate-300 dark:border-slate-800" />
                                    <div className="aspect-[4/6] bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl relative group">
                                        <img src="/vision-gym-2.png" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="Modern Gym Interior" />
                                        <div className="absolute inset-0 bg-indigo-600/20 mix-blend-overlay" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="order-1 lg:order-2">
                            <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">رؤيتنا 2030</span>
                            <h2 className="text-3xl font-extrabold dark:text-white mb-6 leading-tight">تطوير المشهد الرياضي <br /> في المملكة بأحدث التقنيات</h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                                هدفنا ليس مجرد توفير نظام إدارة، بل بناء بيئة تقنية متكاملة تساعد أصحاب الأندية على التوسع المستدام. نحن نؤمن بأن التكنولوجيا هي عصب النجاح لأي منشأة حيوية.
                            </p>

                            <div className="space-y-8">
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black">01</div>
                                    <div>
                                        <h4 className="font-black mb-1 dark:text-white">القيادة بالابتكار</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">نحث دائماً على تقديم حلول استباقية لمشاكل الإدارة التقليدية.</p>
                                    </div>
                                </div>
                                <div className="flex gap-5">
                                    <div className="w-12 h-12 shrink-0 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black">02</div>
                                    <div>
                                        <h4 className="font-black mb-1 dark:text-white">الشفافية المطلقة</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">تقارير مالية دقيقة تمنحك الثقة في كل هللة تدخل ناديك.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ⭐ User Testimonials */}
            <section className="py-20 bg-white dark:bg-[#020617]">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-16">
                        <span className="text-[11px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 block">آراء شركاء النجاح</span>
                        <h2 className="text-3xl font-extrabold dark:text-white">ماذا يقولون عن Fitness Club SO؟</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            { name: "أحمد الفهد", club: "نادي وقت اللياقة", text: "النظام غير مفهوم الإدارة لدينا تماماً، الربط المالي والتقارير أصبحت أدق وأسرع بمراحل." },
                            { name: "سارة محمد", club: "مركز نبض الرياضي", text: "سهولة تسجيل المشتركين وتنبيهات انتهاء الاشتراكات وفرت علينا جهداً كبيراً في المتابعة." },
                            { name: "عبدالله العتيبي", club: "جيم الطاقة القصوى", text: "أفضل استثمار تقني قمت به لناديي، الدعم الفني متواجد والواجهة مريحة جداً للموظفين." }
                        ].map((t, i) => (
                            <div key={i} className="p-8 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 relative">
                                <Sparkles className="absolute top-6 left-6 w-5 h-5 text-blue-600/20" />
                                <p className="text-slate-500 dark:text-slate-400 italic mb-6 leading-relaxed">"{t.text}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-xs">{t.name[0]}</div>
                                    <div>
                                        <div className="text-sm font-black dark:text-white">{t.name}</div>
                                        <div className="text-[10px] text-blue-600 font-bold">{t.club}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ❓ FAQs Section */}
            <section className="py-20 bg-slate-50 dark:bg-slate-950/50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-black dark:text-white mb-4">الأسئلة الشائعة</h2>
                        <p className="text-slate-500 dark:text-slate-400">كل ما تحتاج لمعرفته حول نظام Fitness Club في مكان واحد.</p>
                    </div>

                    <div className="space-y-4">
                        {[
                            { q: "هل يدعم النظام الربط الذكي للبيانات؟", a: "نعم، النظام يستخدم تقنيات متطورة لضمان صحة بيانات المشتركين ومنع ازدواجية الحسابات والاشتراكات." },
                            { q: "كيف تتم عملية التحديث التقنية؟", a: "جميع التحديثات في نظام Fitness Club SO تتم سحابياً (Cloud) وبشكل تلقائي دون أي حاجة لتدخل من طرف العميل، لضمان استمرارية العمل." },
                            { q: "هل يمكنني إدارة أكثر من فرع من حساب واحد؟", a: "بالتأكيد، يدعم نظامنا تعدد الفروع مع توزيع الصلاحيات والاطلاع على إحصائيات كل فرع بشكل مستقل أو مجمع." },
                            { q: "ما هي المتطلبات التقنية لتشغيل النظام؟", a: "كل ما تحتاجه هو جهاز كمبيوتر (أو تابلت) متصل بالإنترنت، نظام Fitness Club SO يعمل من خلال المتصفح بأمان تام وسرعة فائقة." }
                        ].map((item, i) => (
                            <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                                <button
                                    onClick={() => setActiveAccordion(activeAccordion === i ? null : i)}
                                    className="w-full px-8 py-6 flex items-center justify-between text-right"
                                >
                                    <span className="font-black dark:text-white">{item.q}</span>
                                    <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform duration-300 ${activeAccordion === i ? 'rotate-180' : ''}`} />
                                </button>
                                <AnimatePresence>
                                    {activeAccordion === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                        >
                                            <div className="px-8 pb-8 text-slate-500 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800 pt-6">
                                                {item.a}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 📞 Final CTA */}
            <section id="contact" className="py-24 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-blue-600 rounded-[3rem] p-12 lg:p-24 relative overflow-hidden text-center text-white shadow-2xl shadow-blue-600/40">
                        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -mr-48 -mt-48" />
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 blur-[80px] rounded-full -ml-32 -mb-32" />

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h2 className="text-3xl lg:text-5xl font-extrabold mb-6 leading-tight">هل أنت مستعد لنقل ناديك إلى المستوى التالي؟</h2>
                            <p className="text-lg text-blue-100 mb-12 font-medium">ابدأ الآن واحصل على استشارة تقنية مجانية وتنسيق كامل لجميع بياناتك المهاجرة.</p>
                            <div className="flex flex-wrap justify-center gap-6">
                                <a href="tel:0591293770" className="px-10 py-5 bg-white text-blue-600 rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                    <PhoneCall className="w-5 h-5" />
                                    <span>اتصل بنا: 0591293770</span>
                                </a>
                                <Link href="/auth/login" className="px-10 py-5 bg-slate-950 text-white rounded-2xl font-black shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
                                    <LogIn className="w-5 h-5" />
                                    <span>جرب النسخة التجريبية</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 🤝 Partners & Clubs */}
            <section className="py-20 bg-white dark:bg-[#020617] border-t border-slate-100 dark:border-slate-900">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-12">
                        <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">نفتخر بخدمتهم</span>
                        <h3 className="text-xl font-extrabold dark:text-white opacity-80">أندية ومنشآت تثق في نظامنا</h3>
                    </div>
                    <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-50 dark:opacity-30 hover:opacity-100 transition-all">
                        {['نادي الجوارح', 'مركز اللياقة المتطور', 'أكاديمية النخبة', 'جيم الأساطير', 'تيتان للياقة'].map((club, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-100 dark:bg-slate-900 rounded-xl flex items-center justify-center">
                                    <Trophy className="w-5 h-5 text-slate-400" />
                                </div>
                                <span className="text-sm font-black tracking-tight">{club}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 📌 Footer */}
            <footer className="bg-slate-950 text-white py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid lg:grid-cols-4 gap-16 mb-20 border-b border-white/5 pb-20">
                        <div className="col-span-1 lg:col-span-1 flex flex-col items-center lg:items-start text-center lg:text-right">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center">
                                    <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
                                </div>
                                <div className="text-2xl font-black tracking-tighter">Fitness Club Solutions</div>
                            </div>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8">نظام متكامل يخدم قطاع النوادي الرياضية في المملكة العربية السعودية بأعلى معايير الجودة والأمان.</p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors"><MessageCircle className="w-5 h-5" /></a>
                                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors"><Mail className="w-5 h-5" /></a>
                                <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-blue-600 transition-colors"><MapPin className="w-5 h-5" /></a>
                            </div>
                        </div>

                        <div className="hidden lg:block col-span-1" />

                        <div>
                            <h4 className="font-black text-lg mb-8 text-center lg:text-right">روابط هامة</h4>
                            <ul className="space-y-4 text-slate-400 text-center lg:text-right">
                                <li><Link href="#" className="hover:text-blue-500 transition-colors">عن المنصة</Link></li>
                                <li><Link href="#" className="hover:text-blue-500 transition-colors">المميزات والخصائص</Link></li>
                                <li><Link href="#" className="hover:text-blue-500 transition-colors">باقات الاشتراك</Link></li>
                                <li><Link href="#" className="hover:text-blue-500 transition-colors">تواصل مع الدعم</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-black text-lg mb-8 text-center lg:text-right">المقر الرسمي</h4>
                            <div className="space-y-6 text-slate-400 flex flex-col items-center lg:items-start">
                                <div className="flex items-center gap-4 text-center lg:text-right">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><MapPin className="w-5 h-5" /></div>
                                    <p className="text-sm">الرياض، المملكة العربية السعودية</p>
                                </div>
                                <div className="flex items-center gap-4 text-center lg:text-right">
                                    <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-blue-500 shrink-0"><PhoneCall className="w-5 h-5" /></div>
                                    <p className="text-sm tracking-[0.1em]" dir="ltr">0591293770</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        <span>© 2026 Fitness Club Solutions | جميع الحقوق محفوظة</span>
                        <div className="flex gap-8">
                            <Link href="#" className="hover:text-white transition-colors">الشروط والأحكام</Link>
                            <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Video Modal */}
            <AnimatePresence>
                {isVideoModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVideoModalOpen(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" />
                        <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-5xl aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group">
                            <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 z-30 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl group/close"><X className="w-6 h-6 group-hover:rotate-90 transition-transform" /></button>
                            <div className="w-full h-full bg-black flex items-center justify-center relative">
                                <video
                                    autoPlay
                                    controls
                                    className="w-full h-full object-contain"
                                >
                                    <source src="https://assets.mixkit.co/videos/preview/mixkit-gym-man-training-hard-with-dumbbells-4811-large.mp4" type="video/mp4" />
                                    متصفحك لا يدعم تشغيل الفيديو.
                                </video>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ServiceBox({ icon, title, desc, color }: { icon: React.ReactNode, title: string, desc: string, color: 'blue' | 'emerald' | 'amber' | 'indigo' | 'rose' }) {
    const colorMap = {
        blue: 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30',
        emerald: 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30',
        amber: 'bg-amber-600/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30',
        indigo: 'bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30',
        rose: 'bg-rose-600/10 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
    };

    return (
        <motion.div
            whileHover={{ y: -10 }}
            className="p-10 bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all group"
        >
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${colorMap[color]}`}>
                {icon}
            </div>
            <h3 className="text-xl font-black mb-4 dark:text-white">{title}</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">{desc}</p>
        </motion.div>
    );
}
