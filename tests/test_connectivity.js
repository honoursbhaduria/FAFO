
const Groq = require("groq-sdk");
require("dotenv").config({ path: "./web/.env" });

async function testGroq() {
  console.log("Testing Groq Connectivity...");
  console.log("API Key present:", !!process.env.GROQ_API_KEY);
  
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  
  try {
    const start = Date.now();
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Hello" }],
      model: "llama-3.1-8b-instant",
    });
    console.log("Groq Success (took " + (Date.now() - start) + "ms):", chatCompletion.choices[0].message.content);
  } catch (err) {
    console.error("Groq Failure:", err.message);
    if (err.cause) console.error("Cause:", err.cause);
  }
}

async function testWikipedia() {
  console.log("\nTesting Wikipedia Connectivity...");
  const url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=test&format=json&origin=*";
  
  try {
    const start = Date.now();
    const res = await fetch(url);
    console.log("Wikipedia Status:", res.status);
    const data = await res.json();
    console.log("Wikipedia Success (took " + (Date.now() - start) + "ms):", !!data.query);
  } catch (err) {
    console.error("Wikipedia Failure:", err.message);
    if (err.cause) console.error("Cause:", err.cause);
  }
}

testGroq().then(testWikipedia);
