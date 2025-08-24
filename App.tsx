import React, { useState, useCallback } from 'react';
import type { Slide, Source, PresentationPattern } from './types';
import { generateSlides } from './services/geminiService';
import TopicInput from './components/TopicInput';
import PresentationView from './components/PresentationView';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { PresentationIcon } from './components/icons/PresentationIcon';

const App: React.FC = () => {
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [sources, setSources] = useState<Source[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);

  const handleGenerateSlides = useCallback(async (topic: string, file: File | null, pattern: PresentationPattern) => {
    setIsLoading(true);
    setError(null);
    setSlides(null);
    setSources(null);
    setCurrentSlideIndex(0);
    try {
      const { slides: generatedSlides, sources: generatedSources } = await generateSlides(topic, file, pattern);
      if (generatedSlides && generatedSlides.length > 0) {
        setSlides(generatedSlides);
        setSources(generatedSources);
      } else {
        setError('A IA não conseguiu gerar slides para este tópico. Por favor, tente novamente com um tópico diferente.');
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido. Verifique sua chave de API e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setSlides(null);
    setSources(null);
    setError(null);
    setIsLoading(false);
    setCurrentSlideIndex(0);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <LoadingSpinner />
          <p className="text-lg text-slate-400 mt-4">Gerando sua apresentação...</p>
          <p className="text-sm text-slate-500 mt-2">Isso pode levar um momento. Por favor, aguarde.</p>
        </div>
      );
    }
    if (error) {
      return <ErrorMessage message={error} onRetry={handleReset} />;
    }
    if (slides) {
      return (
        <PresentationView
          slides={slides}
          sources={sources}
          currentSlideIndex={currentSlideIndex}
          onSlideSelect={setCurrentSlideIndex}
          onReset={handleReset}
        />
      );
    }
    return <TopicInput onGenerate={handleGenerateSlides} isLoading={isLoading} />;
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col p-4 sm:p-6 lg:p-8">
      <header className="w-full max-w-7xl mx-auto mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PresentationIcon className="h-8 w-8 text-indigo-400" />
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Slides AI
          </h1>
        </div>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-7xl mx-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;