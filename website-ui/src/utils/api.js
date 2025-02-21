function fetchProducts() {
    return fetch('/api/products')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        });
}

//Testing the api 
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

export { fetchProducts, sendInquiry };

export async function sendMessageToChatbot(userMessage) {
    try {
        console.log("Sending message to chatbot:", userMessage);

        // Detect if user is requesting a product category
        const categories = ["laptop", "phone", "tv"];  // Add more as needed
        const detectedCategory = categories.find(category => 
            userMessage.toLowerCase().includes(category)
        );

        // If user requests a category, call the new Flask API
        let response;
        if (detectedCategory) {
            response = await fetch(`http://127.0.0.1:5000/products/${detectedCategory}`);
        } else {
            response = await fetch("http://127.0.0.1:5000/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userMessage })
            });
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Chatbot API Response:", data);

        return data.reply || "Sorry, I didn't understand that.";
    } catch (error) {
        console.error("Chatbot API Error:", error);
        return "Sorry, something went wrong. Please check the API connection.";
    }
}



