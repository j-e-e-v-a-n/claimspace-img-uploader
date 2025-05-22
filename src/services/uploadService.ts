import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.VITE_GITHUB_OWNER;
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO;
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

// Supported image file extensions
const SUPPORTED_IMAGE_EXTENSIONS = [
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico', '.tiff', '.tif'
];

// Files to ignore
const IGNORED_FILES = [
  '.gitkeep', '.gitignore', 'README.md', '.DS_Store', 'Thumbs.db'
];

const isImageFile = (filename: string): boolean => {
  const ext = filename.toLowerCase();
  return SUPPORTED_IMAGE_EXTENSIONS.some(extension => ext.endsWith(extension));
};

const shouldIgnoreFile = (filename: string): boolean => {
  return IGNORED_FILES.includes(filename) || filename.startsWith('.');
};

export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
    }

    // Validate file type
    if (!isImageFile(file.name)) {
      throw new Error('Only image files are allowed');
    }

    // Validate file size (max 25MB for GitHub)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      throw new Error('File size must be less than 25MB');
    }

    // Read file as base64
    const reader = new FileReader();
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);

    // Generate a unique filename with timestamp
    const timestamp = new Date().getTime();
    const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `${timestamp}-${safeFileName}`;
    const path = `public/images/${fileName}`;

    // Update progress
    if (onProgress) onProgress(30);

    const content = await base64Promise;
    if (onProgress) onProgress(60);

    // Check if file already exists
    try {
      await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path,
        ref: BRANCH,
      });
      throw new Error('A file with this name already exists');
    } catch (error: any) {
      // File doesn't exist, which is what we want
      if (error.status !== 404) {
        throw error;
      }
    }

    // Upload to GitHub
    const response = await octokit.repos.createOrUpdateFileContents({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      message: `Upload image: ${fileName}`,
      content,
      branch: BRANCH,
    });

    if (onProgress) onProgress(100);

    // Return the raw GitHub content URL
    return `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${path}`;
  } catch (error) {
    console.error('Upload failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to upload image to GitHub');
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
    }

    // Extract the file path from the URL
    const urlParts = url.split(`${BRANCH}/`);
    if (urlParts.length < 2) {
      throw new Error('Invalid image URL format');
    }
    const path = urlParts[1];

    // Get the current file's SHA
    const { data: file } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path,
      ref: BRANCH,
    });

    if ('sha' in file) {
      // Delete the file
      await octokit.repos.deleteFile({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path,
        message: `Delete image: ${path.split('/').pop()}`,
        sha: file.sha,
        branch: BRANCH,
      });
    } else {
      throw new Error('File not found or is a directory');
    }
  } catch (error) {
    console.error('Delete failed:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to delete image from GitHub');
  }
};

// Get all images from the GitHub repository with enhanced filtering
export const getUploadedImages = async (): Promise<string[]> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
    }

    const { data: contents } = await octokit.repos.getContent({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      path: 'public/images',
      ref: BRANCH,
    });

    if (Array.isArray(contents)) {
      return contents
        .filter(file => {
          // Only include files (not directories)
          if (file.type !== 'file') return false;
          
          // Skip ignored files
          if (shouldIgnoreFile(file.name)) return false;
          
          // Only include image files
          return isImageFile(file.name);
        })
        .sort((a, b) => {
          // Sort by name (newest first, assuming timestamp prefix)
          return b.name.localeCompare(a.name);
        })
        .map(file => `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${file.path}`);
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch images:', error);
    // If the directory doesn't exist, return empty array
    if (error && typeof error === 'object' && 'status' in error && error.status === 404) {
      return [];
    }
    return [];
  }
};

// Get repository information
export const getRepositoryInfo = async (): Promise<{
  name: string;
  owner: string;
  isPrivate: boolean;
  size: number;
}> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
    }

    const { data: repo } = await octokit.repos.get({
      owner: REPO_OWNER,
      repo: REPO_NAME,
    });

    return {
      name: repo.name,
      owner: repo.owner.login,
      isPrivate: repo.private,
      size: repo.size,
    };
  } catch (error) {
    console.error('Failed to get repository info:', error);
    throw new Error('Failed to get repository information');
  }
};

// Check if the images directory exists and create it if it doesn't
export const ensureImagesDirectory = async (): Promise<void> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
    }

    // Try to get the directory
    try {
      await octokit.repos.getContent({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        path: 'public/images',
        ref: BRANCH,
      });
    } catch (error: any) {
      if (error.status === 404) {
        // Directory doesn't exist, create it with a .gitkeep file
        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: 'public/images/.gitkeep',
          message: 'Create images directory',
          content: btoa('# This file keeps the directory in git'),
          branch: BRANCH,
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('Failed to ensure images directory:', error);
    throw new Error('Failed to ensure images directory exists');
  }
};