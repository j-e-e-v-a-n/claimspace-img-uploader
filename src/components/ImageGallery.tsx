import React, { useState } from 'react';
import { Copy, Check, Trash2 } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageGalleryProps {
  images: ImageFile[];
  onDelete: (id: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No images uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div 
          key={image.id} 
          className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-200"
        >
          <div className="h-48 overflow-hidden">
            <img 
              src={image.url} 
              alt={image.name} 
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="truncate pr-2">
                <h3 className="font-medium text-gray-800 truncate" title={image.name}>
                  {image.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {formatFileSize(image.size)} · {formatDate(image.uploadedAt)}
                </p>
              </div>
              
              <button
                onClick={() => onDelete(image.id)}
                className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Delete image"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mt-4 flex">
              <div className="flex-1 relative">
                <input
                  type="text"
                  readOnly
                  value={image.url}
                  className="w-full py-2 px-3 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  onClick={() => copyToClipboard(image.url, image.id)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-blue-500 transition-colors"
                  title="Copy URL"
                >
                  {copiedId === image.id ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ImageGallery;