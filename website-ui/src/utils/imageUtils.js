// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  const backendUrl = process.env.REACT_APP_API_URL || 'https://final-year-project-backend-8cte.onrender.com';
  
  // If imagePath already starts with http, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // If imagePath starts with /images/, remove the leading slash
  if (imagePath.startsWith('/images/')) {
    return `${backendUrl}${imagePath}`;
  }
  
  // Otherwise, add /images/ prefix
  return `${backendUrl}/images/${imagePath}`;
};