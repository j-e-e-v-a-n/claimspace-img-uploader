import React, { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

interface ImageLinkDisplayProps {
  imageUrl: string | null;
}

const ImageLinkDisplay: React.FC<ImageLinkDisplayProps> = ({ imageUrl }) => {
  const [copied, setCopied] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (imageUrl) {
      setIsVisible(true);
      setCopied(false);
    } else {
      setIsVisible(false);
    }
  }, [imageUrl]);

  const copyToClipboard = () => {
    if (imageUrl) {
      navigator.clipboard.writeText(imageUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  if (!isVisible || !imageUrl) {
    return null;
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6 animate-fade-in">
      <h3 className="text-green-800 font-medium mb-2 flex items-center">
        <Check className="w-5 h-5 mr-2 text-green-600" />
        Upload Successful!
      </h3>
      
      <div className="mt-3 flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            readOnly
            value={imageUrl}
            className="w-full py-2 px-3 pr-10 bg-white border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"
          />
          <button
            onClick={copyToClipboard}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-green-600 transition-colors"
            title="Copy URL"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-600" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
        
        <a
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md flex items-center justify-center transition-colors"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open
        </a>
      </div>
      
      <div className="mt-4 bg-white rounded-lg p-2 border border-gray-200 overflow-hidden">
        <img 
          src={imageUrl} 
          alt="Uploaded preview" 
          className="w-full h-auto max-h-48 object-contain"
        />
      </div>
    </div>
  );
};

export default ImageLinkDisplay;