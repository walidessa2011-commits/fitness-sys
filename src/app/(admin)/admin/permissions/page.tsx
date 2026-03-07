"use client";

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Lock,
    Users,
    CheckCircle2,
    AlertCircle,
    Plus,
    Save,
    Settings,
    Loader2,
    Building,
    CreditCard,
    Trash2,
    ChevronLeft,
    XCircle,
    Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '@/lib/supabase';

const modules = [
    {
        id: 'clubs',
        name: 'إدارة الأندية',
        icon: <Building className="w-3.5 h-3.5" />,
        permissions: [
            { id: 'view_clubs', name: 'عرض الأندية' },
            { id: 'create_clubs', name: 'إضافة أندية جديدة' },
            { id: 'edit_clubs', name: 'تعديل بيانات الأندية' },
            { id: 'delete_clubs', name: 'حذف الأندية' }
        ]
    },
    {
        id: 'users',
        name: 'إدارة المستخدمين',
        icon: <Users className="w-3.5 h-3.5" />,
        permissions: [
            { id: 'view_users', name: 'عرض المستخدمين' },
            { id: 'create_club_admins', name: 'إنشاء مشرفي نوادي' },
            { id: 'edit_user_permissions', name: 'تعديل صلاحيات' },
            { id: 'suspend_accounts', name: 'تعطيل/تنشيط الحسابات' }
        ]
    },
    {
        id: 'finance',
        name: 'المالية والاشتراكات',
        icon: <CreditCard className="w-3.5 h-3.5" />,
        permissions: [
            { id: 'view_revenue', name: 'عرض الإيرادات' },
            { id: 'manage_subscriptions', name: 'إدارة الباقات' },
            { id: 'view_financial_reports', name: 'التقارير المالية' }
        ]
    },
    {
        id: 'system',
        name: 'إعدادات النظام',
        icon: <Settings className="w-3.5 h-3.5" />,
        permissions: [
            { id: 'manage_system_settings', name: 'إعدادات المنصة' },
            { id: 'view_audit_logs', name: 'سجلات النشاط' }
        ]
    }
];

