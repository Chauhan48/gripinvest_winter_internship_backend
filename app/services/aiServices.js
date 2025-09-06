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

module.exports = aiServices;