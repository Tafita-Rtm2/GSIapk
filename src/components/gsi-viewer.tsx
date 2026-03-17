"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut, X } from 'lucide-react';
import { toast } from 'sonner';
import { GSIStore } from '@/lib/store';

interface GSIViewerProps {
  id: string;
  url: string;
  type: 'pdf' | 'video' | 'docx' | 'image' | 'text';
  onLoadComplete?: () => void;
  onError?: (err: string) => void;
}

export function GSIViewer({ id, url, type, onLoadComplete, onError }: GSIViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<{ numPages: number; currentPage: number } | null>(null);
  const [scale, setScale] = useState(1.5);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const pdfDocRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Helper for cleanup
  const cleanup = async () => {
    if (renderTaskRef.current) {
      try { await renderTaskRef.current.cancel(); } catch (e) {}
      renderTaskRef.current = null;
    }
    if (pdfDocRef.current) {
      try { await pdfDocRef.current.destroy(); } catch (e) {}
      pdfDocRef.current = null;
    }
  };

  useEffect(() => {
    return () => { cleanup(); };
  }, []);

  useEffect(() => {
    if (!url) {
       setLoading(false);
       handleInternalError("Aucun contenu à afficher.");
       return;
    }

    const loadContent = async () => {
        setLoading(true);
        setError(null);
        await cleanup();

        try {
            if (type === 'pdf') {
                await renderPdf();
            } else if (type === 'docx') {
                await renderDocx();
            } else if (type === 'video' || type === 'image' || type === 'text') {
                setLoading(false);
                onLoadComplete?.();
            } else {
                handleInternalError("Type de fichier non reconnu.");
            }
        } catch (err: any) {
            handleInternalError(`Erreur de chargement: ${err.message || 'Inconnue'}`);
        }
    };

    loadContent();
  }, [url, type]);

  const handleInternalError = (msg: string) => {
    console.error("GSIViewer Error:", msg);
    setError(msg);
    setLoading(false);
    onError?.(msg);
  };

  const renderPdf = async (pageNum = 1, currentScale = scale) => {
    if (typeof window === 'undefined') return;

    try {
      // Dynamic import to avoid issues during build/init
      const pdfjsLib = await import('pdfjs-dist/build/pdf.mjs');
      pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

      if (!pdfDocRef.current) {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const arrayBuffer = await response.arrayBuffer();

        if (arrayBuffer.byteLength < 10) throw new Error("Fichier vide");

        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) });
        pdfDocRef.current = await loadingTask.promise;
      }

      const pdf = pdfDocRef.current;
      setPdfData({ numPages: pdf.numPages, currentPage: pageNum });

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale });

      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext('2d', { alpha: false });
      if (!context) return;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext: any = {
        canvasContext: context,
        viewport: viewport
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      renderTaskRef.current = null;

      setLoading(false);
      onLoadComplete?.();
    } catch (err: any) {
      if (err.name === 'RenderingCancelledException') return;
      throw err;
    }
  };

  const renderDocx = async () => {
    try {
      const mammoth = await import('mammoth');
      const response = await fetch(url);
      if (!response.ok) throw new Error(`Status ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();

      const result = await mammoth.convertToHtml({ arrayBuffer });
      setDocxHtml(result.value || "<p>Document vide.</p>");
      setLoading(false);
      onLoadComplete?.();
    } catch (err: any) {
      throw err;
    }
  };

  const changePage = (offset: number) => {
    if (!pdfData) return;
    const newPage = pdfData.currentPage + offset;
    if (newPage >= 1 && newPage <= pdfData.numPages) {
      renderPdf(newPage);
    }
  };

  const handleZoom = (delta: number) => {
     const newScale = Math.min(Math.max(scale + delta, 0.5), 4);
     setScale(newScale);
     if (type === 'pdf') renderPdf(pdfData?.currentPage || 1, newScale);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden relative min-h-[300px]">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-20">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Chargement...</p>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20 p-6 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-sm font-black text-gray-900 uppercase mb-2">Oups ! Une petite erreur</h3>
          <p className="text-xs text-gray-500 mb-6 max-w-xs">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest"
          >
            Actualiser
          </button>
        </div>
      )}

      <div className="flex-1 overflow-auto flex flex-col items-center p-4">
        {type === 'pdf' && !error && (
          <div className="flex flex-col items-center">
            <canvas ref={canvasRef} className="shadow-2xl rounded-sm bg-white" />
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
              <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 shadow-xl border border-gray-100">
                <button onClick={() => handleZoom(-0.25)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"><ZoomOut size={18} /></button>
                <div className="px-3 flex items-center text-[10px] font-bold text-gray-400">{Math.round(scale * 100)}%</div>
                <button onClick={() => handleZoom(0.25)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all"><ZoomIn size={18} /></button>
              </div>
              {pdfData && (
                <div className="bg-gray-900/90 text-white px-6 py-3 rounded-full flex items-center gap-6 backdrop-blur-md shadow-2xl">
                  <button onClick={() => changePage(-1)} disabled={pdfData.currentPage <= 1} className="disabled:opacity-20"><ChevronLeft size={20} /></button>
                  <span className="text-[10px] font-black uppercase tracking-widest">Page {pdfData.currentPage} / {pdfData.numPages}</span>
                  <button onClick={() => changePage(1)} disabled={pdfData.currentPage >= pdfData.numPages} className="disabled:opacity-20"><ChevronRight size={20} /></button>
                </div>
              )}
            </div>
          </div>
        )}

        {type === 'docx' && docxHtml && !error && (
          <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-2xl prose prose-sm prose-indigo">
             <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
          </div>
        )}

        {type === 'video' && !error && (
          <div className="w-full h-full flex items-center justify-center bg-black rounded-3xl overflow-hidden shadow-2xl">
            <video src={url} className="w-full max-h-full" controls autoPlay playsInline onError={() => handleInternalError("Vidéo illisible")} />
          </div>
        )}

        {type === 'image' && !error && (
          <div className="flex flex-col items-center gap-4">
             <img src={url} style={{ transform: `scale(${scale / 1.5})`, transformOrigin: 'top center' }} className="rounded-2xl shadow-xl transition-transform h-auto" onError={() => handleInternalError("Image illisible")} />
          </div>
        )}

        {type === 'text' && !error && (
          <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-[32px] border border-gray-100">
             <div className="prose prose-sm prose-indigo whitespace-pre-wrap">{url}</div>
          </div>
        )}
      </div>
    </div>
  );
}
