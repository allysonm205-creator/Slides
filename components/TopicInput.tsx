import React, { useState, useRef, useCallback } from 'react';
import { MagicWandIcon } from './icons/MagicWandIcon';
import { DocumentIcon, CloseIcon } from './icons/ActionIcons';
import type { PresentationPattern } from '../types';

interface TopicInputProps {
  onGenerate: (topic: string, file: File | null, pattern: PresentationPattern) => void;
  isLoading: boolean;
}

const TopicInput: React.FC<TopicInputProps> = ({ onGenerate, isLoading }) => {
  const [topic, setTopic] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [pattern, setPattern] = useState<PresentationPattern>('padrao');
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const validFileTypes = "application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv,.pptx,.ptt,.docx,.xlsx";

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  }, []);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        handleFileSelect(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (topic.trim().length === 0 && !file) {
      setError('Por favor, insira um tópico ou envie um arquivo.');
      return;
    }
    setError('');
    onGenerate(topic, file, pattern);
  };

  const canSubmit = !isLoading && (topic.trim().length > 0 || file !== null);

  return (
    <div className="w-full max-w-2xl text-center">
      <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">Crie uma Apresentação Instantaneamente</h2>
      <p className="text-lg text-slate-400 mb-8">Digite um tópico ou envie um documento, e nós geraremos os slides para você.</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="topic-input" className="block text-sm font-medium text-slate-300 text-left mb-2">Tópico (Opcional)</label>
          <textarea
            id="topic-input"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="ex: O impacto da IA no desenvolvimento web moderno"
            className="w-full h-24 p-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 resize-none text-lg"
            disabled={isLoading}
          />
        </div>

        <div>
            <label htmlFor="pattern-select" className="block text-sm font-medium text-slate-300 text-left mb-2">Estilo da Apresentação</label>
            <select
                id="pattern-select"
                value={pattern}
                onChange={(e) => setPattern(e.target.value as PresentationPattern)}
                className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 appearance-none bg-no-repeat"
                style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.5em 1.5em' }}
                disabled={isLoading}
            >
                <option value="padrao">Padrão (Equilibrado)</option>
                <option value="analise-de-dados">Análise de Dados</option>
                <option value="visual">Apresentação Visual (Foco em Imagens)</option>
                <option value="anatomia">Anatomia e Histologia</option>
                <option value="processos">Processos e Fluxogramas</option>
            </select>
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-300 text-left mb-2">Documento de Contexto (Opcional)</label>
            {!file ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    className={`relative block w-full border-2 ${isDragging ? 'border-indigo-500' : 'border-slate-700'} border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-slate-500 transition-colors`}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Área para envio de arquivo"
                >
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept={validFileTypes}
                        disabled={isLoading}
                        aria-hidden="true"
                    />
                    <DocumentIcon className="mx-auto h-12 w-12 text-slate-500" />
                    <span className="mt-2 block text-sm font-semibold text-slate-300">
                        Arraste e solte um arquivo ou <span className="text-indigo-400">clique para enviar</span>
                    </span>
                    <span className="mt-1 block text-xs text-slate-500">PDF, DOCX, PPTX, XLSX, CSV</span>
                </div>
            ) : (
                <div className="w-full p-4 bg-slate-800 border-2 border-slate-700 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <DocumentIcon className="h-6 w-6 text-slate-400 flex-shrink-0" />
                        <span className="text-white font-medium truncate" title={file.name}>{file.name}</span>
                    </div>
                    <button
                        type="button"
                        onClick={handleRemoveFile}
                        disabled={isLoading}
                        className="p-1 text-slate-400 hover:text-white rounded-full hover:bg-slate-700 disabled:opacity-50"
                        aria-label="Remover arquivo"
                    >
                        <CloseIcon className="h-5 w-5"/>
                    </button>
                </div>
            )}
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:scale-100"
        >
          <MagicWandIcon className="w-6 h-6 mr-3" />
          <span>{isLoading ? 'Gerando...' : 'Gerar Slides'}</span>
        </button>
      </form>
    </div>
  );
};

export default TopicInput;