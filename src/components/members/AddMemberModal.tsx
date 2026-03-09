"use client";

import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Save,
    X,
    Camera,
    IdCard,
    Phone,
    Mail,
    Globe,
    Calendar,
    Briefcase,
    Plus,
    ChevronLeft,
    ChevronRight,
    Info,
    CheckCircle2,
    AlertCircle,
    Stethoscope,
    Target,
    Users,
    Building,
    Loader2,
    Crown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';
import { DatePicker } from '@/components/ui/date-picker';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { countries } from '@/lib/countries';


const TABS = [
    { id: 'personal', label: 'البيانات الأساسية', icon: <IdCard className="w-4 h-4" /> },
    { id: 'contact', label: 'العناوين والتواصل', icon: <Mail className="w-4 h-4" /> },
    { id: 'job', label: 'البيانات الوظيفية', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'health', label: 'الحالة الصحية', icon: <Stethoscope className="w-4 h-4" /> },
    { id: 'notes', label: 'الأهداف والملاحظات', icon: <Target className="w-4 h-4" /> },
];

export function AddMemberModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(false);
    const [salesReps, setSalesReps] = useState<any[]>([]);
    const [clubSettings, setClubSettings] = useState<any>(null);
    const [nextMemberCode, setNextMemberCode] = useState<string>('');
    const [availableGoals, setAvailableGoals] = useState<any[]>([]);

    const [formData, setFormData] = useState<any>({
        name: '',
        nationalId: '',
        phone: '',
        email: '',
        address: '',
        gender: 'ذكر',
        nationality: 'سعودي',
        birthDate: '',
        bloodType: '',
        medicalId: '',
        vip: false,
        phone2: '',
        employer: '',
        jobTitle: '',
        salesRep: '',
        marketingSource: 'انستجرام',
        weight: '',
        height: '',
        chronicDiseases: '',
        medications: '',
        healthConsent: false,
        goals: [],
        notes: '',
        status: 'نشط'
    });

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
            setActiveTab('personal');
            // Reset form
            setFormData({
                name: '', nationalId: '', phone: '', email: '', address: '',
                gender: 'ذكر', nationality: 'سعودي', birthDate: '', bloodType: '', medicalId: '',
                vip: false, phone2: '', employer: '', jobTitle: '', salesRep: '', marketingSource: 'انستجرام',
                weight: '', height: '', chronicDiseases: '', medications: '', healthConsent: false, goals: [], notes: '', status: 'نشط'
            });
        }
    }, [isOpen]);

    async function loadInitialData() {
        try {
            const clubId = await db.getClubId();
            const [staff, settingsData, membersData, goalsData] = await Promise.all([
                db.getAll('employees'),
                db.getAll('club_settings'),
                db.getAll('members'),
                db.getAll('member_goals')
            ]);
            setSalesReps(staff || []);
            setAvailableGoals(goalsData || []);

            // Load club settings for this club
            const mySettings = settingsData?.find((s: any) => s.clubId === clubId || s.club_id === clubId);
            setClubSettings(mySettings || null);

            // Calculate next membership number based on settings
            const codeStart = parseInt(mySettings?.customer_code_start || mySettings?.customerCodeStart || '1000');
            const existingMembers = (membersData || []).filter((m: any) => m.clubId === clubId || m.club_id === clubId);

            // Create a set of all used membership numbers
            const usedCodes = new Set(existingMembers.map((m: any) => parseInt(m.membershipNumber || m.membership_number || '0')));

            // Find the first available number starting from codeStart
            let currentCode = codeStart;
            while (usedCodes.has(currentCode)) {
                currentCode++;
            }

            setNextMemberCode(currentCode.toString());
        } catch (e) {
            console.error("Error loading initial data:", e);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev: any) => ({ ...prev, [name]: val }));
    };

    const handleGoalToggle = (goal: string) => {
        setFormData((prev: any) => {
            const goals = prev.goals.includes(goal)
                ? prev.goals.filter((g: string) => g !== goal)
                : [...prev.goals, goal];
            return { ...prev, goals };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Basic validation
            if (!formData.name || !formData.nationalId || !formData.phone) {
                alert('الرجاء إكمال البيانات الأساسية المطلوبة');
                setLoading(false);
                return;
            }

            // Use sequential membership number from club settings
            const membershipNumber = nextMemberCode || `${Math.floor(1000 + Math.random() * 9000)}`;
            const clubId = await db.getClubId();
            const dataToAdd = {
                ...formData,
                membershipNumber,
                clubId: clubId || '00000000-0000-0000-0000-000000000001',
                salesRep: formData.salesRep ? salesReps.find(s => s.name === formData.salesRep)?.id : null
            };

            const result = await db.add('members', dataToAdd);

            if (result) {
                onSuccess(); // The parent should show alert and reload data
                onClose();
            }
        } catch (error) {
            console.error('Error saving member:', error);
            alert('حدث خطأ أثناء حفظ البيانات');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-800 flex flex-col max-h-[85vh]"
                dir="rtl"
            >
                {/* Header */}
                <div className="flex-shrink-0 flex items-center justify-between bg-white dark:bg-slate-900 px-4 py-3 border-b border-gray-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shadow-sm">
                            <UserPlus className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-gray-900 dark:text-white leading-tight">إضافة عضو جديد</h2>
                            <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500">تعبئة بيانات العضو لفتح ملف جديد</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-full bg-gray-50 dark:bg-slate-800 flex items-center justify-center text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Tabs Menu */}
                <div className="flex-shrink-0 bg-gray-50/50 dark:bg-slate-900/50 px-3 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-blue-600 text-white shadow-sm shadow-blue-200 dark:shadow-none'
                                : 'text-gray-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <div className="flex-grow overflow-y-auto px-5 py-4 custom-scrollbar">
                    <form id="addMemberForm" onSubmit={handleSubmit} className="flex flex-col">
                        <AnimatePresence mode="popLayout">
                            {activeTab === 'personal' && (
                                <motion.div
                                    key="personal"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex flex-col md:flex-row gap-4 items-start">
                                        <div className="flex flex-col items-center gap-2 shrink-0 mx-auto md:mx-0">
                                            <div className="w-20 h-28 bg-blue-50 dark:bg-slate-800 border-2 border-dashed border-blue-200 dark:border-slate-700 rounded-xl flex flex-col items-center justify-center text-blue-400 hover:bg-blue-100 transition-all cursor-pointer group shadow-inner">
                                                <Camera className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
                                                <span className="text-[8px] font-black">صورة العضو</span>
                                            </div>
                                            {nextMemberCode && (
                                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 px-3 py-1.5 rounded-lg text-center">
                                                    <div className="text-[8px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-0.5">كود العضو</div>
                                                    <div className="text-sm font-black text-indigo-600 font-mono leading-none">{nextMemberCode}</div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
                                            <div className="md:col-span-2">
                                                <FieldLabel label="الاسم الكامل (كما في الهوية)" required />
                                                <div className="relative group">
                                                    <Users className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                                                    <input
                                                        name="name" required value={formData.name} onChange={handleInputChange}
                                                        placeholder="مثال: صالح بن محمد الزهراني"
                                                        className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <FieldLabel label="رقم الهوية / الإقامة" required />
                                                <div className="relative group">
                                                    <IdCard className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                                                    <input
                                                        name="nationalId" required value={formData.nationalId} onChange={handleInputChange} maxLength={10}
                                                        placeholder="10xxxxxxxx"
                                                        className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white font-mono"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <FieldLabel label="رقم الجوال" required />
                                                <div className="relative group">
                                                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" />
                                                    <input
                                                        name="phone" required value={formData.phone} onChange={handleInputChange} maxLength={10}
                                                        placeholder="05xxxxxxxx"
                                                        className="w-full pr-10 pl-4 py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white font-mono"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100 dark:border-slate-800">
                                        <SearchableSelect
                                            label="الجنسية"
                                            value={formData.nationality}
                                            options={countries}
                                            onChange={(val) => setFormData((prev: any) => ({ ...prev, nationality: val }))}
                                            placeholder="اختر الجنسية..."
                                            className="w-full"
                                            placement="top"
                                        />
                                        <SelectBox label="الجنس" name="gender" value={formData.gender} onChange={handleInputChange} options={['ذكر', 'أنثى']} />
                                        <DateBox label="تاريخ الميلاد" name="birthDate" value={formData.birthDate} onChange={handleInputChange} required={false} />
                                        <SelectBox label="فصيلة الدم" name="bloodType" value={formData.bloodType} onChange={handleInputChange} options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
                                        <FormInput label="رقم الهوية الطبية" name="medicalId" value={formData.medicalId} onChange={handleInputChange} placeholder="HCD-xxxx" />
                                        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30 mt-3 h-[42px]">
                                            <input
                                                type="checkbox" name="vip" checked={formData.vip} onChange={handleInputChange}
                                                className="w-4 h-4 rounded border-amber-300 text-amber-500 focus:ring-amber-500/20"
                                            />
                                            <div className="flex items-center gap-1.5">
                                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                                                <span className="text-[10px] font-black text-amber-800 dark:text-amber-400 uppercase tracking-tighter">عضوية مميزة VIP</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'contact' && (
                                <motion.div
                                    key="contact"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <FormInput className="md:col-span-2" label="البريد الإلكتروني" name="email" value={formData.email} onChange={handleInputChange} placeholder="mail@example.com" icon={<Mail />} />
                                    <FormInput label="هاتف المنزل (اختياري)" name="phone2" value={formData.phone2} onChange={handleInputChange} placeholder="011xxxxxxx" icon={<Phone />} />
                                    <FormInput label="العنوان السكني" name="address" value={formData.address} onChange={handleInputChange} placeholder="الحي، الشارع، المدينة" icon={<Building />} />
                                </motion.div>
                            )}

                            {activeTab === 'job' && (
                                <motion.div
                                    key="job"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                >
                                    <FormInput label="جهة العمل" name="employer" value={formData.employer} onChange={handleInputChange} placeholder="الشركة / الوزارة" />
                                    <FormInput label="المسمى الوظيفي" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} placeholder="مدير / مهندس / محاسب" />
                                    <SelectBox
                                        label="مندوب المبيعات المسؤول"
                                        name="salesRep"
                                        value={formData.salesRep}
                                        onChange={handleInputChange}
                                        options={salesReps.map(s => s.name)}
                                        placeholder="— اختر المندوب —"
                                    />
                                    <SelectBox
                                        label="مصدر معرفة النادي"
                                        name="marketingSource"
                                        value={formData.marketingSource}
                                        onChange={handleInputChange}
                                        options={['انستجرام', 'تيك توك', 'تويتر', 'سناب', 'صديق مقرب', 'أخرى']}
                                    />
                                </motion.div>
                            )}

                            {activeTab === 'health' && (
                                <motion.div
                                    key="health"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormInput label="الوزن الحالي (كجم)" type="number" name="weight" value={formData.weight} onChange={handleInputChange} />
                                        <FormInput label="الطول الحالي (سم)" type="number" name="height" value={formData.height} onChange={handleInputChange} />
                                        <div className="md:col-span-2">
                                            <FieldLabel label="الأمراض المزمنة (إصابات سابقة أو أي تنبيه)" />
                                            <textarea
                                                name="chronicDiseases" value={formData.chronicDiseases} onChange={handleInputChange}
                                                rows={2}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white resize-none"
                                                placeholder="مثال: ضيق في التنفس، الربو..."
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <FieldLabel label="الأدوية المستخدمة حالياً" />
                                            <textarea
                                                name="medications" value={formData.medications} onChange={handleInputChange}
                                                rows={2}
                                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white resize-none"
                                                placeholder="أسماء الأدوية بانتظام"
                                            />
                                        </div>
                                        <div className="md:col-span-2 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/20 flex items-start gap-3">
                                            <input
                                                type="checkbox" name="healthConsent" checked={formData.healthConsent} onChange={handleInputChange}
                                                className="w-4 h-4 mt-0.5 rounded border-red-300 text-red-600 focus:ring-red-500/20"
                                            />
                                            <div>
                                                <p className="text-[10px] font-black text-red-950 dark:text-red-400 leading-snug mb-0.5">إقرار الحالة الصحية والمسؤولية القانونية</p>
                                                <p className="text-[9px] font-bold text-red-700 dark:text-red-500/80 leading-snug opacity-80">
                                                    أقر بأنني بصحة جيدة ولا أعاني من أي أمراض تمنعني من ممارسة الرياضة، وأتحمل المسؤولية الكاملة.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === 'notes' && (
                                <motion.div
                                    key="notes"
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-5"
                                >
                                    <div>
                                        <FieldLabel label="أهداف العضو من الانضمام" />
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {availableGoals.length > 0 ? availableGoals.map(goalObj => (
                                                <button
                                                    key={goalObj.id}
                                                    type="button"
                                                    onClick={() => handleGoalToggle(goalObj.name)}
                                                    className={`p-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${formData.goals.includes(goalObj.name)
                                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-none translate-y-[-2px]'
                                                        : 'bg-white dark:bg-slate-800 border-gray-50 dark:border-slate-700 text-gray-500 dark:text-slate-400 hover:border-blue-200'
                                                        }`}
                                                >
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${formData.goals.includes(goalObj.name) ? 'bg-white/20' : 'bg-gray-50 dark:bg-slate-900'}`}>
                                                        <CheckCircle2 className={`w-3.5 h-3.5 ${formData.goals.includes(goalObj.name) ? 'text-white' : 'text-gray-300'}`} />
                                                    </div>
                                                    <span className="text-[10px] font-black">{goalObj.name}</span>
                                                </button>
                                            )) : (
                                                <div className="col-span-full py-4 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest border-2 border-dashed border-gray-100 dark:border-slate-800 rounded-xl">
                                                    لا توجد أهداف تدريبية مضافة حالياً
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <FieldLabel label="ملاحظات وتنبيهات إدارية" />
                                        <textarea
                                            name="notes" value={formData.notes} onChange={handleInputChange}
                                            rows={2}
                                            className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white resize-none shadow-inner"
                                            placeholder="اكتب أي ملاحظات إضافية هنا..."
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                {/* Footer Actions */}
                <div className="flex-shrink-0 px-4 py-2.5 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="hidden md:flex items-center gap-1.5 text-gray-400 dark:text-slate-600">
                        <Info className="w-3 h-3" />
                        <span className="text-[9px] font-bold uppercase tracking-wider">الحقول المميزة بـ (*) إلزامية</span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                        {TABS.findIndex(t => t.id === activeTab) > 0 && (
                            <button
                                type="button"
                                onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) - 1].id)}
                                className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400 font-black text-[10px] flex items-center gap-1.5 hover:bg-gray-100 transition-all flex-1 md:flex-auto justify-center"
                            >
                                <ChevronRight className="w-3.5 h-3.5" />
                                السابق
                            </button>
                        )}
                        {TABS.findIndex(t => t.id === activeTab) < TABS.length - 1 ? (
                            <button
                                type="button"
                                onClick={() => setActiveTab(TABS[TABS.findIndex(t => t.id === activeTab) + 1].id)}
                                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-black text-[10px] shadow-sm shadow-blue-200 dark:shadow-none flex items-center gap-1.5 transition-all flex-1 md:flex-auto justify-center"
                            >
                                <span>التالي</span>
                                <ChevronLeft className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="px-6 py-2 rounded-lg bg-[#2ecc71] hover:bg-[#27ae60] text-white font-black text-[10px] shadow-sm shadow-green-200 dark:shadow-none flex items-center gap-1.5 transition-all flex-1 md:flex-auto justify-center"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                إتمام التسجيل
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function FieldLabel({ label, required }: { label: string, required?: boolean }) {
    return (
        <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 mb-1 mr-1 uppercase tracking-tight">
            {label} {required && <span className="text-red-500 mr-1">*</span>}
        </label>
    );
}

function FormInput({ label, name, value, onChange, placeholder, type = "text", className, icon }: any) {
    return (
        <div className={className}>
            <FieldLabel label={label} />
            <div className="relative group">
                {icon && React.cloneElement(icon, { className: "absolute right-3 top-1/2 -translate-y-1/2 text-blue-400 group-focus-within:text-blue-600 transition-colors w-4 h-4" })}
                <input
                    type={type} name={name} value={value} onChange={onChange}
                    className={`w-full ${icon ? 'pr-10' : 'px-4'} py-2.5 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all dark:text-white`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}

function SelectBox({ label, name, value, onChange, options, placeholder, required }: any) {
    return (
        <div>
            <FieldLabel label={label} required={required} />
            <select
                name={name} value={value} onChange={onChange} required={required}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:border-blue-500 transition-all dark:text-white"
            >
                <option value="">{placeholder || `— اختر ${label} —`}</option>
                {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    );
}

function DateBox({ label, name, value, onChange, required }: any) {
    return (
        <div>
            <FieldLabel label={label} required={required} />
            <DatePicker
                value={value}
                onChange={(dateStr) => {
                    // simulate event to reuse handleInputChange
                    onChange({ target: { name, value: dateStr, type: 'text' } } as any);
                }}
                className="w-full text-xs font-bold bg-gray-50 dark:bg-slate-800"
            />
        </div>
    );
}
