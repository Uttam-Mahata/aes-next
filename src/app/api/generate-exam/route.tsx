import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Access your API key 
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    const genAI = new GoogleGenerativeAI(apiKey);

    // Initialize a generative model
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Retrieve the data from the request body
    const { examName } = await req.json();

    // Define a prompt for generating subjects with detailed instructions
    const prompt = `For the exam titled "${examName}", generate a comprehensive JSON output with the following structure:
    {
      "examName": "String",
      "totalSubjects": "Number",
      "subjects": [
        {
          "name": "Subject Name",
          "description": "Brief subject overview",
          "questionTypes": [
            {
              "type": "Multiple Choice",
              "sampleQuestions": ["Question 1", "Question 2"]
            },
            {
              "type": "Short Answer",
              "sampleQuestions": ["Question 1", "Question 2"]
            }
          ],
        
        }
      ]
    }

    Provide a realistic and comprehensive breakdown for a typical ${examName} exam. Ensure the JSON is valid and well-structured.`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const output = await response.text();

    // Extract JSON from the response
    const jsonMatch = output.match(/```json\n([\s\S]*?)\n```/);
    let parsedOutput;

    if (jsonMatch) {
      parsedOutput = JSON.parse(jsonMatch[1]);
    } else {
      // Fallback parsing if no code block is found
      parsedOutput = JSON.parse(output.replace(/```json|```/g, '').trim());
    }

    // Send the structured JSON response
    return NextResponse.json(parsedOutput);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
      error: 'Failed to generate subjects',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}