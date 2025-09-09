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
   ${JSON.stringify(products)}  
2. The user's risk appetite: ${userRiskAppetite} (low, medium, or high).  

Your tasks:  
- From the provided products, select the one with the highest annual_yield that matches the user’s risk appetite.  
- Return only that product's id and description.  
- The description must be **concise (2–3 sentences max)**, highlight the product’s key benefits, tenure, and competitive yield, and explain why it suits the given risk appetite.  
- The output must be in **valid JSON** format only, with no extra text.  
- Note don't chage the key and value name.

Format the response exactly as:  
{
  "id": "<id of the producte from the above product list>",
  "name": "<name of the product from the above product list>",
  "investment_type": "<investment_type from the above product list>",
  "tenure_monts": "<tenure_months from the above product list>",
  "annual_yield": "<annual_yield from the above product list>",
  "min_investment": <min_investment from the above product list>,
  "max_investment": <max_investment from the above product list>,
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

aiServices.generatePortfolioSummary = async (investments = []) => {
  try{
    const prompt = `You are a financial analyst AI. 
I will give you an array of investments made by a user. 
Each investment object has fields like: 
- product_name
- status (active/matured/cancelled)
- amount
- expected_return
- maturity_date
- invested_at

Your task:
1. Summarize the portfolio in plain English (concise but informative).
2. Calculate total invested amount, total expected returns, and highlight % allocation per product.
3. Mention the distribution of statuses (active vs matured vs cancelled).
4. Highlight top 2 products by invested amount.
5. Provide 2-3 insights about diversification and risks.
6. Here is the array of investments:
   ${JSON.stringify(investments)}
7. Return the response in a JSON format with the following keys:
   {
     "summary": "...",
     "totals": {
       "total_invested": ...,
       "total_expected_return": ...
     },
     "allocation": [
       { "product_name": "...", "percentage": ... }
     ],
     "status_distribution": {
       "active": ...,
       "matured": ...,
       "cancelled": ...
     },
     "top_products": ["...", "..."],
     "insights": ["...", "..."]
   }
`
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }]
    });
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    return text;
  }catch(error){
    console.error("Error generating portfolio summary", error);
    return "Couldn't generate portfolio summary";
  }
} 

module.exports = aiServices;