
import React from 'react';
import { UploadIcon } from './icons';

interface ImageInputProps {
  id: string;
  label: string;
  onFileChange: (file: File | null) => void;
  previewUrl: string | null;
}

const ImageInput: React.FC<ImageInputProps> = ({ id, label, onFileChange, previewUrl }) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
  };

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-2">
        {label}
      </label>
      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-600 border-dashed rounded-md transition-colors duration-300 hover:border-indigo-400">
        <div className="space-y-1 text-center">
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className="mx-auto h-24 w-auto object-contain rounded-md" />
          ) : (
            <UploadIcon className="mx-auto h-12 w-12 text-slate-500" />
          )}
          <div className="flex text-sm text-slate-500">
            <label
              htmlFor={id}
              className="relative cursor-pointer bg-slate-800 rounded-md font-medium text-indigo-400 hover:text-indigo-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-slate-900 focus-within:ring-indigo-500 px-1"
            >
              <span>Upload file</span>
              <input id={id} name={id} type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
            </label>
            <p className="pl-1">atau drag and drop</p>
          </div>
          <p className="text-xs text-slate-600">PNG, JPG, GIF hingga 10MB</p>
        </div>
      </div>
    </div>
  );
};

export default ImageInput;
