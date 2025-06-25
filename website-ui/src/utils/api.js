async function fetchProducts(category = 'all', brand = '') {
    try {
        // Build query string
        const params = new URLSearchParams();
        if (category !== 'all') {
            params.set('category', category);
        }
        if (brand) {
            params.set('brand', brand);
        }
        
        // Make request
        const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://visiontech-backend.onrender.com';
        const response = await fetch(`${API_BASE_URL}/api/products?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Improve the fetchProductById function to use the new single product endpoint
async function fetchProductById(productId) {
  try {
    console.group(`🔍 Debug - fetchProductById(${productId})`);
    
    if (!productId) {
      console.error("No product ID provided");
      console.groupEnd();
      return null;
    }
    
    // Try the new single product endpoint first
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://visiontech-backend.onrender.com';
    const response = await fetch(`${API_BASE_URL}/api/product/${encodeURIComponent(productId)}`);
    
    if (response.ok) {
      const product = await response.json();
      console.log("✅ Found product by direct API endpoint");
      console.groupEnd();
      return product;
    }
    
    if (response.status === 404) {
      console.log("Product not found via direct endpoint, trying fallback method...");
      
      // Fallback: Fetch all products and search client-side
      const allProductsResponse = await fetch(`${API_BASE_URL}/api/products`);
      
      if (!allProductsResponse.ok) {
        console.error(`Fallback API error: ${allProductsResponse.status}`);
        console.groupEnd();
        throw new Error('Network response was not ok');
      }
      
      const allProducts = await allProductsResponse.json();
      console.log(`Fetched ${allProducts.length} products for fallback search`);
      
      // Direct ID match - most reliable
      let product = allProducts.find(p => p.id && p.id === productId);
      
      if (product) {
        console.log("✅ Found product by direct ID match in fallback");
        console.groupEnd();
        return product;
      }
    } else {
      console.error(`API error: ${response.status}`);
      console.groupEnd();
      throw new Error('Network response was not ok');
    }
    
    console.log("❌ No product found for ID:", productId);
    console.groupEnd();
    return null;
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    console.groupEnd();
    return null;
  }
}

// Helper function to determine match score
/* function getMatchScore(productName, searchName) {
  if (productName === searchName) return 100;
  if (productName.startsWith(searchName)) return 80;
  if (searchName.startsWith(productName)) return 70;
  if (productName.includes(searchName)) return 60;
  if (searchName.includes(productName)) return 50;
  
  // Count matching words
  const productWords = productName.split(/\s+/);
  const searchWords = searchName.split(/\s+/);
  let matchingWords = 0;
  
  for (const word of searchWords) {
    if (word.length > 2 && productWords.some(w => w.includes(word) || word.includes(w))) {
      matchingWords++;
    }
  }
  
  return matchingWords * 10;
} */

function sendInquiry(data) {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://visiontech-backend.onrender.com';
    return fetch(`${API_BASE_URL}/api/inquiry`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    });
}

// Send message to chatbot
async function sendMessageToChatbot(userMessage, isFirstMessage = false, instanceId = null, chatState = null) {
    try {
        console.log(`🔵 Sending message to chatbot${isFirstMessage ? ' (first message)' : ''}:`, userMessage);
        
        const API_BASE_URL = 'https://visiontech-backend.onrender.com';
        
        const payload = { 
            message: userMessage,
            new_chat: isFirstMessage,
            instance_id: instanceId || 'default'
        };
        
        // Include chat state if provided
        if (chatState) {
            payload.chat_state = chatState;
        }
        
        console.log("🔵 Payload being sent:", payload);
        
        const response = await fetch(`${API_BASE_URL}/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log("🟢 Parsed API Response:", data);
        return data;
    } catch (error) {
        console.error("🔴 Chatbot API Error:", error);
        throw error; // Let component handle the error
    }
}

const fetchProductByName = async (productName) => {
  try {
    console.group(`Fetching product by name: "${productName}"`);
    
    // Normalize the input name
    const normalizedName = productName.toLowerCase().trim();
    console.log("Normalized search term:", normalizedName);
    
    // Get all products from API
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://visiontech-backend.onrender.com'}/api/products`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      console.groupEnd();
      throw new Error(`API error: ${response.status}`);
    }
    
    const products = await response.json();
    console.log(`Total available products: ${products.length}`);
    
    // Log a few product examples to verify structure
    if (products.length > 0) {
      console.log("Sample product:", products[0]);
    }
    
    // Break input name into tokens for flexible matching
    const nameTokens = normalizedName
      .split(/[\s-]+/)
      .filter(token => token.length > 1);
    
    // Calculate match score for each product without hardcoding
    const scoredProducts = products
      .filter(p => p && p.name)
      .map(product => {
        const productNameLower = product.name.toLowerCase();
        let score = 0;
        
        // Exact match gives highest score
        if (productNameLower === normalizedName) {
          score += 100;
        }
        
        // Strong partial matches
        if (productNameLower.includes(normalizedName)) {
          score += 50;
        } else if (normalizedName.includes(productNameLower)) {
          score += 40;
        }
        
        // Match by individual tokens (more flexible)
        for (const token of nameTokens) {
          if (productNameLower.includes(token)) {
            // Give higher weight to longer token matches
            score += Math.min(30, token.length * 2);
          }
        }
        
        // Token density score: what percentage of tokens match?
        const productTokens = productNameLower.split(/[\s-]+/).filter(t => t.length > 1);
        const matchingTokens = nameTokens.filter(t => 
          productTokens.some(pt => pt.includes(t) || t.includes(pt))
        );
        
        if (nameTokens.length > 0) {
          const densityScore = (matchingTokens.length / nameTokens.length) * 40;
          score += densityScore;
        }
        
        // Consider product category if available
        if (product.category && normalizedName.includes(product.category.toLowerCase())) {
          score += 15;
        }
        
        return { product, score };
      })
      .filter(item => item.score > 15) // Only consider reasonable matches
      .sort((a, b) => b.score - a.score); // Sort by descending score
    
    // Log the top candidates for debugging
    scoredProducts.slice(0, 3).forEach(item => {
      console.log(`Match candidate: "${item.product.name}" with score ${item.score}`);
    });
    
    // Return the best match if found
    if (scoredProducts.length > 0) {
      console.log(`Best match for "${productName}": "${scoredProducts[0].product.name}"`);
      console.groupEnd();
      return scoredProducts[0].product;
    }
    
    console.log(`No matching product found for "${productName}"`);
    console.groupEnd();
    return null;
  } catch (error) {
    console.groupEnd();
    console.error('Error in fetchProductByName:', error);
    return null;
  }
};

