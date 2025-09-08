const { GoogleGenAI } = require('@google/genai');
const { API_KEY } = require('../../config/config');

const genAI = new GoogleGenAI({ apiKey: API_KEY });

const aiServices = {};

aiServices.generateProductDescription = async (productDetails) => {
  try {

    const prompt = `
      You are a professional financial copywriter. Write a short, engaging, and trustworthy product description for an investment product based on the following details. Highlight its key benefits and competitive yield. The description should be a single paragraph, no more than 4-5 sentences, and professional yet accessible to a general audience.

      Product Name: ${productDetails.name}
      Investment Type: ${productDetails.investment_type}
      Tenure: ${productDetails.tenure_months} months
      Annual Yield: ${productDetails.annual_yield}%
      Risk Level: ${productDetails.risk_level}
      Minimum Investment: $${productDetails.min_investment}
      Maximum Investment: $${productDetails.max_investment}
      
      Begin the description now.`;

    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return text;
  } catch (error) {
    console.error("Error generating product description:", error);
    return "A detailed product description is not available at this time.";
  }
}

aiServices.suggestProducts = async (products = [], userRiskAppetite) => {
  try {
    const prompt = `You are a professional financial copywriter and investment advisor.  

The user will provide:  
1. An array of investment products with details including:  
   ${products}  
2. The user's risk appetite: ${userRiskAppetite} (low, moderate, or high).  

Your tasks:  
- From the provided products, select the one with the highest annual_yield that matches the user’s risk appetite.  
- Return only that product's id and description.  
- The description must be **concise (2–3 sentences max)**, highlight the product’s key benefits, tenure, and competitive yield, and explain why it suits the given risk appetite.  
- The output must be in **valid JSON** format only, with no extra text.  

Format the response exactly as:  
{
  "product_id": "<id>",
  "description": "<short engaging paragraph here>"
}

Now process the input.

`;
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return text;
  } catch (error) {
    console.error("Error generating product description:", error);
    return "Couldn't fetch products with best return.";
  }
}

module.exports = aiServices;