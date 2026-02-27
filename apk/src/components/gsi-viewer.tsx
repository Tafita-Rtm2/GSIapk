"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import * as mammoth from 'mammoth';
import { Loader2, AlertCircle, ChevronLeft, ChevronRight, FileText, ZoomIn, ZoomOut } from 'lucide-react';
import { toast } from 'sonner';
import { GSIStore } from '@/lib/store';

// Configure PDF.js worker
// Use a check to ensure we are in a browser environment
if (typeof window !== 'undefined') {
  // Utilisation d'un CDN pour le worker afin d'éviter les problèmes de chemins relatifs dans les sous-dossiers
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@5.4.624/build/pdf.worker.min.mjs';
}

interface GSIViewerProps {
  id: string;
  url: string;
  type: 'pdf' | 'video' | 'docx' | 'image' | 'text';
  onLoadComplete?: () => void;
  onError?: (err: string) => void;
}

export function GSIViewer({ id, url, type, onLoadComplete, onError }: GSIViewerProps) {
  const [loading, setLoading] = useState(true);
  const [pdfData, setPdfData] = useState<{ numPages: number; currentPage: number } | null>(null);
  const [scale, setScale] = useState(1.5);
  const [docxHtml, setDocxHtml] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!url) {
       setLoading(false);
       onError?.("Aucun contenu à afficher.");
       return;
    }

    console.log(`GSIViewer: Loading ${type} from ${url.substring(0, 50)}...`);
    setLoading(true);

    const progress = GSIStore.getProgress(id);
    const startPage = progress?.currentPage || 1;

    if (type === 'pdf') {
      renderPdf(startPage);
    } else if (type === 'docx') {
      renderDocx();
    } else if (type === 'video' || type === 'image' || type === 'text') {
      setLoading(false);
      onLoadComplete?.();
    } else {
      setLoading(false);
      onError?.("Type de fichier non reconnu.");
    }
  }, [url, type]);

  const renderPdf = async (pageNum = 1, currentScale = scale) => {
    try {
      // Pour les PDFs, on passe l'URL directement à PDF.js si c'est possible
      // cela permet une meilleure gestion du streaming et du cache par le navigateur
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfData({ numPages: pdf.numPages, currentPage: pageNum });

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: currentScale });

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
      console.log("GSIViewer: Rendering DOCX from", url);
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status} - Échec du chargement du fichier.`);
      const arrayBuffer = await response.arrayBuffer();

      if (arrayBuffer.byteLength === 0) {
         throw new Error("Fichier vide ou corrompu.");
      }

      // Conversion options for Mammoth
      const options = {
        styleMap: [
          "p[style-name='Title'] => h1:fresh",
          "p[style-name='Heading 1'] => h2:fresh",
          "p[style-name='Heading 2'] => h3:fresh"
        ]
      };

      // Handle both ES module and CommonJS exports
      const converter = (mammoth as any).convertToHtml || (mammoth as any).default?.convertToHtml || mammoth.convertToHtml;

      if (typeof converter !== 'function') {
         throw new Error("Moteur de rendu DOCX non disponible.");
      }

      const result = await converter({ arrayBuffer }, options);
      setDocxHtml(result.value);

      if (result.messages.length > 0) {
        console.warn("Mammoth messages:", result.messages);
      }

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
      const percent = Math.round((newPage / pdfData.numPages) * 100);
      const prevProgress = GSIStore.getProgress(id) || {};
      GSIStore.saveProgress(id, {
        currentPage: newPage,
        percent: Math.max(prevProgress.percent || 0, percent),
        completed: prevProgress.completed || percent === 100
      });
    }
  };

  const handleZoom = (delta: number) => {
     const newScale = Math.min(Math.max(scale + delta, 0.5), 4);
     setScale(newScale);
     if (type === 'pdf') {
        setLoading(true);
        renderPdf(pdfData?.currentPage || 1, newScale);
     }
  };

  const markFinished = () => {
     GSIStore.saveProgress(id, { completed: true, percent: 100 });
     toast.success("Leçon terminée ! Progression mise à jour.");
  };

  const currentPercent = pdfData ? Math.round((pdfData.currentPage / pdfData.numPages) * 100) : (GSIStore.getProgress(id)?.percent || 0);

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 overflow-hidden relative">
      {/* Real-time progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100 z-30">
         <div className="h-full bg-indigo-600 transition-all duration-500" style={{ width: `${currentPercent}%` }}></div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-20 backdrop-blur-sm">
          <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">GSI Rendering Engine...</p>
        </div>
      )}

      <div className="flex-1 overflow-auto flex flex-col items-center p-4">
        {type === 'pdf' && (
          <div className="flex flex-col items-center">
            <div className="overflow-auto max-w-full">
               <canvas ref={canvasRef} className="shadow-2xl rounded-sm bg-white mx-auto" style={{ width: 'auto', height: 'auto' }} />
            </div>

            {/* Controls */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-30">
              {/* Zoom Controls */}
              <div className="bg-white/90 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 shadow-xl border border-gray-100">
                <button onClick={() => handleZoom(-0.25)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                   <ZoomOut size={20} />
                </button>
                <div className="px-3 flex items-center text-[10px] font-bold text-gray-400 border-x border-gray-100">
                   {Math.round(scale * 100)}%
                </div>
                <button onClick={() => handleZoom(0.25)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                   <ZoomIn size={20} />
                </button>
              </div>

              {/* Page Controls */}
              {pdfData && (
                <div className="bg-gray-900/90 text-white px-6 py-3 rounded-full flex items-center gap-6 backdrop-blur-md shadow-2xl border border-white/10">
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
          </div>
        )}

        {type === 'docx' && docxHtml && (
          <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-2xl prose prose-sm prose-indigo animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div dangerouslySetInnerHTML={{ __html: docxHtml }} />
          </div>
        )}

        {type === 'video' && (
          <div className="w-full h-full flex items-center justify-center bg-black rounded-3xl overflow-hidden shadow-2xl relative group" onContextMenu={(e) => e.preventDefault()}>
            {/* Direct Play Experience with standard HTML5 */}
            <video
              key={url}
              className="w-full h-full object-contain"
              controls
              autoPlay
              playsInline
              crossOrigin="anonymous"
              preload="auto"
              controlsList="nodownload"
              onLoadedData={() => setLoading(false)}
              onError={(e) => {
                const v = e.currentTarget;
                console.error("GSI Stream Error:", v.error?.code, v.src);
                // Fallback to direct raw URL if proxy fails or just try to reload
                if (v.src.includes('proxy')) {
                   const rawUrl = new URL(v.src).searchParams.get('url');
                   if (rawUrl) {
                      console.log("Retrying with raw URL...");
                      v.src = rawUrl;
                   }
                }
              }}
            >
              <source src={url} type="video/mp4" />
              <source src={url} type="video/webm" />
              <source src={url} type="video/quicktime" />
              Votre navigateur ne supporte pas le streaming direct.
            </video>

            {/* Streaming status overlay */}
            <div className="absolute top-4 right-4 bg-green-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-green-500/30 opacity-0 group-hover:opacity-100 transition-opacity">
               <p className="text-[8px] font-black text-green-400 uppercase tracking-[0.2em]">Live Stream Active</p>
            </div>
          </div>
        )}

        {type === 'image' && (
          <div className="flex flex-col items-center gap-4 group" onContextMenu={(e) => e.preventDefault()}>
            <div className="overflow-auto max-w-full rounded-2xl shadow-2xl bg-white p-2">
               <img
                 key={url}
                 src={url}
                 draggable={false}
                 crossOrigin="anonymous"
                 style={{ transform: `scale(${scale / 1.5})`, transformOrigin: 'top center' }}
                 className="h-auto transition-all duration-300 rounded-xl"
                 alt="Content View"
                 onLoad={() => {
                   setLoading(false);
                   onLoadComplete?.();
                 }}
                 onError={(e) => {
                   const img = e.currentTarget;
                   if (img.src.includes('proxy')) {
                      const rawUrl = new URL(img.src).searchParams.get('url');
                      if (rawUrl) img.src = rawUrl;
                   }
                   setLoading(false);
                 }}
               />
            </div>
            {/* Zoom Controls for Image */}
            <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md p-1.5 rounded-2xl flex gap-1 shadow-xl border border-gray-100 z-30">
                <button onClick={() => handleZoom(-0.25)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                   <ZoomOut size={20} />
                </button>
                <div className="px-3 flex items-center text-[10px] font-bold text-gray-400 border-x border-gray-100">
                   {Math.round(scale / 1.5 * 100)}%
                </div>
                <button onClick={() => handleZoom(0.25)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-all">
                   <ZoomIn size={20} />
                </button>
            </div>
          </div>
        )}

        {type === 'text' && (
          <div className="w-full max-w-2xl bg-white p-8 shadow-lg rounded-[32px] border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <h3 className="text-[10px] font-black uppercase text-indigo-600 mb-4 tracking-widest">Réponse de l'élève</h3>
             <div className="prose prose-sm prose-indigo max-w-none whitespace-pre-wrap font-medium text-gray-700 leading-relaxed">
                {url}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
