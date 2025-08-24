import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="w-full max-w-lg text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
      <h3 className="text-2xl font-bold text-red-300 mb-4">Ocorreu um Erro</h3>
      <p className="text-red-200 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-500 transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );
};

export default ErrorMessage;