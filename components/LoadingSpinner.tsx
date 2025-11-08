
import React from 'react';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-indigo-500 border-t-transparent"></div>
        <p className="text-slate-400">AI sedang meracik yang terbaik untukmu...</p>
    </div>
  );
};

export default LoadingSpinner;
