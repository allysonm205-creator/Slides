import React, { forwardRef } from 'react';
import type { Slide } from '../../types';

interface LayoutProps {
  slide: Slide;
}

const TitleOnlyLayout = forwardRef<HTMLDivElement, LayoutProps>(({ slide }, ref) => {
  return (
    <div ref={ref} className="w-full aspect-video bg-slate-800 rounded-lg shadow-2xl p-8 sm:p-12 flex flex-col justify-center items-center text-center border border-slate-700 overflow-hidden">
      <div className="max-w-4xl">
        <h3 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4 leading-tight break-words">
          {slide.title}
        </h3>
        {slide.content.length > 0 && (
          <p className="text-xl sm:text-2xl text-slate-400 leading-relaxed break-words">
            {slide.content.join(' ')}
          </p>
        )}
      </div>
    </div>
  );
});

export default TitleOnlyLayout;
