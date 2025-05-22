import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ImageFile } from '../types';
import { 
  getUploadedImages, 
  deleteImage as deleteGitHubImage,
  ensureImagesDirectory,
  getRepositoryInfo 
} from '../services/uploadService';

interface UseImagesReturn {
  images: ImageFile[];
  isLoading: boolean;
  error: string | null;
  addImage: (imageUrl: string, file: File) => ImageFile;
  deleteImage: (id: string) => Promise<void>;
  refreshImages: () => Promise<void>;
  clearError: () => void;
  totalImages: number;
  totalSize: number;
}

const useImages = (): UseImagesReturn => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract filename and estimated upload date from GitHub URL
  const parseGitHubImageInfo = (url: string) => {
    const filename = url.split('/').pop() || 'unknown';
    
    // Try to extract timestamp from filename (format: timestamp-originalname)
    const timestampMatch = filename.match(/^(\d{13})-(.+)$/);
    let uploadedAt = new Date();
    let displayName = filename;
    
    if (timestampMatch) {
      const timestamp = parseInt(timestampMatch[1], 10);
      uploadedAt = new Date(timestamp);
      displayName = timestampMatch[2];
    }

    return { displayName, uploadedAt };
  };

  const fetchImages = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Ensure the images directory exists
      await ensureImagesDirectory();
      
      const urls = await getUploadedImages();
      const newImages: ImageFile[] = urls.map(url => {
        const { displayName, uploadedAt } = parseGitHubImageInfo(url);
        
        return {
          id: uuidv4(),
          name: displayName,
          url,
          size: 0, // Size not available from GitHub API in this context
          type: url.split('.').pop()?.toLowerCase() || 'unknown',
          uploadedAt,
        };
      });
      
      // Sort by upload date (newest first)
      newImages.sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime());
      
      setImages(newImages);
    } catch (error) {
      console.error('Error fetching images:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch images');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const addImage = (imageUrl: string, file: File): ImageFile => {
    const newImage: ImageFile = {
      id: uuidv4(),
      name: file.name,
      url: imageUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    };
   
    setImages(prevImages => [newImage, ...prevImages]);
    return newImage;
  };

  const deleteImage = async (id: string): Promise<void> => {
    const image = images.find(img => img.id === id);
    if (!image) {
      throw new Error('Image not found');
    }

    try {
      await deleteGitHubImage(image.url);
      setImages(prevImages => prevImages.filter(img => img.id !== id));
    } catch (error) {
      console.error('Error deleting image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete image';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const clearError = () => {
    setError(null);
  };

  // Calculate total size (only for locally uploaded images with known sizes)
  const totalSize = images.reduce((acc, img) => acc + (img.size || 0), 0);
  const totalImages = images.length;

  return {
    images,
    isLoading,
    error,
    addImage,
    deleteImage,
    refreshImages: fetchImages,
    clearError,
    totalImages,
    totalSize,
  };
};

export default useImages;