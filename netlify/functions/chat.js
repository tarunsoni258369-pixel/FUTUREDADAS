exports.handler = async function (event) {
  // केवल POST request
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Method not allowed"
      })
    };
  }

  try {
    const body = JSON.parse(event.body || "{}");
    const message = String(body.message || "").trim();

    if (!message) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Message is required"
        })
      };
    }

    // 🔐 API key Netlify Environment Variable से आएगी
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "GEMINI_API_KEY is not configured"
        })
      };
    }

    // Gemini API
    const url =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
      encodeURIComponent(apiKey);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "तुम FutureDada हो। एक मददगार, तेज और स्पष्ट AI assistant की तरह जवाब दो। " +
                "यूज़र हिंदी, Roman Hindi या English में पूछ सकता है। " +
                "यूज़र की भाषा के अनुसार सरल भाषा में जवाब दो। " +
                "अगर सवाल गणित का है तो सही गणना करो। " +
                "अगर जानकारी निश्चित नहीं है तो झूठा जवाब मत बनाओ।"
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: message
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Gemini API error:", data);

      return {
        statusCode: response.status,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "Gemini API error",
          details: data.error?.message || "Unknown error"
        })
      };
    }

    const answer =
      data?.candidates?.[0]?.content?.parts
        ?.map(part => part.text || "")
        .join("")
        .trim();

    if (!answer) {
      return {
        statusCode: 500,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          error: "AI ने कोई जवाब नहीं दिया"
        })
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        answer: answer
      })
    };

  } catch (error) {
    console.error("FutureDada error:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        error: "Server error",
        details: error.message
      })
    };
  }
};
