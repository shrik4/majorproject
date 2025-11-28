import React, { useRef, ChangeEvent } from 'react';

interface FileUploaderProps {
  onFilesAdded: (files: File[]) => void;
  onFileRemoved: (fileName: string) => void;
  uploadedFileNames: Set<string>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ 
  onFilesAdded, 
  onFileRemoved, 
  uploadedFileNames 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
    }
  };

  return (
    <div className="mb-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
        multiple
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Upload CSV File
      </button>
      {uploadedFileNames.size > 0 && (
        <div className="mt-2">
          <h4 className="font-medium">Uploaded Files:</h4>
          <ul className="list-disc pl-5">
            {Array.from(uploadedFileNames).map((fileName) => (
              <li key={fileName} className="flex items-center justify-between">
                <span>{fileName}</span>
                <button
                  onClick={() => onFileRemoved(fileName)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
