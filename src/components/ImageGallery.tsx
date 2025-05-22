import React, { useState } from 'react';
import { Copy, Check, Trash2, ExternalLink, Download, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageFile } from '../types';

interface ImageGalleryProps {
  images: ImageFile[];
  onDelete: (id: string) => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({ images, onDelete }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  const copyToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (date: Date): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const openFullscreen = (index: number) => {
    setSelectedImageIndex(index);
    setIsFullscreenOpen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreenOpen(false);
    setSelectedImageIndex(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImageIndex === null) return;
    
    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex > 0 ? selectedImageIndex - 1 : images.length - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex < images.length - 1 ? selectedImageIndex + 1 : 0);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') closeFullscreen();
    if (e.key === 'ArrowLeft') navigateImage('prev');
    if (e.key === 'ArrowRight') navigateImage('next');
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <Eye className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        </div>
        <p className="text-gray-500 text-lg">No images uploaded yet</p>
        <p className="text-gray-400 text-sm mt-2">Upload your first image to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-800">
            Image Gallery ({images.length} image{images.length !== 1 ? 's' : ''})
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200"
          >
            <div className="h-48 overflow-hidden relative group">
              <img 
                src={image.url} 
                alt={image.name} 
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <button
                  onClick={() => openFullscreen(index)}
                  className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 p-2 rounded-full shadow-lg hover:bg-gray-100 transition-all duration-200"
                  title="View in gallery"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="truncate pr-2 flex-1">
                  <h3 className="font-medium text-gray-800 truncate" title={image.name}>
                    {image.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(image.size)} · {formatDate(image.uploadedAt)}
                  </p>
                </div>
                
                <button
                  onClick={() => onDelete(image.id)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                  title="Delete image"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => window.open(image.url, '_blank')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={() => downloadImage(image.url, image.name)}
                  className="flex-1 flex items-center justify-center gap-2 py-2 px-3 text-sm bg-green-50 text-green-600 rounded-md hover:bg-green-100 transition-colors"
                  title="Download image"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
              
              {/* URL input with copy button */}
              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={image.url}
                  className="w-full py-2 px-3 pr-10 text-sm bg-gray-50 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  title="Image URL"
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
        ))}
      </div>

      {/* Fullscreen Gallery Modal */}
      {isFullscreenOpen && selectedImageIndex !== null && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeFullscreen}
          onKeyDown={handleKeyPress}
          tabIndex={0}
        >
          <div className="relative max-w-full max-h-full p-4" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closeFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
              title="Close gallery"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Navigation buttons */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => navigateImage('prev')}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  title="Previous image"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => navigateImage('next')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70 transition-colors"
                  title="Next image"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* Image */}
            <img
              src={images[selectedImageIndex].url}
              alt={images[selectedImageIndex].name}
              className="max-w-full max-h-full object-contain"
            />

            {/* Image info */}
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-50 text-white p-4 rounded-lg">
              <h3 className="font-medium text-lg truncate">
                {images[selectedImageIndex].name}
              </h3>
              <p className="text-sm text-gray-300">
                {formatFileSize(images[selectedImageIndex].size)} · {formatDate(images[selectedImageIndex].uploadedAt)}
              </p>
              {images.length > 1 && (
                <p className="text-sm text-gray-300 mt-1">
                  {selectedImageIndex + 1} of {images.length}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;