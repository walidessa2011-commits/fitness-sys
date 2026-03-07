"use client";

import React, { useState, useEffect, useRef } from 'react';
import {
    Building2,
    Save,
    Loader2,
    Phone,
    Mail,
    Globe,
    MapPin,
    FileText,
    Hash,
    Image as ImageIcon,
    CheckCircle2,
    Upload,
    Camera,
    Landmark,
    Printer,
    Shield,
    Briefcase,
    Info,
    Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { db, supabase } from '@/lib/supabase';
import { auth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function ClubProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [previewLogo, setPreviewLogo] = useState<string | null>(null);
    const [profile, setProfile] = useState<any>({
        nameAr: '',
        nameEn: '',
        city: '',
        address: '',
        phone: '',
        fax: '',
        website: '',
        email: '',
        taxNumber: '',
        commercialRegistration: '',
        logoUrl: '',
        municipalityLicense: '',
        postalCode: '',
        additionalInfo: ''
    });

    useEffect(() => {
        const user = auth.getCurrentUser();
        if (!user) {
            router.push('/auth/login');
            return;
        }
        loadProfile(user.clubId);
    }, [router]);

    async function loadProfile(clubId?: string) {
        if (!clubId) {
            setLoading(false);
            return;
        }

        try {
            const data = await db.getAll('club_profiles');
            let existing = data?.find((p: any) => p.clubId === clubId || p.club_id === clubId);

            // If not found in getAll, try to fetch directly from database to be absolutely sure
            if (!existing) {
                const { data: directData } = await supabase
                    .from('club_profiles')
                    .select('*')
                    .eq('club_id', clubId)
                    .single();

                if (directData) {
                    existing = directData;
                }
            }

            if (existing) {
                // Map every possible field to camelCase to be safe
                const mapped = {
                    ...profile,
                    ...existing,
                    clubId: existing.clubId || existing.club_id || clubId,
                    nameAr: existing.nameAr || existing.name_ar || '',
                    nameEn: existing.nameEn || existing.name_en || '',
                    taxNumber: existing.taxNumber || existing.tax_number || '',
                    commercialRegistration: existing.commercialRegistration || existing.commercial_registration || '',
                    logoUrl: existing.logoUrl || existing.logo_url || '',
                    municipalityLicense: existing.municipalityLicense || existing.municipality_license || '',
                    postalCode: existing.postalCode || existing.postal_code || '',
                    additionalInfo: existing.additionalInfo || existing.additional_info || ''
                };
                setProfile(mapped);
                if (mapped.logoUrl) {
                    setPreviewLogo(mapped.logoUrl);
                }
            } else {
                // Create initial profile
                const clubData = await db.getById('clubs', clubId);
                const initial = {
                    clubId: clubId,
                    nameAr: clubData?.name || '',
                    nameEn: '',
                    city: '',
                    address: '',
                    phone: '',
                    fax: '',
                    website: '',
                    email: '',
                    taxNumber: '',
                    commercialRegistration: '',
                    logoUrl: clubData?.logo || '',
                    municipalityLicense: '',
                    postalCode: '',
                    additionalInfo: ''
                };
                // Use insert but catch duplicate errors
                try {
                    const created = await db.add('club_profiles', initial);
                    if (created) setProfile(created);
                } catch (addErr) {
                    // If it still fails, it's probably already there, let's try one last fetch
                    const { data: finalFetch } = await supabase.from('club_profiles').select('*').eq('club_id', clubId).single();
                    if (finalFetch) setProfile({ ...profile, ...finalFetch });
                }
            }
        } catch (error) {
            console.error('Error loading club profile:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleSave = async () => {
        if (!profile.clubId && !auth.getCurrentUser()?.clubId) {
            alert('خطأ: لم يتم تحديد معرف النادي');
            return;
        }

        setSaving(true);
        try {
            const clubId = profile.clubId || auth.getCurrentUser()?.clubId;
            const dataToSave = {
                ...profile,
                clubId: clubId
            };

            if (profile.id) {
                await db.update('club_profiles', profile.id, dataToSave);
            } else {
                const created = await db.add('club_profiles', dataToSave);
                if (created) setProfile(created);
            }

            // Notify layout to refresh name/logo in header
            window.dispatchEvent(new CustomEvent('club-profile-updated'));
            alert('تم حفظ البيانات بنجاح');
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('حدث خطأ أثناء حفظ البيانات. تأكد من وجود جدول club_profiles.');
        } finally {
            setSaving(false);
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => {
            setPreviewLogo(ev.target?.result as string);
        };
        reader.readAsDataURL(file);

        setUploading(true);
        try {
            const clubId = profile.clubId || auth.getCurrentUser()?.clubId;
            const fileExt = file.name.split('.').pop();
            const fileName = `club_logo_${clubId}_${Date.now()}.${fileExt}`;
            const filePath = `logos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('club-assets')
                .upload(filePath, file, { upsert: true });

            if (uploadError) {
                console.warn('Storage upload error (using local preview):', uploadError.message);
                setProfile((prev: any) => ({ ...prev, logoUrl: reader.result as string }));
            } else {
                const { data: urlData } = supabase.storage
                    .from('club-assets')
                    .getPublicUrl(filePath);
                setProfile((prev: any) => ({ ...prev, logoUrl: urlData.publicUrl }));
                setPreviewLogo(urlData.publicUrl);
            }
        } catch (err) {
            console.error('Logo upload error:', err);
        } finally {
            setUploading(false);
        }
    };

    const saudiCities = [
        'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
        'تبوك', 'بريدة', 'عنيزة', 'حائل', 'أبها', 'خميس مشيط', 'نجران', 'الباحة',
        'جازان', 'الطائف', 'ينبع', 'الجبيل', 'الأحساء', 'القطيف', 'حفر الباطن',
        'سكاكا', 'عرعر', 'الخرج', 'الدوادمي', 'المجمعة', 'الزلفي', 'شقراء',
        'وادي الدواسر', 'بيشة', 'رابغ', 'أملج', 'العلا', 'القصيم', 'الرس'
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[40vh]">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 opacity-20" />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto pb-6" dir="rtl">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50 dark:shadow-none">
                        <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">بيانات المؤسسة</h1>
                        <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">هوية النادي الرسمية · تظهر في الصادر</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-800">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">مرتبط بالإيصالات تلقائياً</span>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gradient-to-l from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-xl font-black text-[10px] shadow-lg shadow-blue-200/50 dark:shadow-none transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95"
                    >
                        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        <span>حفظ البيانات</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Logo & Identity Card */}
                <div className="lg:col-span-4 space-y-4">
                    {/* Logo Upload */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2 border-b border-gray-300 dark:border-slate-800">
                            <ImageIcon className="w-3 h-3 text-blue-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-wider">شعار المؤسسة (LOGO)</h3>
                        </div>
                        <div className="p-4 flex flex-col items-center gap-3">
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="relative w-36 h-36 rounded-2xl border-2 border-dashed border-blue-200 dark:border-slate-700 bg-blue-50/50 dark:bg-slate-800/50 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-all group overflow-hidden shadow-inner"
                            >
                                {previewLogo ? (
                                    <>
                                        <img src={previewLogo} alt="Club Logo" className="w-full h-full object-contain p-2 rounded-2xl" />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                                            <div className="text-white text-center">
                                                <Camera className="w-6 h-6 mb-1 mx-auto" />
                                                <span className="text-[10px] font-bold">تغيير الشعار</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center">
                                        {uploading ? (
                                            <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-2 mx-auto" />
                                        ) : (
                                            <Upload className="w-8 h-8 text-blue-300 mb-2 mx-auto group-hover:scale-110 transition-transform" />
                                        )}
                                        <span className="text-[10px] font-black text-blue-400 block">اضغط لرفع الشعار</span>
                                        <span className="text-[8px] font-bold text-gray-400 dark:text-slate-500 mt-1 block">PNG, JPG, SVG · حتى 2MB</span>
                                    </div>
                                )}
                            </div>
                            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                            <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 text-center leading-relaxed">
                                الشعار سيظهر في إيصالات الدفع والتذاكر والبطاقات الرقمية
                            </p>
                        </div>
                    </motion.div>

                    {/* Quick Identity Preview */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white shadow-xl overflow-hidden relative"
                    >
                        <div className="absolute top-0 left-0 w-full h-full opacity-5" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <span className="text-[10px] font-black text-blue-300 uppercase tracking-widest">معاينة الهوية</span>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                {previewLogo ? (
                                    <img src={previewLogo} alt="logo" className="w-11 h-11 rounded-lg bg-white/10 p-1 object-contain" />
                                ) : (
                                    <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-white/40" />
                                    </div>
                                )}
                                <div>
                                    <div className="text-xs font-black leading-tight">{profile.nameAr || profile.name_ar || 'اسم المؤسسة'}</div>
                                    <div className="text-[9px] font-bold text-slate-400 mt-0.5">{profile.nameEn || profile.name_en || 'Club Name EN'}</div>
                                </div>
                            </div>

                            <div className="space-y-1.5 border-t border-white/10 pt-3">
                                {(profile.phone || profile.commercialRegistration || profile.commercial_registration) && (
                                    <>
                                        {profile.phone && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                                                <Phone className="w-3 h-3 text-blue-400" />
                                                <span>{profile.phone}</span>
                                            </div>
                                        )}
                                        {(profile.commercialRegistration || profile.commercial_registration) && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                                                <FileText className="w-3 h-3 text-blue-400" />
                                                <span>سجل تجاري: {profile.commercialRegistration || profile.commercial_registration}</span>
                                            </div>
                                        )}
                                        {(profile.taxNumber || profile.tax_number) && (
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-300">
                                                <Hash className="w-3 h-3 text-blue-400" />
                                                <span>رقم ضريبي: {profile.taxNumber || profile.tax_number}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                {!profile.phone && !profile.commercialRegistration && !profile.commercial_registration && (
                                    <p className="text-[10px] font-bold text-slate-500 text-center py-3">أكمل البيانات لمعاينة الهوية</p>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* Info Box */}
                    <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 p-4 rounded-xl flex items-start gap-4">
                        <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                            بيانات المؤسسة تظهر في إيصالات الدفع والتذاكر والبطاقات الرقمية. تأكد من إدخال رقم السجل التجاري والرقم الضريبي بشكل صحيح.
                        </p>
                    </div>
                </div>

                {/* Main Form */}
                <div className="lg:col-span-8 space-y-4">
                    {/* Names Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2 border-b border-gray-300 dark:border-slate-800">
                            <Building2 className="w-3 h-3 text-blue-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-wider">بيانات المؤسسة الأساسية</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ProfileField
                                label="اسم المؤسسة (عربي)"
                                required
                                value={profile.nameAr ?? profile.name_ar ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, nameAr: v }))}
                                placeholder="مثال: مركز فتوة الرياضي"
                                icon={<Building2 />}
                            />
                            <ProfileField
                                label="اسم المؤسسة (إنجليزي)"
                                required
                                value={profile.nameEn ?? profile.name_en ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, nameEn: v }))}
                                placeholder="e.g. FATTOUA Sport Center"
                                icon={<Building2 />}
                                dir="ltr"
                            />
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">المدينة</label>
                                <div className="relative group">
                                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors w-3.5 h-3.5" />
                                    <select
                                        value={profile.city ?? ''}
                                        onChange={(e) => setProfile((prev: any) => ({ ...prev, city: e.target.value }))}
                                        className="w-full pr-9 pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner appearance-none"
                                    >
                                        <option value="">— اختر المدينة —</option>
                                        {saudiCities.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                            <ProfileField
                                label="عنوان المؤسسة"
                                required
                                value={profile.address ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, address: v }))}
                                placeholder="الحي، الشارع، تقاطع..."
                                icon={<MapPin />}
                            />
                        </div>
                    </motion.div>

                    {/* Contact Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2 border-b border-gray-300 dark:border-slate-800">
                            <Phone className="w-3 h-3 text-emerald-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-wider">بيانات التواصل</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ProfileField
                                label="رقم الهاتف"
                                required
                                value={profile.phone ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, phone: v }))}
                                placeholder="0551447768"
                                icon={<Phone />}
                            />
                            <ProfileField
                                label="رقم الفاكس"
                                value={profile.fax ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, fax: v }))}
                                placeholder="014XXXXXXX"
                                icon={<Printer />}
                            />
                            <ProfileField
                                label="الموقع الإلكتروني"
                                value={profile.website ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, website: v }))}
                                placeholder="www.example.com"
                                icon={<Globe />}
                                dir="ltr"
                            />
                            <ProfileField
                                label="البريد الإلكتروني"
                                required
                                value={profile.email ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, email: v }))}
                                placeholder="info@example.com"
                                icon={<Mail />}
                                dir="ltr"
                                type="email"
                            />
                            <ProfileField
                                label="الرمز البريدي"
                                value={profile.postalCode ?? profile.postal_code ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, postalCode: v }))}
                                placeholder="12345"
                                icon={<MapPin />}
                            />
                        </div>
                    </motion.div>

                    {/* Legal / Financial Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2 border-b border-gray-300 dark:border-slate-800">
                            <Landmark className="w-3 h-3 text-indigo-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-wider">البيانات القانونية والمالية</h3>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <ProfileField
                                label="الرقم الضريبي (VAT)"
                                required
                                value={profile.taxNumber ?? profile.tax_number ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, taxNumber: v }))}
                                placeholder="3022030760xxxx"
                                icon={<Hash />}
                            />
                            <ProfileField
                                label="رقم السجل التجاري"
                                required
                                value={profile.commercialRegistration ?? profile.commercial_registration ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, commercialRegistration: v }))}
                                placeholder="10xxxxxxxxxx"
                                icon={<FileText />}
                            />
                            <ProfileField
                                label="رخصة البلدية"
                                value={profile.municipalityLicense ?? profile.municipality_license ?? ''}
                                onChange={(v) => setProfile((prev: any) => ({ ...prev, municipalityLicense: v }))}
                                placeholder="رقم الرخصة (اختياري)"
                                icon={<Briefcase />}
                            />
                        </div>
                    </motion.div>

                    {/* Additional Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden"
                    >
                        <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-800/20 flex items-center gap-2 border-b border-gray-300 dark:border-slate-800">
                            <FileText className="w-3 h-3 text-violet-600" />
                            <h3 className="text-[11px] font-black text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-wider">معلومات إضافية</h3>
                        </div>
                        <div className="p-4">
                            <textarea
                                value={profile.additionalInfo ?? profile.additional_info ?? ''}
                                onChange={(e) => setProfile((prev: any) => ({ ...prev, additionalInfo: e.target.value }))}
                                rows={3}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 text-[10px] font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-violet-500/30 transition-all resize-none shadow-inner"
                                placeholder="أي معلومات إضافية عن المؤسسة (مثال: ساعات العمل، الفروع الأخرى...)"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Reusable Field Component
function ProfileField({ label, value, onChange, icon, placeholder, required, type = 'text', dir }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    icon?: any;
    placeholder?: string;
    required?: boolean;
    type?: string;
    dir?: string;
}) {
    return (
        <div>
            <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 pr-2">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div className="relative group">
                {icon && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-blue-600 transition-colors">
                        {React.cloneElement(icon, { className: 'w-3.5 h-3.5' })}
                    </div>
                )}
                <input
                    type={type}
                    value={value ?? ''}
                    onChange={e => onChange(e.target.value)}
                    dir={dir}
                    className={`w-full ${icon ? 'pr-9' : 'px-4'} pl-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-[10px] font-black dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-blue-500/30 transition-all shadow-inner`}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
}
