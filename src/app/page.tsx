'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Entry, ViewType, EntryType } from './types';
import EntryCard from './components/EntryCard';
import EntryModal from './components/EntryModal';
import PreviewModal from './components/PreviewModal';
import { BookmarkIcon, NoteIcon, PlusIcon, SearchIcon, TagIcon } from './components/Icons';

export default function Home() {
    const [entries, setEntries] = useState<Entry[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    const [currentView, setCurrentView] = useState<ViewType>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [previewEntry, setPreviewEntry] = useState<Entry | null>(null);

    // Initialize from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('mindvault_entries');
        if (saved) {
            setEntries(JSON.parse(saved));
        }

        const hash = window.location.hash.replace('#/', '');
        if (hash === 'notes' || hash === 'bookmarks') {
            setCurrentView(hash as ViewType);
        }

        setIsInitialized(true);
    }, []);

    useEffect(() => {
        const handleHashChange = () => {
            const hash = window.location.hash.replace('#/', '');
            if (hash === 'notes' || hash === 'bookmarks' || hash === 'all') {
                setCurrentView(hash as ViewType);
            } else {
                setCurrentView('all');
            }
        };
        window.addEventListener('hashchange', handleHashChange);
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, []);

    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('mindvault_entries', JSON.stringify(entries));
        }
    }, [entries, isInitialized]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        entries.forEach(e => e.tags.forEach(t => tags.add(t)));
        return Array.from(tags).sort();
    }, [entries]);

    const filteredEntries = useMemo(() => {
        return entries.filter(entry => {
            const matchesSearch =
                entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                entry.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

            const matchesView =
                currentView === 'all' ||
                (currentView === 'notes' && entry.type === 'note') ||
                (currentView === 'bookmarks' && entry.type === 'bookmark');

            const matchesTag = !selectedTag || entry.tags.includes(selectedTag);

            return matchesSearch && matchesView && matchesTag;
        }).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
    }, [entries, searchQuery, currentView, selectedTag]);

    const navigateTo = (view: ViewType) => {
        window.location.hash = `#/${view}`;
        setSelectedTag(null);
    };

    const handleSaveEntry = (entryData: Partial<Entry>) => {
        let finalEntry: Entry;
        if (entryData.id) {
            setEntries(prev => prev.map(e => {
                if (e.id === entryData.id) {
                    finalEntry = { ...e, ...entryData, updatedAt: Date.now() } as Entry;
                    return finalEntry;
                }
                return e;
            }));
        } else {
            finalEntry = {
                id: Math.random().toString(36).substr(2, 9),
                type: entryData.type as EntryType,
                title: entryData.title || '',
                content: entryData.content || '',
                description: entryData.description,
                tags: entryData.tags || [],
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };
            setEntries(prev => [finalEntry, ...prev]);
        }
        setEditingEntry(null);
    };

    const handleDelete = (id: string) => {
        if (confirm('Are you sure you want to permanently remove this from your vault?')) {
            setEntries(prev => prev.filter(e => e.id !== id));
            if (previewEntry?.id === id) setPreviewEntry(null);
        }
    };

    const openEditModal = (entry: Entry) => {
        setPreviewEntry(null);
        setEditingEntry(entry);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingEntry(null);
        const defaultType: EntryType = currentView === 'bookmarks' ? 'bookmark' : 'note';
        setEditingEntry({
            type: defaultType,
            title: '',
            content: '',
            tags: [],
            id: '',
            createdAt: Date.now(),
            updatedAt: Date.now()
        } as any);
        setIsModalOpen(true);
    };

    if (!isInitialized) return null;

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
            {/* Sidebar - Mobile Navigation */}
            <nav className="md:hidden bg-white border-b border-slate-200 p-4 sticky top-0 z-50 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2" onClick={() => navigateTo('all')}>
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">N</div>
                    <span className="font-bold text-slate-800 tracking-tighter">NoteVault</span>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => navigateTo('notes')} className={currentView === 'notes' ? 'text-indigo-600' : 'text-slate-400'}><NoteIcon className="w-6 h-6" /></button>
                    <button onClick={() => navigateTo('bookmarks')} className={currentView === 'bookmarks' ? 'text-cyan-600' : 'text-slate-400'}><BookmarkIcon className="w-6 h-6" /></button>
                    <button onClick={handleAddNew} className="text-slate-800"><PlusIcon className="w-6 h-6" /></button>
                </div>
            </nav>

            {/* Main Sidebar */}
            <aside className="hidden md:flex w-72 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 z-40 shadow-sm">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-10 cursor-pointer group" onClick={() => navigateTo('all')}>
                        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        </div>
                        <h1 className="text-2xl font-black text-slate-800 tracking-tighter">NoteVault</h1>
                    </div>

                    <nav className="space-y-1.5">
                        <button
                            onClick={() => navigateTo('all')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${currentView === 'all' ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <div className={`w-2 h-2 rounded-full ${currentView === 'all' ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></div>
                            Dashboard
                        </button>
                        <button
                            onClick={() => navigateTo('notes')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${currentView === 'notes' ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <NoteIcon className="w-5 h-5" />
                            My Notes
                        </button>
                        <button
                            onClick={() => navigateTo('bookmarks')}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${currentView === 'bookmarks' ? 'bg-indigo-50 text-indigo-600 shadow-sm border border-indigo-100/50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            <BookmarkIcon className="w-5 h-5" />
                            Bookmarks
                        </button>
                    </nav>
                </div>

                <div className="flex-1 overflow-y-auto px-8 pb-8 mt-4">
                    <div className="flex items-center justify-between mb-6 px-1">
                        <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Quick Tags</h2>
                        {selectedTag && (
                            <button onClick={() => setSelectedTag(null)} className="text-[10px] font-bold text-indigo-500 hover:underline">Clear</button>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                        {allTags.map(tag => (
                            <button
                                key={tag}
                                onClick={() => setSelectedTag(tag)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${selectedTag === tag ? 'bg-slate-900 text-white shadow-xl scale-105' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}`}
                            >
                                <TagIcon className="w-3.5 h-3.5 opacity-50" />
                                {tag}
                            </button>
                        ))}
                        {allTags.length === 0 && (
                            <div className="bg-slate-50 rounded-2xl p-4 w-full border border-dashed border-slate-200">
                                <p className="text-[10px] text-slate-400 font-bold uppercase text-center leading-relaxed">No tags found in your vault</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-8 border-t border-slate-100">
                    <div className="bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-3xl p-5 text-white shadow-xl shadow-indigo-100">
                        <p className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Vault Status</p>
                        <p className="text-lg font-black">{entries.length} items</p>
                        <div className="w-full bg-white/20 h-1.5 rounded-full mt-3 overflow-hidden">
                            <div className="bg-white h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (entries.length / 50) * 100)}%` }}></div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Top Navigation Bar */}
                <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4 md:p-8 sticky top-0 z-30 flex flex-col lg:flex-row gap-6 items-center justify-between">
                    <div className="relative w-full max-w-2xl group">
                        <SearchIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors w-5 h-5" />
                        <input
                            type="text"
                            placeholder={`Search through ${currentView === 'all' ? 'everything' : currentView}...`}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border-transparent focus:bg-white focus:ring-2 focus:ring-indigo-500 rounded-[2rem] outline-none text-base font-medium transition-all shadow-inner placeholder:text-slate-300"
                        />
                    </div>

                    <button
                        onClick={handleAddNew}
                        className="w-full lg:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white font-black rounded-3xl hover:bg-slate-800 shadow-2xl shadow-slate-200 transition-all active:scale-95 group"
                    >
                        <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                        Create {currentView === 'bookmarks' ? 'Bookmark' : 'Note'}
                    </button>
                </header>

                {/* Dynamic Page Content */}
                <div className="p-4 md:p-10 flex-1 overflow-x-hidden">
                    <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-500">
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3 px-1">
                            <span className="hover:text-indigo-500 cursor-pointer" onClick={() => navigateTo('all')}>Workspace</span>
                            <span className="opacity-30">/</span>
                            <span className="text-slate-800">{currentView}</span>
                        </div>
                        <div className="flex flex-col md:flex-row md:items-center gap-4">
                            <h2 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-4">
                                {currentView === 'notes' ? 'Personal Notes' : currentView === 'bookmarks' ? 'Resource Vault' : 'Your Digital Life'}
                                {selectedTag && (
                                    <span className="text-2xl font-bold px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">#{selectedTag}</span>
                                )}
                            </h2>
                        </div>
                        <p className="text-slate-500 font-medium mt-3 px-1">
                            Click any item to view a full preview.
                        </p>
                    </div>

                    {filteredEntries.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
                            {filteredEntries.map(entry => (
                                <EntryCard
                                    key={entry.id}
                                    entry={entry}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                    onTagClick={setSelectedTag}
                                    onPreview={setPreviewEntry}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-40 text-center bg-white border-2 border-dashed border-slate-200 rounded-[3rem] animate-in zoom-in-95 duration-500">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                                {currentView === 'notes' ? <NoteIcon className="w-12 h-12" /> : <BookmarkIcon className="w-12 h-12" />}
                            </div>
                            <h3 className="text-2xl font-black text-slate-800 tracking-tight">Nothing found in the vault</h3>
                            <p className="text-slate-400 max-w-sm mt-3 font-medium leading-relaxed">
                                {searchQuery || selectedTag
                                    ? "We couldn't find any items matching your current filters. Try relaxing them a bit."
                                    : `Start building your digital second brain. Capture your first ${currentView === 'bookmarks' ? 'bookmark' : 'note'} today.`}
                            </p>
                            <div className="mt-10 flex gap-4">
                                {(searchQuery || selectedTag) ? (
                                    <button
                                        onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                                        className="px-8 py-3 bg-slate-100 text-slate-700 font-black rounded-2xl hover:bg-slate-200 transition-all active:scale-95"
                                    >
                                        Reset Filters
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAddNew}
                                        className="px-10 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-2xl shadow-indigo-100 transition-all active:scale-95"
                                    >
                                        Add {currentView === 'bookmarks' ? 'Bookmark' : 'Note'}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Global Entry Modal */}
            <EntryModal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingEntry(null); }}
                onSave={handleSaveEntry}
                editingEntry={editingEntry}
            />

            {/* Preview Modal */}
            <PreviewModal
                entry={previewEntry}
                onClose={() => setPreviewEntry(null)}
                onEdit={openEditModal}
            />
        </div>
    );
}
