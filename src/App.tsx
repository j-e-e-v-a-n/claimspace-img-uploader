import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import UploadArea from './components/UploadArea';
import ImageLinkDisplay from './components/ImageLinkDisplay';
import ImageGallery from './components/ImageGallery';
import useImages from './hooks/useImages';
import { ImageFile } from './types';

function App() {
  const { images, addImage, deleteImage } = useImages();
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'gallery'>('upload');

  const handleUploadSuccess = (imageUrl: string) => {
    // In a real implementation, we would receive file details from the server
    // Here we're creating a mock file object based on the URL
    const fileName = imageUrl.split('/').pop() || 'image.png';
    const mockFile = new File([''], fileName, { type: 'image/png' });
    
    addImage(imageUrl, mockFile);
    setLastUploadedUrl(imageUrl);
  };

  const handleDeleteImage = (id: string) => {
    deleteImage(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upload
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'gallery'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Gallery ({images.length})
            </button>
          </nav>
        </div>
        
        {activeTab === 'upload' ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload an Image</h2>
              <UploadArea onUploadSuccess={handleUploadSuccess} />
              <ImageLinkDisplay imageUrl={lastUploadedUrl} />
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Your Uploaded Images</h2>
            <ImageGallery images={images} onDelete={handleDeleteImage} />
          </div>
        )}
      </main>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} ImageHost. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;