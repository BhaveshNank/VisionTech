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

        let response = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ message: userMessage }) 
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        // ✅ Read response as text first
        const text = await response.text();
        console.log("🔍 Raw API Response:", text);

        // ✅ Try parsing the response as JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (error) {
            console.error("⚠️ JSON Parsing Error:", error);
            return "Sorry, I couldn't process the AI response.";
        }

        console.log("🟢 Parsed API Response:", data); // ✅ Debugging

        // ✅ Check for valid chatbot response
        if (!data || !data.reply) {
            return "Sorry, the chatbot response is empty.";
        }

        return data.reply;
    } catch (error) {
        console.error("🔴 Chatbot API Error:", error);
        return "Sorry, something went wrong. Please check the API connection.";
    }
}





