import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export default function PdfViewer({ fileUrl }) {
  const [numPages, setNumPages] = useState(null);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotate, setRotate] = useState(0);

  function onLoad({ numPages }) { setNumPages(numPages); setPage(1); }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Controls toolbar */}
      <div className="flex items-center gap-2 flex-wrap justify-center p-3 rounded-2xl"
           style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex items-center gap-1.5">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page<=1}
            className="btn-secondary btn-icon"><ChevronLeft size={15}/></button>
          <span className="text-xs font-semibold text-dark-300 min-w-[80px] text-center">
            {page} / {numPages??'…'}
          </span>
          <button onClick={()=>setPage(p=>Math.min(numPages??p,p+1))} disabled={page>=(numPages??1)}
            className="btn-secondary btn-icon"><ChevronRight size={15}/></button>
        </div>
        <div className="w-px h-5" style={{background:'rgba(255,255,255,0.1)'}}/>
        <div className="flex items-center gap-1.5">
          <button onClick={()=>setScale(s=>Math.max(0.5,s-0.2))} className="btn-secondary btn-icon">
            <ZoomOut size={15}/>
          </button>
          <span className="text-xs font-semibold text-dark-300 min-w-[44px] text-center">
            {Math.round(scale*100)}%
          </span>
          <button onClick={()=>setScale(s=>Math.min(2.5,s+0.2))} className="btn-secondary btn-icon">
            <ZoomIn size={15}/>
          </button>
        </div>
        <div className="w-px h-5" style={{background:'rgba(255,255,255,0.1)'}}/>
        <button onClick={()=>setRotate(r=>(r+90)%360)} className="btn-secondary btn-icon">
          <RotateCw size={15}/>
        </button>
      </div>

      {/* PDF canvas */}
      <div className="overflow-auto max-w-full max-h-[70vh] rounded-2xl"
           style={{background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)'}}>
        <Document file={fileUrl} onLoadSuccess={onLoad}
          loading={
            <div className="p-12 text-sm text-dark-400 flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-purple-500 border-t-transparent animate-spin"/>
              Loading PDF…
            </div>
          }
          error={
            <div className="p-12 text-sm text-red-400 text-center">
              <div className="text-3xl mb-3">⚠️</div>
              Failed to load PDF. Try downloading it instead.
            </div>
          }>
          <Page pageNumber={page} scale={scale} rotate={rotate}
            renderTextLayer={false} renderAnnotationLayer={false}/>
        </Document>
      </div>
    </div>
  );
}
