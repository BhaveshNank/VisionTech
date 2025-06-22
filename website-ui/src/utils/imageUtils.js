// Marketing/homepage images that should come from frontend directory
const MARKETING_IMAGES = [
  'testimonial1.jpg', 'testimonial2.jpg', 'testimonial3.jpg',
  'mark_chatbot.jpg', 'cards.jpg', 'rogstrix.jpg', 'tv.jpg',
  'ipadm4pro.jpg', 'iphone16sad.jpg', 'iphonead.jpg', 'googlepixelad.jpg',
  'headphone.jpg', 'gamingmouse.jpg',
  'laptop.jpg', 'phone.jpg', 'smartwatch.jpg', 'earphone.jpg',
  'default-product.jpg'
];

// Utility function to get the correct image URL
export const getImageUrl = (imagePath) => {
  const backendUrl = process.env.REACT_APP_API_URL || 'https://final-year-project-backend-8cte.onrender.com';
  
  // If imagePath already starts with http, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Extract just the filename from the path
  let filename = imagePath;
  if (imagePath.startsWith('/images/')) {
    filename = imagePath.replace('/images/', '');
  }
  
  // Check if this is a marketing image (should come from frontend directory)
  if (MARKETING_IMAGES.includes(filename)) {
    return `${backendUrl}/images/${filename}`; // Backend serves both directories
  }
  
  // Product images come from backend directory
  return `${backendUrl}/images/${filename}`;
};

// Utility specifically for product images (always backend)
export const getProductImageUrl = (imagePath) => {
  const backendUrl = process.env.REACT_APP_API_URL || 'https://final-year-project-backend-8cte.onrender.com';
  
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  let filename = imagePath;
  if (imagePath.startsWith('/images/')) {
    filename = imagePath.replace('/images/', '');
  }
  
  return `${backendUrl}/images/${filename}`;
};