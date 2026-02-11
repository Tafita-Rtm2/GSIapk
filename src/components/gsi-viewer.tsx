"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import mammoth from 'mammoth';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { toast } from 'sonner';

// Configure PDF.js worker
// Pointing to the local worker copied during build for offline support
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface GSIViewerProps {
  url: string;
  type: 'pdf' | 'video' | 'docx' | 'image';
  onLoadComplete?: () => void;
  onError?: (err: string) => void;
}

export function GSIViewer({ url, type, onLoadComplete, onError }: GSIViewerProps) {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<{ numPages: number; currentPage: number } | null>(null);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    console.log(`GSIViewer: Loading ${type} from ${url}`);
    setLoading(true);
    if (type === 'pdf') {
      renderPdf();
    } else if (type === 'docx') {
      renderDocx();
    } else if (type === 'video' || type === 'image') {
      setLoading(false);
      onLoadComplete?.();
    } else {
      setLoading(false);
      onError?.("Type de fichier non reconnu.");
    }
  }, [url, type]);

  const renderPdf = async (pageNum = 1) => {
    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();

      // Basic PDF magic number check (%PDF-)
      const header = new Uint8Array(arrayBuffer.slice(0, 5));
      const headerString = String.fromCharCode(...header);
      if (!headerString.includes('%PDF-')) {
         throw new Error("Le fichier n'est pas un document PDF valide.");
      }

      const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
      const pdf = await loadingTask.promise;
      setPdfData({ numPages: pdf.numPages, currentPage: pageNum });

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 1.5 });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d');
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext: any = {
        canvasContext: context,
        viewport: viewport
      };

      await page.render(renderContext).promise;
      setLoading(false);
      onLoadComplete?.();
    } catch (err: any) {
      console.error("PDF Render Error:", err);
      setLoading(false);
      onError?.(`Erreur de rendu PDF: ${err.message || 'Fichier invalide'}`);
    }
  };

  const renderDocx = async () => {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxHtml(result.value);
      setLoading(false);
      onLoadComplete?.();
    } catch (err: any) {
      console.error("DOCX Render Error:", err);
      setLoading(false);
      onError?.(`Erreur de rendu DOCX: ${err.message}`);
    }
  };

  const changePage = (offset: number) => {
    if (!pdfData) return;
    const newPage = pdfData.currentPage + offset;
    if (newPage >= 1 && newPage <= pdfData.numPages) {
      setLoading(true);
      renderPdf(newPage);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GSI Rendering Engine...</p>
        </div>
      )}

      <div className="flex-1 overflow-auto flex flex-col items-center p-4">
        {type === 'pdf' && (
          <div className="flex flex-col items-center">
            <canvas ref={canvasRef} className="shadow-2xl rounded-sm max-w-full h-auto bg-white" />
            {pdfData && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-gray-900/90 text-white px-6 py-3 rounded-full flex items-center gap-6 backdrop-blur-md shadow-2xl border border-white/10 z-30">
                <button onClick={() => changePage(-1)} disabled={pdfData.currentPage <= 1} className="disabled:opacity-20 active:scale-90 transition-all">
                  <ChevronLeft size={24} />
                </button>
                <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                  Page {pdfData.currentPage} / {pdfData.numPages}
                </span>
                <button onClick={() => changePage(1)} disabled={pdfData.currentPage >= pdfData.numPages} className="disabled:opacity-20 active:scale-90 transition-all">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        )}

        {type === 'docx' && docxHtml && (
          <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-2xl prose prose-sm prose-indigo animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
          </div>
        )}

        {type === 'video' && (
          <div className="w-full h-full flex items-center justify-center bg-black rounded-3xl overflow-hidden shadow-2xl">
            <video
              src={url}
              className="w-full max-h-full"
              controls
              autoPlay
              playsInline
              onError={() => onError?.("Format vidéo non supporté.")}
            />
          </div>
        )}

        {type === 'image' && (
          <img src={url} className="max-w-full h-auto rounded-2xl shadow-xl" alt="Document" />
        )}
      </div>
    </div>
  );
}
