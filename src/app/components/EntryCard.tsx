'use client';

import React from 'react';
import { Entry } from '../types';
import { BookmarkIcon, NoteIcon, TagIcon, TrashIcon, EyeIcon } from './Icons';

interface EntryCardProps {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onTagClick: (tag: string) => void;
  onPreview: (entry: Entry) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ entry, onEdit, onDelete, onTagClick, onPreview }) => {
  const isBookmark = entry.type === 'bookmark';

  return (
    <div
      onClick={() => onPreview(entry)}
      className="group relative bg-white border border-slate-200 rounded-[2rem] p-6 hover:shadow-2xl hover:shadow-indigo-100/50 hover:border-indigo-200 transition-all duration-500 cursor-pointer flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 overflow-hidden">
          <div className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${isBookmark ? 'bg-cyan-50 text-cyan-600' : 'bg-indigo-50 text-indigo-600'}`}>
            {isBookmark ? <BookmarkIcon /> : <NoteIcon />}
          </div>
          <div className="overflow-hidden">
            <h3 className="font-black text-slate-800 truncate text-lg tracking-tight leading-none mb-1">{entry.title}</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest opacity-60">
              {new Date(entry.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(entry); }}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Preview"
          >
            <EyeIcon className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(entry); }}
            className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
            title="Edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }}
            className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
            title="Delete"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-6 flex-1 overflow-hidden">
        {isBookmark ? (
          <div className="space-y-2">
            <span className="text-[9px] font-black text-cyan-500 uppercase tracking-widest block">URL</span>
            <p className="text-sm text-indigo-500 font-bold hover:underline truncate transition-colors">
              {entry.content}
            </p>
          </div>
        ) : (
          <p className="text-slate-600 text-sm leading-relaxed line-clamp-4 font-medium italic opacity-80">
            {entry.content}
          </p>
        )}
        {entry.description && (
          <p className="text-[11px] text-slate-400 italic mt-3 line-clamp-2 border-l-2 border-slate-100 pl-3">
            {entry.description}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-50">
        {entry.tags.map(tag => (
          <button
            key={tag}
            onClick={(e) => { e.stopPropagation(); onTagClick(tag); }}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-indigo-600 hover:text-white transition-all duration-300"
          >
            <TagIcon className="w-3 h-3 opacity-40" />
            {tag}
          </button>
        ))}
        {entry.tags.length === 0 && (
          <span className="text-[10px] text-slate-200 font-black uppercase tracking-widest">Ungrouped</span>
        )}
      </div>
    </div>
  );
};

export default EntryCard;
