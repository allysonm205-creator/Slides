export type SlideLayout = 'default' | 'image_full' | 'title_only';

export interface Slide {
  title: string;
  content: string[];
  speakerNotes?: string;
  imageUrl?: string;
  layout?: SlideLayout;
}

export interface Source {
  web?: {
    uri?: string;
    title?: string;
  };
}

export type PresentationPattern = 'padrao' | 'analise-de-dados' | 'visual' | 'anatomia' | 'processos';