import React, { useCallback, useState } from 'react';
import { Upload, X, AlertCircle } from 'lucide-react';
import { uploadImage } from '../services/uploadService';

interface UploadAreaProps {
  onUploadSuccess: (imageUrl: string) => void;
  className?: string;
}

const UploadArea: React.FC<UploadAreaProps> = ({ onUploadSuccess, className = '' }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      setErrorMessage('Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG)');
      return false;
    }
    
    // 10MB file size limit
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size must be less than 10MB');
      return false;
    }
    
    return true;
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setErrorMessage(null);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      
      if (validateFile(file)) {
        setIsUploading(true);
        try {
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + 10;
            });
          }, 200);
          
          const imageUrl = await uploadImage(file, (progress) => {
            setUploadProgress(progress);
          });
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          onUploadSuccess(imageUrl);
          
          // Reset after a short delay
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000);
        } catch (error) {
          setErrorMessage('Upload failed. Please try again.');
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    }
  }, [onUploadSuccess]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      
      if (validateFile(file)) {
        setIsUploading(true);
        try {
          // Simulate upload progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => {
              if (prev >= 90) {
                clearInterval(progressInterval);
                return prev;
              }
              return prev + 10;
            });
          }, 200);
          
          const imageUrl = await uploadImage(file, (progress) => {
            setUploadProgress(progress);
          });
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          onUploadSuccess(imageUrl);
          
          // Reset after a short delay
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000);
        } catch (error) {
          setErrorMessage('Upload failed. Please try again.');
          setIsUploading(false);
          setUploadProgress(0);
        }
      }
    }
    
    // Reset the input
    e.target.value = '';
  }, [onUploadSuccess]);

  const clearError = useCallback(() => {
    setErrorMessage(null);
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="text-red-500 w-5 h-5 mt-0.5 mr-2 flex-shrink-0" />
          <div className="flex-1 text-red-700 text-sm">{errorMessage}</div>
          <button 
            onClick={clearError} 
            className="text-red-400 hover:text-red-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-all duration-200 ${
          isDragging 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="w-full">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Uploading...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-blue-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">Drag and drop your image here</h3>
            <p className="text-sm text-gray-500 mb-4">or click to browse</p>
            
            <label className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 cursor-pointer">
              Select Image
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileSelect} 
              />
            </label>
            
            <p className="mt-4 text-xs text-gray-500">Supported formats: JPEG, PNG, GIF, WEBP, SVG (max 10MB)</p>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadArea;