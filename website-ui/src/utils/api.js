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
        const response = await fetch(`http://localhost:5001/api/products?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Improve the fetchProductById function for more robust matching
async function fetchProductById(productId) {
  try {
    console.group(`🔍 Debug - fetchProductById(${productId})`);
    
    if (!productId) {
      console.error("No product ID provided");
      console.groupEnd();
      return null;
    }
    
    // Fetch all products
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/products`);
    
    if (!response.ok) {
      console.error(`API error: ${response.status}`);
      console.groupEnd();
      throw new Error('Network response was not ok');
    }
    
    const allProducts = await response.json();
    console.log(`Fetched ${allProducts.length} products from API`);
    
    // Direct ID match - most reliable
    let product = allProducts.find(p => p.id && p.id === productId);
    
    if (product) {
      console.log("✅ Found product by direct ID match");
      console.groupEnd();
      return product;
    }
    
    // If productId matches our generated format (1-name-category)
    if (productId.startsWith('1-')) {
      // Extract the name part (without the prefix and potential category suffix)
      const nameSlug = productId.replace(/^1-/, '');
      const nameWithoutCategory = nameSlug.replace(/-(?:phone|laptop|tv)$/, '');
      
      console.log("Looking for name match using:", nameWithoutCategory);
      
      // First try exact slug match
      const slugMatches = allProducts.filter(p => {
        if (!p.name) return false;
        const pSlug = p.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
        return pSlug === nameWithoutCategory || nameWithoutCategory === pSlug;
      });
      
      if (slugMatches.length > 0) {
        console.log("✅ Found product by exact slug match");
        console.groupEnd();
        return slugMatches[0];
      }
      
      // Then try contains match
      const containsMatches = allProducts.filter(p => {
        if (!p.name) return false;
        const pNameLower = p.name.toLowerCase();
        const searchName = nameWithoutCategory.replace(/-/g, ' ');
        return pNameLower.includes(searchName) || searchName.includes(pNameLower);
      });
      
      if (containsMatches.length > 0) {
        console.log("✅ Found product by contains match");
        console.groupEnd();
        return containsMatches[0];
      }
      
      // Try token matching as last resort
      const tokens = nameWithoutCategory.split('-').filter(t => t.length > 2);
      if (tokens.length > 0) {
        const tokenMatches = allProducts
          .map(p => {
            if (!p.name) return { product: p, score: 0 };
            const pNameLower = p.name.toLowerCase();
            let score = 0;
            
            for (const token of tokens) {
              if (pNameLower.includes(token)) {
                score += token.length;
              }
            }
            
            return { product: p, score };
          })
          .filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);
          
        if (tokenMatches.length > 0) {
          console.log("✅ Found product by token matching");
          console.groupEnd();
          return tokenMatches[0].product;
        }
      }
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
function getMatchScore(productName, searchName) {
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
}

function sendInquiry(data) {
    return fetch('http://localhost:5001/api/inquiry', {
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
async function sendMessageToChatbot(userMessage, isFirstMessage = false, instanceId = null) {
    try {
        console.log(`🔵 Sending message to chatbot${isFirstMessage ? ' (first message)' : ''}:`, userMessage);
        
        const response = await fetch("http://localhost:5001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // Important: send cookies
            body: JSON.stringify({ 
                message: userMessage,
                new_chat: isFirstMessage,
                instance_id: instanceId || 'default' // Include the chat instance ID
            })
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
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/products`);
    
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

function generateConsistentProductId(product) {
  if (!product || !product.name) return null;
  
  const nameSlug = product.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  const category = product.category ? `-${product.category}` : '';
  return `1-${nameSlug}${category}`;
}

// Export this function along with your other exports
export { fetchProducts, fetchProductById, sendInquiry, sendMessageToChatbot, fetchProductByName, generateConsistentProductId };

