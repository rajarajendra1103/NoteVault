'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Entry, EntryType } from '../types';
import {
  BookmarkIcon, NoteIcon, GlobeIcon,
  BoldIcon, ItalicIcon, UnderlineIcon,
  TextSizeIcon, PaletteIcon, FontIcon,
  UndoIcon, RedoIcon, ShareIcon, RefreshIcon,
  ImageIcon, CopyIcon, CutIcon, PasteIcon
} from './Icons';

interface EntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Partial<Entry>) => void;
  editingEntry?: Entry | null;
}

const FONTS = [
  { name: 'Default', value: 'Inter, sans-serif' },
  { name: 'Arial', value: 'Arial, sans-serif' },
  { name: 'Times New Roman', value: '"Times New Roman", serif' },
  { name: 'Georgia', value: 'Georgia, serif' },
  { name: 'Courier New', value: '"Courier New", monospace' },
  { name: 'Comic Sans', value: '"Comic Sans MS", cursive' },
  { name: 'Verdana', value: 'Verdana, sans-serif' },
];

const EntryModal: React.FC<EntryModalProps> = ({ isOpen, onClose, onSave, editingEntry }) => {
  const [type, setType] = useState<EntryType>('note');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [description, setDescription] = useState('');
  const [isFetchingTitle, setIsFetchingTitle] = useState(false);
  const [fontSize, setFontSize] = useState('3'); // Default scale 1-7
  const [currentFont, setCurrentFont] = useState(FONTS[0].value);

  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingEntry) {
      setType(editingEntry.type);
      setTitle(editingEntry.title);
      setContent(editingEntry.content);
      setTags(editingEntry.tags);
      setDescription(editingEntry.description || '');

      if (editingEntry.type === 'note' && editorRef.current) {
        editorRef.current.innerHTML = editingEntry.content;
      }
    } else {
      setType('note');
      setTitle('');
      setContent('');
      setTags([]);
      setDescription('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    }
  }, [editingEntry, isOpen]);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    // Basic clipboard commands might fail without user permission or in some browser contexts, 
    // but the editor normally handles OS level shortcuts natively.
    document.execCommand(command, false, value);
    handleEditorChange();
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: title || 'Shared from NoteVault',
      text: content.replace(/<[^>]*>?/gm, ''), // Plain text version
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}`);
        alert('Content copied to clipboard!');
      } catch (err) {
        console.error('Fallback share failed:', err);
      }
    }
  };

  const handleImageInsert = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        execCommand('insertImage', dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const fetchTitleFromUrl = async (url: string) => {
    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (!urlRegex.test(url.trim())) return;

    setIsFetchingTitle(true);
    try {
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url.trim())}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();

      if (data && data.contents) {
        const doc = new DOMParser().parseFromString(data.contents, 'text/html');
        const siteTitle = doc.querySelector('title')?.innerText;
        if (siteTitle) {
          setTitle(siteTitle.trim());
        }
      }
    } catch (error) {
      console.error('Failed to fetch website title:', error);
    } finally {
      setIsFetchingTitle(false);
    }
  };

  useEffect(() => {
    const urlRegex = /^(https?:\/\/[^\s]+)$/;
    if (type === 'bookmark' && title && urlRegex.test(title.trim())) {
      fetchTitleFromUrl(title.trim());
      if (!content) setContent(title.trim());
    }
  }, [title, type]);

  if (!isOpen) return null;

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim().toLowerCase();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      type,
      title: title || (type === 'bookmark' ? 'New Bookmark' : 'Untitled Note'),
      content,
      tags,
      description,
      id: editingEntry?.id
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        {/* Header Area */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setType('note')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${type === 'note' ? 'bg-white shadow-md text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Note
            </button>
            <button
              type="button"
              onClick={() => setType('bookmark')}
              className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${type === 'bookmark' ? 'bg-white shadow-md text-cyan-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              Bookmark
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 space-y-8 scroll-smooth">
          {/* Enhanced Title Section */}
          <div className="space-y-1 group relative">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={type === 'note' ? "Note Title..." : "Paste URL or site title..."}
              className="w-full bg-transparent border-none focus:ring-0 outline-none text-4xl font-black text-slate-900 placeholder:text-slate-200 p-0 tracking-tight"
            />
            {isFetchingTitle && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 text-indigo-500 animate-pulse">
                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-500 rounded-full animate-spin"></div>
                <span className="text-xs font-bold uppercase tracking-widest">Fetching...</span>
              </div>
            )}
            <div className="h-0.5 w-12 bg-indigo-600 rounded-full group-focus-within:w-24 transition-all duration-500"></div>
          </div>

          {/* Note Rich Text Tools */}
          {type === 'note' && (
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 bg-slate-50/95 backdrop-blur-md p-3 rounded-2xl border border-slate-100 shadow-sm">
              {/* History */}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => execCommand('undo')} title="Undo" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><UndoIcon /></button>
                <button type="button" onClick={() => execCommand('redo')} title="Redo" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><RedoIcon /></button>
              </div>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Clipboard Operations */}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => execCommand('cut')} title="Cut (Ctrl+X)" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><CutIcon /></button>
                <button type="button" onClick={() => execCommand('copy')} title="Copy (Ctrl+C)" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><CopyIcon /></button>
                <button type="button" onClick={() => execCommand('paste')} title="Paste (Ctrl+V) - May require browser permission" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><PasteIcon /></button>
              </div>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Formatting */}
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => execCommand('bold')} title="Bold" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><BoldIcon /></button>
                <button type="button" onClick={() => execCommand('italic')} title="Italic" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><ItalicIcon /></button>
                <button type="button" onClick={() => execCommand('underline')} title="Underline" className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"><UnderlineIcon /></button>
              </div>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Media */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Insert Image"
                className="p-2 hover:bg-white hover:shadow-sm rounded-lg text-slate-600 transition-all"
              >
                <ImageIcon />
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageInsert}
                />
              </button>
              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              {/* Size Input */}
              <div className="flex items-center gap-2 px-2 bg-white rounded-lg shadow-sm border border-slate-100">
                <TextSizeIcon className="text-slate-400 w-3.5 h-3.5" />
                <input
                  type="number"
                  min="1" max="7"
                  value={fontSize}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFontSize(val);
                    execCommand('fontSize', val);
                  }}
                  className="w-10 bg-transparent border-none focus:ring-0 text-xs font-bold text-slate-700 p-1"
                />
              </div>

              {/* Font Family Dropdown */}
              <select
                value={currentFont}
                onChange={(e) => {
                  const font = e.target.value;
                  setCurrentFont(font);
                  if (editorRef.current) {
                    editorRef.current.style.fontFamily = font;
                  }
                  execCommand('fontName', font);
                }}
                className="bg-white px-3 py-2 rounded-lg text-xs font-bold border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-100 outline-none text-slate-600"
              >
                {FONTS.map(f => <option key={f.value} value={f.value}>{f.name}</option>)}
              </select>

              <div className="w-px h-6 bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-1">
                <button type="button" onClick={() => execCommand('foreColor', '#4f46e5')} className="w-6 h-6 bg-indigo-600 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"></button>
                <button type="button" onClick={() => execCommand('foreColor', '#e11d48')} className="w-6 h-6 bg-rose-600 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"></button>
                <button type="button" onClick={() => execCommand('foreColor', '#059669')} className="w-6 h-6 bg-emerald-600 rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"></button>
                <button type="button" onClick={() => execCommand('foreColor', '#000000')} className="w-6 h-6 bg-black rounded-full border-2 border-white shadow-sm hover:scale-110 transition-transform"></button>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-100 transition-all"
                >
                  <ShareIcon className="w-3.5 h-3.5" />
                  Share
                </button>
              </div>
            </div>
          )}

          {/* Content Section */}
          <div className="space-y-4">
            <div className="relative min-h-[400px]">
              {type === 'note' ? (
                <div
                  ref={editorRef}
                  contentEditable
                  onInput={handleEditorChange}
                  className="w-full min-h-[500px] outline-none text-xl text-slate-700 leading-relaxed placeholder:text-slate-200 p-4 border border-slate-100 rounded-2xl focus:border-indigo-200 transition-all empty:before:content-[attr(data-placeholder)] empty:before:text-slate-200"
                  data-placeholder="Start writing your styled notes here..."
                  style={{ fontFamily: currentFont }}
                />
              ) : (
                <div className="space-y-4 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 group-focus-within:text-cyan-600 transition-colors">Website URL</label>
                  <div className="flex gap-4">
                    <div className="relative flex-1 group">
                      <GlobeIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-cyan-600 transition-colors w-6 h-6" />
                      <input
                        type="url"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full pl-16 pr-6 py-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] focus:ring-4 focus:ring-cyan-100 focus:border-cyan-500 focus:bg-white outline-none transition-all text-cyan-600 font-bold text-xl shadow-sm hover:border-slate-200"
                        required
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => fetchTitleFromUrl(content)}
                      disabled={!content || isFetchingTitle}
                      className="px-6 rounded-[2rem] bg-cyan-600 text-white font-black flex items-center gap-2 hover:bg-cyan-700 transition-all shadow-lg shadow-cyan-100 disabled:opacity-50 disabled:grayscale disabled:scale-100 active:scale-95"
                    >
                      <RefreshIcon className={`w-5 h-5 ${isFetchingTitle ? 'animate-spin' : ''}`} />
                      <span className="hidden sm:inline">Fetch Title</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-50">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a brief context..."
                className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all resize-none text-slate-600 text-sm leading-relaxed"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Tags</label>
              <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-[11px] font-black uppercase tracking-wider border border-indigo-100/50">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500 transition-colors">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Add tags..."
                className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-8 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-4 text-slate-500 font-black hover:bg-slate-100 rounded-2xl transition-all"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-12 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 shadow-2xl transition-all active:scale-95"
            >
              Store in Vault
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntryModal;