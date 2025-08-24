
import React from 'react';
import type { Slide } from '../types';

interface SlideThumbnailStripProps {
  slides: Slide[];
  currentSlideIndex: number;
  onSlideSelect: (index: number) => void;
}

const SlideThumbnail: React.FC<{ slide: Slide; index: number; isActive: boolean; onClick: (index: number) => void }> = ({ slide, index, isActive, onClick }) => {
  const activeClasses = 'border-indigo-500 ring-2 ring-indigo-500';
  const inactiveClasses = 'border-slate-700 hover:border-slate-500';

  return (
    <button
      onClick={() => onClick(index)}
      className={`relative w-40 aspect-video bg-slate-800 rounded-md p-2 flex flex-col justify-center items-center text-center border-2 transition-all duration-200 cursor-pointer overflow-hidden ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span className="absolute top-1 left-2 text-xs font-bold text-slate-500">{index + 1}</span>
      <p className="text-xs font-semibold text-white leading-tight break-words line-clamp-3">
        {slide.title}
      </p>
    </button>
  );
};


const SlideThumbnailStrip: React.FC<SlideThumbnailStripProps> = ({ slides, currentSlideIndex, onSlideSelect }) => {
  return (
    <div className="bg-slate-900/50 p-4 rounded-lg">
      <div className="flex items-center justify-center space-x-4 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <div key={index} className="flex-shrink-0">
             <SlideThumbnail
                slide={slide}
                index={index}
                isActive={index === currentSlideIndex}
                onClick={onSlideSelect}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SlideThumbnailStrip;
