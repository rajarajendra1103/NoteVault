'use client';

import React, { useState } from 'react';
import { Entry } from '../types';
import { BookmarkIcon, NoteIcon, TagIcon, EditIcon, ShareIcon, ExternalLinkIcon } from './Icons';

interface PreviewModalProps {
  entry: Entry | null;
  onClose: () => void;
  onEdit: (entry: Entry) => void;
}

const PreviewModal: React.FC<PreviewModalProps> = ({ entry, onClose, onEdit }) => {
  const [copied, setCopied] = useState(false);

  if (!entry) return null;

  const isBookmark = entry.type === 'bookmark';

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(entry.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: entry.title || 'Shared from NoteVault',
      text: entry.content.replace(/<[^>]*>?/gm, ''),
      url: isBookmark ? entry.content : window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Fallback share failed:', err);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md transition-all duration-300">
      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex justify-between items-center border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${isBookmark ? 'bg-cyan-50 text-cyan-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isBookmark ? <BookmarkIcon className="w-5 h-5" /> : <NoteIcon className="w-5 h-5" />}
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {isBookmark ? 'Bookmark Preview' : 'Note Preview'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-5 py-2 bg-slate-100 text-slate-600 font-black rounded-xl text-sm hover:bg-slate-200 transition-all active:scale-95"
            >
              <ShareIcon className="w-4 h-4" />
              {copied ? 'Copied' : 'Share'}
            </button>
            <button
              onClick={() => onEdit(entry)}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-black rounded-xl text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
            >
              <EditIcon className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-3 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-10 space-y-8 scroll-smooth">
          <div className="max-w-3xl mx-auto space-y-8">
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {entry.title || (isBookmark ? 'Untitled Bookmark' : 'Untitled Note')}
            </h1>

            <div className="flex flex-wrap gap-2">
              {entry.tags.map(tag => (
                <span key={tag} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-500 rounded-xl text-[11px] font-black uppercase tracking-wider">
                  <TagIcon className="w-3.5 h-3.5" />
                  {tag}
                </span>
              ))}
              {entry.tags.length === 0 && <span className="text-xs text-slate-300 italic font-medium">No tags applied</span>}
            </div>

            <div className="h-px w-full bg-slate-100"></div>

            <div className="space-y-6">
              {isBookmark ? (
                <div className="space-y-4">
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 group shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Link</p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCopyUrl}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200 shadow-sm'}`}
                        >
                          {copied ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                              Copied!
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                              Copy URL
                            </>
                          )}
                        </button>
                        <a
                          href={entry.content}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold hover:bg-cyan-700 shadow-md shadow-cyan-100 transition-all active:scale-95"
                        >
                          <ExternalLinkIcon className="w-3.5 h-3.5" />
                          Open Tab
                        </a>
                      </div>
                    </div>
                    <a
                      href={entry.content}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl font-bold text-indigo-600 hover:text-indigo-700 break-all underline decoration-indigo-200 decoration-4 underline-offset-4 leading-relaxed"
                    >
                      {entry.content}
                    </a>
                  </div>
                </div>
              ) : (
                <div className="prose prose-slate max-w-none">
                  <div
                    className="text-xl text-slate-700 leading-[1.8] font-medium styled-content"
                    dangerouslySetInnerHTML={{ __html: entry.content || 'No content provided.' }}
                  />
                </div>
              )}

              {entry.description && (
                <div className="mt-12 p-8 bg-indigo-50/30 rounded-[2.5rem] border border-indigo-100/50">
                  <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-3">Context & Description</p>
                  <p className="text-slate-600 italic text-lg leading-relaxed">
                    "{entry.description}"
                  </p>
                </div>
              )}
            </div>

            <div className="pt-10 pb-4 text-center">
              <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">
                Created on {new Date(entry.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
                {entry.updatedAt !== entry.createdAt && ` • Edited ${new Date(entry.updatedAt).toLocaleDateString()}`}
              </p>
            </div>
          </div>
        </div>
      </div>
      <style>{`
        .styled-content font[size="1"] { font-size: 0.625rem; }
        .styled-content font[size="2"] { font-size: 0.75rem; }
        .styled-content font[size="3"] { font-size: 1rem; }
        .styled-content font[size="4"] { font-size: 1.125rem; }
        .styled-content font[size="5"] { font-size: 1.5rem; }
        .styled-content font[size="6"] { font-size: 2rem; }
        .styled-content font[size="7"] { font-size: 2.5rem; font-weight: 800; line-height: 1.2; }
        .styled-content b { font-weight: 800; color: #1e293b; }
        .styled-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1rem; }
        .styled-content ol { list-style-type: decimal; padding-left: 1.5rem; margin-bottom: 1rem; }
        .styled-content blockquote { border-left: 4px solid #e2e8f0; padding-left: 1rem; font-style: italic; color: #64748b; margin: 1rem 0; }
        .styled-content a { color: #4f46e5; text-decoration: underline; }
      `}</style>
    </div>
  );
};

export default PreviewModal;