function generateConsistentProductId(product, index = 0) {
  if (!product || !product.name) return null;
  
  // Use the EXACT same algorithm as the backend
  let nameSlug = product.name.toLowerCase();
  nameSlug = nameSlug.replace(/[^a-z0-9]/g, '-');  // Replace non-alphanumeric with dash
  nameSlug = nameSlug.replace(/^-+|-+$/g, '');      // Strip leading/trailing dashes
  nameSlug = nameSlug.replace(/-+/g, '-');          // Replace multiple dashes with single
  
  // Use 1-based indexing like the backend
  return `${index + 1}-${nameSlug}`;
}

// Unified product ID generator - use this everywhere
function generateProductId(productName, index = 0) {
  if (!productName) return `${index + 1}-unknown-product`;
  
  // Use exact same algorithm as backend
  let nameSlug = productName.toLowerCase();
  nameSlug = nameSlug.replace(/[^a-z0-9]/g, '-');
  nameSlug = nameSlug.replace(/^-+|-+$/g, '');
  nameSlug = nameSlug.replace(/-+/g, '-');
  
  return `${index + 1}-${nameSlug}`;
}

// Export this function along with your other exports
export { fetchProducts, fetchProductById, sendInquiry, sendMessageToChatbot, fetchProductByName, generateConsistentProductId, generateProductId };

