import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import type { Slide, Source } from '../types';
import SlideViewer from './SlideViewer';
import SlideThumbnailStrip from './SlideThumbnailStrip';
import ExportControls from './ExportControls';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/ChevronIcons';

interface PresentationViewProps {
  slides: Slide[];
  sources: Source[] | null;
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onReset: () => void;
}

const PresentationView: React.FC<PresentationViewProps> = ({ slides, sources, currentSlideIndex, onSlideSelect, onReset }) => {
  const slideViewerRef = useRef<HTMLDivElement>(null);

  const goToNextSlide = () => {
    onSlideSelect(Math.min(slides.length - 1, currentSlideIndex + 1));
  };

  const goToPrevSlide = () => {
    onSlideSelect(Math.max(0, currentSlideIndex - 1));
  };

  const handleExportPNG = () => {
    if (slideViewerRef.current) {
      html2canvas(slideViewerRef.current, { 
        useCORS: true, 
        allowTaint: true,
        backgroundColor: '#1e293b' // bg-slate-800
      }).then((canvas) => {
        const link = document.createElement('a');
        link.download = `slide-${currentSlideIndex + 1}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    }
  };

  const validSources = sources?.filter(source => source.web && source.web.uri && source.web.title) ?? [];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-grow flex items-center justify-center relative w-full mb-4">
        <button 
          onClick={goToPrevSlide} 
          disabled={currentSlideIndex === 0}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-700/50 rounded-full hover:bg-slate-600/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Slide Anterior"
        >
          <ChevronLeftIcon className="h-6 w-6"/>
        </button>

        <SlideViewer ref={slideViewerRef} slide={slides[currentSlideIndex]} />

        <button 
          onClick={goToNextSlide} 
          disabled={currentSlideIndex === slides.length - 1}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-slate-700/50 rounded-full hover:bg-slate-600/80 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          aria-label="Próximo Slide"
        >
          <ChevronRightIcon className="h-6 w-6"/>
        </button>
      </div>
      
      <div className="flex-shrink-0 w-full">
        <SlideThumbnailStrip
          slides={slides}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={onSlideSelect}
        />
      </div>

      <div className="mt-6 w-full max-w-4xl mx-auto flex justify-center gap-4">
        <ExportControls slides={slides} onExportPNG={handleExportPNG} />
        <button
          onClick={onReset}
          className="px-6 py-2 bg-slate-700 text-slate-300 font-medium rounded-lg hover:bg-slate-600 transition-colors"
        >
          Criar Nova Apresentação
        </button>
      </div>

       {validSources.length > 0 && (
          <div className="mt-6 w-full max-w-4xl mx-auto">
            <h4 className="text-lg font-semibold text-slate-300 mb-2">Fontes</h4>
            <ul className="list-disc list-inside space-y-1 text-sm text-slate-400">
              {validSources.map((source, index) => (
                <li key={index}>
                  <a href={source.web!.uri!} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 underline transition-colors">
                    {source.web!.title!}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
    </div>
  );
};

export default PresentationView;