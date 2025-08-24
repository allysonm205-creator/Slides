import React, { useState, useEffect, forwardRef } from 'react';
import type { Slide } from '../../types';

interface LayoutProps {
  slide: Slide;
}

const ImageFullLayout = forwardRef<HTMLDivElement, LayoutProps>(({ slide }, ref) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = slide.imageUrl && slide.imageUrl.startsWith('data:image');

  useEffect(() => {
    setImageError(false);
  }, [slide.imageUrl]);

  return (
    <div ref={ref} className="w-full aspect-video bg-slate-800 rounded-lg shadow-2xl flex border border-slate-700 overflow-hidden relative justify-center items-center p-8 sm:p-12">
      {hasImage && !imageError ? (
        <img
          src={slide.imageUrl}
          alt={slide.title}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          onError={() => setImageError(true)}
          crossOrigin="anonymous"
        />
      ) : (
        <div className="absolute top-0 left-0 w-full h-full bg-slate-700 z-0"></div>
      )}
      <div className="absolute top-0 left-0 w-full h-full bg-black/50 z-10"></div>
      
      <div className="relative z-20 flex flex-col justify-center text-center max-w-4xl">
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight break-words shadow-lg">
          {slide.title}
        </h3>
        {slide.content.length > 0 && (
          <p className="text-lg sm:text-xl text-slate-200 leading-relaxed break-words shadow-md">
            {slide.content.join(' ')}
          </p>
        )}
      </div>
    </div>
  );
});

export default ImageFullLayout;
