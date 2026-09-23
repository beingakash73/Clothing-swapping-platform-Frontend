import React, { useState } from 'react';
import { PRD_SECTIONS } from '../data/prdContent';
import { useApp } from '../context/AppContext';
import { FileText, Copy, Check, Download } from 'lucide-react';

export const PrdPage: React.FC = () => {
  const { showToast } = useApp();
  const [activeSectionId, setActiveSectionId] = useState(PRD_SECTIONS[0].id);
  const [copied, setCopied] = useState(false);

  const fullPRDMarkdown = PRD_SECTIONS.map(s => `${s.title}\n\n${s.content}`).join('\n\n---\n\n');

  const handleCopy = () => {
    navigator.clipboard?.writeText(fullPRDMarkdown);
    setCopied(true);
    showToast('Full PRD Markdown copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([fullPRDMarkdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ThreadLoop_Product_Requirements_Document.md';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Downloaded ThreadLoop PRD as Markdown file!');
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-forest-700">
            <FileText className="w-4 h-4" />
            <span>Product Architecture & Specifications</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-slate-900">
            Product Requirements Document (PRD)
          </h1>
          <p className="text-xs sm:text-sm text-stone-600">
            Comprehensive system specification, architecture, data schemas, and functional modules.
          </p>
        </div>

        {/* Copy / Export Buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleCopy}
            className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-forest-800 hover:bg-forest-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-300" />
            <span>Download PRD (.MD)</span>
          </button>
        </div>
      </div>

      {/* Two column layout: Navigation on left, Content on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Sticky Table of Contents */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-xs sticky top-24 space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block px-2 mb-2">
            Document Sections
          </span>
          {PRD_SECTIONS.map((sec) => {
            const isSelected = activeSectionId === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSectionId(sec.id)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-forest-800 text-white font-bold shadow-xs'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                {sec.title}
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-8">
          {PRD_SECTIONS.map((sec) => (
            <div
              key={sec.id}
              id={sec.id}
              className={`space-y-4 ${activeSectionId === sec.id ? 'block' : 'hidden lg:block'}`}
            >
              <h2 className="font-serif text-2xl font-bold text-slate-900 pb-2 border-b border-stone-100">
                {sec.title}
              </h2>

              <div className="prose prose-stone prose-sm max-w-none text-stone-700 leading-relaxed space-y-4">
                {sec.content.split('\n\n').map((paragraph, pIdx) => {
                  if (paragraph.startsWith('### ')) {
                    return (
                      <h3 key={pIdx} className="font-bold text-slate-900 text-base mt-4 mb-2">
                        {paragraph.replace('### ', '')}
                      </h3>
                    );
                  }
                  if (paragraph.startsWith('- ')) {
                    const bullets = paragraph.split('\n');
                    return (
                      <ul key={pIdx} className="list-disc list-inside space-y-1 text-xs sm:text-sm pl-2">
                        {bullets.map((b, bIdx) => (
                          <li key={bIdx}>{b.replace('- ', '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={pIdx} className="text-xs sm:text-sm leading-relaxed">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
