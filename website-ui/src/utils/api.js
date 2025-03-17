function fetchProducts() {
    return fetch('/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
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
export async function sendMessageToChatbot(userMessage, isFirstMessage = false, instanceId = null) {
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

export { fetchProducts, sendInquiry };