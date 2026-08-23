exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" })
    };
  }

  try {
    const { message } = JSON.parse(event.body || "{}");

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Message is required" })
      };
    }

    // अभी API connection बाद में सुरक्षित तरीके से जोड़ेंगे
    return {
      statusCode: 200,
      body: JSON.stringify({
        reply: "FutureDada चालू है 🚀 आपका संदेश मिला: " + message
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Server error" })
    };
  }
};
