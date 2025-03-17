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
        console.log("🔵 Sending message to chatbot:", userMessage);

        let response = await fetch("http://localhost:5001/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include", // ✅ Ensure cookies are sent
            body: JSON.stringify({ message: userMessage }) 
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("🟢 Parsed API Response:", data);
        return data; // ✅ Return parsed JSON instead of string
    } catch (error) {
        console.error("🔴 Chatbot API Error:", error);
        return { reply: "Sorry, something went wrong. Please check the API connection.", response_type: "error" };
    }
}