export default function PermissionsPage() {
    const [roles, setRoles] = useState<any[]>([]);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [activePermissions, setActivePermissions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newRoleName, setNewRoleName] = useState('');
    const [newRoleDisplayName, setNewRoleDisplayName] = useState('');

    useEffect(() => {
        const sessionStr = localStorage.getItem('fitness_club_session_v2');
        const currentUser = sessionStr ? JSON.parse(sessionStr) : null;
        if (!currentUser || currentUser.role !== 'super_admin') {
            window.location.href = '/admin/dashboard';
            return;
        }
        loadRoles();
    }, []);

    async function loadRoles() {
        setLoading(true);
        const existingRoles = await db.getAll('roles');
        if (existingRoles.length === 0) {
            const defaults = [
                { id: 'r1', name: 'super_admin', displayName: 'مدير النظام التنفيذي', permissions: ['all'] },
                { id: 'r2', name: 'club_admin', displayName: 'مدير فرع / نادي', permissions: ['view_clubs', 'view_users'] }
            ];
            setRoles(defaults);
        } else {
            setRoles(existingRoles);
        }
        setLoading(false);
    }

    const handleRoleSelect = (role: any) => {
        setSelectedRole(role);
        setActivePermissions(role.permissions || []);
    };

    const togglePermission = (permId: string) => {
        if (activePermissions.includes(permId)) {
            setActivePermissions(activePermissions.filter(p => p !== permId));
        } else {
            setActivePermissions([...activePermissions, permId]);
        }
    };

    const handleSave = async () => {
        if (!selectedRole) return;
        setSaving(true);
        try {
            await db.update('roles', selectedRole.id, { permissions: activePermissions });
            setRoles(roles.map(r => r.id === selectedRole.id ? { ...r, permissions: activePermissions } : r));
            alert('تم حفظ الصلاحيات بنجاح');
        } catch (e) {
            alert('حدث خطأ أثناء الحفظ');
        } finally {
            setSaving(false);
        }
    };

    const handleAddRole = async () => {
        if (!newRoleName || !newRoleDisplayName) return;
        setLoading(true);
        try {
            const newRole = {
                name: newRoleName,
                displayName: newRoleDisplayName,
                permissions: []
            };
            const savedRole = await db.add('roles', newRole);
            setRoles([...roles, savedRole]);
            setIsAddModalOpen(false);
            setNewRoleName('');
            setNewRoleDisplayName('');
            setSelectedRole(savedRole);
            setActivePermissions([]);
        } catch (e) {
            alert('حدث خطأ أثناء الإضافة');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-2.5 animate-in fade-in duration-500 max-w-full mx-auto" dir="rtl">
            {/* compact Header */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-gray-300 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-slate-900 dark:text-white leading-tight">إدارة الصلاحيات والأدوار</h1>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">تحكم دقيق في مستويات الوصول للنظام</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-white px-4 py-2 rounded-xl font-black text-[11px] hover:bg-gray-50 dark:hover:bg-slate-700 transition-all flex items-center gap-1.5"
                    >
                        <Plus className="w-4 h-4 icon-glow" />
                        <span>إضافة مسمى جديد</span>
                    </button>
                    {selectedRole && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-premium btn-premium-blue px-6 py-2 rounded-xl font-black text-[11px] shadow-md shadow-indigo-200 dark:shadow-none transition-all flex items-center gap-1.5 disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-4 h-4 icon-glow" />}
                            <span>حفظ الصلاحيات</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Roles Sidebar - Ultra Compact */}
                <div className="lg:col-span-3 flex lg:flex-col gap-2">
                    <div className="px-2 pb-1">
                        <h3 className="text-[9px] font-black text-gray-400 dark:text-slate-600 uppercase tracking-widest">المسميات الوظيفية</h3>
                    </div>
                    {roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleSelect(role)}
                            className={`w-full p-3 rounded-xl transition-all flex items-center justify-between border ${selectedRole?.id === role.id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-indigo-300'
                                }`}
                        >
                            <div className="flex items-center gap-2.5">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${selectedRole?.id === role.id ? 'bg-white/20 text-white' : 'bg-slate-50 dark:bg-slate-800 text-indigo-600'}`}>
                                    <Lock className="w-3.5 h-3.5" />
                                </div>
                                <span className="text-[11px] font-black">{role.displayName}</span>
                            </div>
                            <ChevronLeft className={`w-3.5 h-3.5 ${selectedRole?.id === role.id ? 'opacity-100' : 'opacity-30'}`} />
                        </button>
                    ))}
                </div>

                {/* Permissions Grid - Full Width Style */}
                <div className="lg:col-span-9">
                    <AnimatePresence mode="wait">
                        {selectedRole ? (
                            <motion.div
                                key={selectedRole.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-300 dark:border-slate-800 overflow-hidden"
                            >
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-gray-300 dark:border-slate-800 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                                        <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">صلاحيات: {selectedRole.displayName}</span>
                                    </div>
                                    {selectedRole.permissions?.includes('all') && (
                                        <span className="px-2 py-0.5 bg-amber-100 text-amber-600 text-[9px] font-black rounded-lg">صلاحيات كاملة ✓</span>
                                    )}
                                </div>

                                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    {modules.map((module) => (
                                        <div key={module.id} className="space-y-3">
                                            <div className="flex items-center gap-2 border-r-2 border-indigo-500 pr-2">
                                                <div className="text-indigo-600">{module.icon}</div>
                                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider">{module.name}</h4>
                                            </div>
                                            <div className="space-y-1.5 pr-5">
                                                {module.permissions.map((perm) => (
                                                    <PermissionToggle
                                                        key={perm.id}
                                                        label={perm.name}
                                                        active={activePermissions.includes(perm.id) || activePermissions.includes('all')}
                                                        disabled={activePermissions.includes('all')}
                                                        onClick={() => togglePermission(perm.id)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-[40vh] bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-slate-400 gap-3 grayscale">
                                <Shield className="w-12 h-12 opacity-10" />
                                <p className="text-[11px] font-black uppercase tracking-widest text-slate-300">يُرجى اختيار دور وظيفي للتعديل</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Warning Box - Compact */}
            <div className="bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100/50 dark:border-amber-900/20 p-4 rounded-xl flex items-start gap-4">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
                <p className="text-[10px] font-bold text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                    تنبيه: التغييرات في الصلاحيات يتم تطبيقها فوراً على كافة حسابات المستخدمين المرتبطة بهذا الدور.
                </p>
            </div>

            {/* Add Role Modal */}
            <AnimatePresence>
                {isAddModalOpen && (
                    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAddModalOpen(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm overflow-hidden"
                        >
                            <div className="p-6 space-y-4">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2"><Plus className="w-4 h-4 text-indigo-600" /> إضافة مسمى وظيفي</h3>
                                <div className="space-y-3">
                                    <InputField label="اسم المسمى (للعرض)" value={newRoleDisplayName} onChange={setNewRoleDisplayName} placeholder="مثال: مدير فرع" />
                                    <InputField label="المعرف البرمجي" value={newRoleName} onChange={setNewRoleName} placeholder="مثال: branch_manager" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        onClick={handleAddRole}
                                        disabled={!newRoleName || !newRoleDisplayName}
                                        className="flex-1 bg-blue-600 hover:bg-blue-600 text-white py-3 rounded-xl font-black text-[11px] transition-all disabled:opacity-50"
                                    >
                                        إضافة المسمى
                                    </button>
                                    <button onClick={() => setIsAddModalOpen(false)} className="flex-1 bg-gray-100 text-gray-500 py-3 rounded-xl font-black text-[11px]">إلغاء</button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function PermissionToggle({ label, active, onClick, disabled }: any) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border transition-all ${active
                ? 'bg-indigo-50/50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800'
                : 'bg-white border-gray-300 dark:bg-slate-900 dark:border-slate-800 opacity-60 grayscale'
                }`}
        >
            <span className={`text-[10px] font-black ${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}`}>{label}</span>
            <div className={`w-4 h-4 rounded-md flex items-center justify-center ${active ? 'bg-indigo-600' : 'bg-gray-100 dark:bg-slate-800'}`}>
                {active && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
            </div>
        </button>
    );
}

function InputField({ label, value, onChange, placeholder }: any) {
    return (
        <div>
            <label className="block text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 pr-1">{label}</label>
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold dark:text-white outline-none ring-1 ring-gray-300 dark:ring-slate-700 focus:ring-2 focus:ring-indigo-500/30 transition-all shadow-inner"
            />
        </div>
    );
}
