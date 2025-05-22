import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { ImageFile } from '../types';
import useLocalStorage from './useLocalStorage';

// For a complete implementation, this would use server storage
// This is a simplified version using localStorage for demo purposes
const useImages = () => {
  const [images, setImages] = useLocalStorage<ImageFile[]>('uploaded-images', []);
  const [isLoading, setIsLoading] = useState(false);

  const addImage = (imageUrl: string, file: File) => {
    const newImage: ImageFile = {
      id: uuidv4(),
      name: file.name,
      url: imageUrl,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
    };
    
    setImages([newImage, ...images]);
    return newImage;
  };

  const deleteImage = (id: string) => {
    setImages(images.filter(image => image.id !== id));
  };

  return {
    images,
    isLoading,
    addImage,
    deleteImage,
  };
};

export default useImages;