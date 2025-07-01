// Helper function to get the full image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  
  // If it's already a full URL (http/https), return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If it's a relative path, construct the full URL
  const baseUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  return `${baseUrl}${imagePath}`;
};

// Helper function to validate if an image URL is accessible
export const validateImageUrl = async (url) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch {
    return false;
  }
};
