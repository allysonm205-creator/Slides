import React, { useState, useEffect, forwardRef } from 'react';
import type { Slide } from '../../types';
import { PhotoIcon } from '../icons/ActionIcons';

interface LayoutProps {
  slide: Slide;
}

const DefaultLayout = forwardRef<HTMLDivElement, LayoutProps>(({ slide }, ref) => {
  const [imageError, setImageError] = useState(false);
  const hasImage = slide.imageUrl && slide.imageUrl.startsWith('data:image');

  useEffect(() => {
    setImageError(false);
  }, [slide.imageUrl]);

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div ref={ref} className="w-full aspect-video bg-slate-800 rounded-lg shadow-2xl p-8 sm:p-10 flex border border-slate-700 overflow-hidden">
      {hasImage && !imageError && (
        <div className="w-1/3 flex-shrink-0 mr-8">
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="w-full h-full object-cover rounded-md bg-slate-700"
            onError={handleImageError}
            crossOrigin="anonymous"
          />
        </div>
      )}
      {(imageError || (slide.imageUrl && !hasImage)) && (
         <div className="w-1/3 flex-shrink-0 mr-8">
            <div className="w-full h-full rounded-md bg-slate-700 flex flex-col items-center justify-center text-center p-4">
              <PhotoIcon className="h-10 w-10 text-slate-500 mb-2" />
              <p className="text-xs text-slate-400">Não foi possível carregar a imagem.</p>
            </div>
         </div>
      )}
      <div className={`flex flex-col justify-center ${(hasImage && !imageError) ? 'w-2/3' : 'w-full'}`}>
        <div className="overflow-y-auto pr-2">
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight break-words">
                {slide.title}
            </h3>
            <ul className="space-y-3">
                {slide.content.map((point, index) => (
                <li key={index} className="flex items-start">
                    <span className="text-indigo-400 mr-3 mt-1 flex-shrink-0">&#9632;</span>
                    <span className="text-base sm:text-lg text-slate-300 leading-relaxed break-words">{point}</span>
                </li>
                ))}
            </ul>
            {slide.speakerNotes && (
                <div className="mt-6 pt-4 border-t border-slate-700">
                <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Anotações do Orador</h4>
                <p className="text-slate-400 text-sm italic">{slide.speakerNotes}</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
});

export default DefaultLayout;
