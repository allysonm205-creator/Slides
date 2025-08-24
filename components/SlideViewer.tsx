import React, { forwardRef } from 'react';
import type { Slide } from '../types';
import DefaultLayout from './layouts/DefaultLayout';
import ImageFullLayout from './layouts/ImageFullLayout';
import TitleOnlyLayout from './layouts/TitleOnlyLayout';

interface SlideViewerProps {
  slide: Slide;
}

const SlideViewer = forwardRef<HTMLDivElement, SlideViewerProps>(({ slide }, ref) => {
  if (!slide) return null;

  switch (slide.layout) {
    case 'image_full':
      return <ImageFullLayout ref={ref} slide={slide} />;
    case 'title_only':
      return <TitleOnlyLayout ref={ref} slide={slide} />;
    case 'default':
    default:
      return <DefaultLayout ref={ref} slide={slide} />;
  }
});

export default SlideViewer;