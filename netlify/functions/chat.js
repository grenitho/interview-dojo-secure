const { GoogleGenerativeAI } = require("@google/generative-ai");

exports.handler = async function(event, context) {
  // Hanya terima metode POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    // Ambil data yang dikirim dari Frontend (index.html)
    const { history, message } = JSON.parse(event.body);

    // Ambil API KEY dari "Brankas" Netlify (Environment Variable)
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API Key missing in server configuration." }) };
    }

    // Inisialisasi Google AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    // Mulai Chat dengan history yang dibawa dari Frontend
    const chat = model.startChat({
      history: history || []
    });

    // Kirim pesan ke AI
    const result = await chat.sendMessage(message);
    const response = await result.response;
    const text = response.text();

    // Kirim balasan kembali ke Frontend
    return {
      statusCode: 200,
      body: JSON.stringify({ reply: text })
    };

  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect to AI." })
    };
  }
};
