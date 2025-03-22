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
        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        throw error;
    }
}

// Fetch a single product by ID
async function fetchProductById(productId) {
  try {
    console.log("Fetching product with ID:", productId);
    
    const response = await fetch(`http://localhost:5001/api/products`);
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    const allProducts = await response.json();
    console.log("Total products fetched:", allProducts.length);
    
    // Try more specific matching strategies
    let product = null;
    
    // 1. Direct match by ID
    product = allProducts.find(p => p.id === productId);
    
    // 2. If there's a category in the ID, respect it
    if (!product && productId.includes('-')) {
      const parts = productId.split('-');
      const possibleCategory = parts[parts.length - 1]; // Last part might be category
      
      if (['phone', 'laptop', 'tv', 'smartwatch', 'earphone'].includes(possibleCategory)) {
        // Match by category first
        const categoryProducts = allProducts.filter(p => 
          p.category && p.category.toLowerCase() === possibleCategory
        );
        
        if (categoryProducts.length > 0) {
          // Find best match within the correct category
          const nameSlug = parts.slice(1, -1).join('-');
          product = categoryProducts.find(p => 
            p.name && p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(nameSlug)
          );
        }
      }
    }
    
    // 3. Name-based match as last resort (but improved)
    if (!product && productId.includes('-')) {
      const nameSlug = productId.split('-').slice(1).join('-');
      
      // Get all products with matching name parts, then sort by relevance
      const candidates = allProducts
        .filter(p => p.name && p.name.toLowerCase().replace(/[^a-z0-9]/g, '-').includes(nameSlug))
        .sort((a, b) => {
          // Prioritize products where the name is a closer match
          const aName = a.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          const bName = b.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
          return bName.indexOf(nameSlug) - aName.indexOf(nameSlug);
        });
      
      if (candidates.length > 0) {
        product = candidates[0];
      }
    }
    
    if (!product) {
      console.error("Product not found with ID:", productId);
      throw new Error('Product not found');
    }
    
    console.log("Found product:", product);
    return product;
  } catch (error) {
    console.error('Error fetching product details:', error);
    throw error;
  }
}


function sendInquiry(data) {
    return fetch('/api/inquiry', {
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
    console.log(`Fetching product by name: "${productName}"`);
    
    // Normalize the input name
    const normalizedName = productName.toLowerCase().trim();
    
    // Get all products from API
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:5001'}/api/products`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const products = await response.json();
    console.log(`Total available products: ${products.length}`);
    
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
      return scoredProducts[0].product;
    }
    
    console.log(`No matching product found for "${productName}"`);
    return null;
  } catch (error) {
    console.error('Error in fetchProductByName:', error);
    return null;
  }
};

export { fetchProducts, fetchProductById, sendInquiry, sendMessageToChatbot, fetchProductByName };