import { Octokit } from '@octokit/rest';

const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
const REPO_OWNER = import.meta.env.VITE_GITHUB_OWNER;
const REPO_NAME = import.meta.env.VITE_GITHUB_REPO;
const BRANCH = 'main';

const octokit = new Octokit({ auth: GITHUB_TOKEN });

export const uploadImage = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
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
    const safeFileName = file.name.replace(/[^a-zA-Z0-9-.]/g, '_');
    const fileName = `${timestamp}-${safeFileName}`;
    const path = `public/images/${fileName}`;

    // Update progress
    if (onProgress) onProgress(30);

    const content = await base64Promise;
    if (onProgress) onProgress(60);

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
    throw new Error('Failed to upload image to GitHub');
  }
};

export const deleteImage = async (url: string): Promise<void> => {
  try {
    if (!GITHUB_TOKEN || !REPO_OWNER || !REPO_NAME) {
      throw new Error('GitHub configuration is missing');
    }

    // Extract the file path from the URL
    const path = url.split(`${BRANCH}/`)[1];
    
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
        message: `Delete image: ${path}`,
        sha: file.sha,
        branch: BRANCH,
      });
    }
  } catch (error) {
    console.error('Delete failed:', error);
    throw new Error('Failed to delete image from GitHub');
  }
};

// Get all images from the GitHub repository
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
        .filter(file => file.type === 'file')
        .map(file => `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${file.path}`);
    }

    return [];
  } catch (error) {
    console.error('Failed to fetch images:', error);
    return [];
  }
};