"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchableSelectProps {
    label?: string;
    value: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    required?: boolean;
    className?: string;
    placement?: 'top' | 'bottom';
}

export function SearchableSelect({ label, value, onChange, options, placeholder, required, className, placement = 'bottom' }: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredOptions = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    );

    useEffect(() => {
        const updatePosition = () => {
            if (isOpen && containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDropdownStyle({
                    position: 'fixed',
                    top: placement === 'bottom' ? rect.bottom + 4 : 'auto',
                    bottom: placement === 'top' ? window.innerHeight - rect.top + 4 : 'auto',
                    left: rect.left,
                    width: rect.width,
                    zIndex: 999999
                });
            }
        };

        if (isOpen) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        }

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, placement]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(event.target as Node) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef} dir="rtl">
            {label && (
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 mb-1 mr-1 uppercase tracking-tight">
                    {label} {required && <span className="text-red-500 mr-1">*</span>}
                </label>
            )}

            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none cursor-pointer flex justify-between items-center hover:border-indigo-400 transition-all dark:text-white"
            >
                <span className={!value ? 'text-gray-400 font-medium' : ''}>
                    {value || placeholder || `— اختر ${label} —`}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {mounted && typeof window !== 'undefined' ? createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            ref={dropdownRef}
                            initial={{ opacity: 0, y: placement === 'top' ? 5 : -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: placement === 'top' ? 5 : -5 }}
                            style={dropdownStyle}
                            className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden"
                            dir="rtl"
                        >
                            <div className="p-2 border-b border-gray-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 sticky top-0">
                                <div className="relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                    <input
                                        autoFocus
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="ابحث هنا..."
                                        className="w-full pr-10 pl-4 py-2 bg-white dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-bold outline-none focus:border-indigo-500 transition-all dark:text-white"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </div>
                            </div>

                            <div className="max-h-60 overflow-y-auto custom-scrollbar">
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((option) => (
                                        <div
                                            key={option}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onChange(option);
                                                setIsOpen(false);
                                                setSearch('');
                                            }}
                                            className={`px-4 py-2.5 text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${value === option
                                                ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600'
                                                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                                                }`}
                                        >
                                            <span>{option}</span>
                                            {value === option && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="px-4 py-8 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                        لا توجد نتائج مطابقة
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                , document.body) : null}
        </div>
    );
}
