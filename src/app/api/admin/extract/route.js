import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import { getServerSession } from "next-auth/next";
import { cookies } from "next/headers";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req) {
  try {
    const { base64Data, mimeType, adminPassword } = await req.json();

    const session = await getServerSession(authOptions);
    const isGoogleAdmin = session?.user?.email === "jamphy.admin@gmail.com";
    const isPasswordAdmin = adminPassword === process.env.ADMIN_PASSWORD;
    const adminCookie = cookies().get("admin_session");
    const isCookieAdmin = adminCookie && adminCookie.value === "authenticated";

    if (!isGoogleAdmin && !isPasswordAdmin && !isCookieAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!base64Data || !mimeType) {
      return NextResponse.json({ error: "Missing file data" }, { status: 400 });
    }

    const apiKey = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here") {
      return NextResponse.json({ error: "Gemini API key is missing or invalid in the .env file. Please add a valid GEMINI_API_KEY." }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Clean base64 string if it contains the data url prefix
    const base64Clean = base64Data.replace(/^data:.*?;base64,/, "");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        maxOutputTokens: 8192,
        responseMimeType: "application/json",
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              year: { type: SchemaType.STRING, description: "e.g. 2024" },
              subject: { type: SchemaType.STRING, description: "e.g., Mechanics, Electromagnetism, Mathematical Methods, etc." },
              type: { type: SchemaType.STRING, enum: ["MCQ", "MSQ", "NAT"] },
              question: { type: SchemaType.STRING, description: "The question text, preserving all LaTeX perfectly using \\( ... \\) for inline and \\[ ... \\] for block math" },
              options: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING }, nullable: true, description: "Array of 4 strings, or null if type is NAT. Preserve LaTeX in options." },
              correctAnswer: { type: SchemaType.INTEGER, nullable: true, description: "0-3 for MCQ, or null" },
              correctAnswers: { type: SchemaType.ARRAY, items: { type: SchemaType.INTEGER }, nullable: true, description: "Array of integers for MSQ, or null" },
              natAnswer: { type: SchemaType.STRING, nullable: true, description: "NAT answer, or null" },
              hasImage: { type: SchemaType.BOOLEAN, description: "true if the question refers to a diagram or figure" },
              solution: { type: SchemaType.STRING, nullable: true, description: "detailed step-by-step solution if provided in the document" },
            },
            required: ["year", "subject", "type", "question", "hasImage"]
          }
        }
      }
    });

    const prompt = `
You are an expert at extracting physics and math questions from exam papers.
The attached document/image may contain MULTIPLE questions across multiple pages. 
Carefully scan the ENTIRE document (all pages) from start to finish and extract EVERY SINGLE QUESTION you see into the JSON array.
Do NOT stop at the first question or the first page. If there are 10 pages or 30 questions, extract all of them.

CRITICAL INSTRUCTIONS:
1. Extract ALL questions from the document/image. Return every single question you can find as an array of objects.
2. If a question contains a diagram, graph, chart, or figure, set "hasImage": true. This is extremely important so that we know which questions need image attachments.
3. For the "question" and "options" fields, preserve all LaTeX perfectly using \\( ... \\) for inline and \\[ ... \\] for block math.
4. For the "solution" field, extract it from the document ONLY if it is already provided. Do NOT generate new solutions from scratch (leave as null).
5. For "type", use "MCQ" for single choice, "MSQ" for multiple choice, and "NAT" for numerical answer type.
6. Double check that you haven't missed any questions on any of the pages before finishing.
7. Extract the correct answer and put it in 'correctAnswer' (index 0-3), 'correctAnswers' (array of indices), or 'natAnswer' (string). If the answer is already marked in the image (e.g., ticked, circled, or written), use that. Otherwise, try to solve the question yourself and provide the correct answer. If you are completely unable to figure it out, leave it as null.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Clean,
          mimeType
        }
      }
    ]);

    let text = result.response.text().trim();
    
    let questions = [];
    let partial = false;

    try {
      questions = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse failed, error message:", parseError.message);
      console.log("Attempting robust repair on text...");
      partial = true;
      try {
        questions = repairJson(text);
      } catch (repairError) {
        console.error("Robust repair failed:", repairError.message);
        try {
          const firstBracket = text.indexOf('[');
          const lastBracket = text.lastIndexOf(']');
          if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
            questions = repairJson(text.substring(firstBracket, lastBracket + 1));
          } else {
             throw new Error("No array brackets found");
          }
        } catch (fallbackError) {
           console.log("Fallback failed. Regex extraction...");
           const matches = text.matchAll(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/g);
           for (const match of matches) {
             try {
               const obj = repairJson(match[0]);
               if (obj && typeof obj === 'object') {
                 questions.push(obj);
               }
             } catch (e) {
               // ignore invalid matches
             }
           }
        }
      }
    }

    if (questions.length === 0) {
      console.log("0 questions extracted. Raw text:", text.substring(0, 500));
      return NextResponse.json({ 
        questions: [], 
        partial: true, 
        error: "0 questions extracted. Gemini response: " + text.substring(0, 200) 
      }, { status: 200 }); // Status 200 so frontend can read data.error
    }

    console.log(`Successfully extracted ${questions.length} questions. Total response length: ${text.length} characters.`);
    return NextResponse.json({ questions, partial });
  } catch (error) {
    console.error("Gemini Extraction Error:");
    console.error("  Message:", error.message);
    console.error("  Stack:", error.stack);
    console.error("  GEMINI_API_KEY defined:", !!process.env.GEMINI_API_KEY);
    console.error("  VITE_GEMINI_API_KEY defined:", !!process.env.VITE_GEMINI_API_KEY);
    
    return NextResponse.json({ error: "Failed to extract questions: " + error.message }, { status: 500 });
  }
}

function repairJson(jsonString) {
  let cleaned = jsonString.trim();

  // 1. Remove markdown code block wrappers if present (e.g. ```json ... ```)
  cleaned = cleaned.replace(/^```json\s*/i, "").replace(/```$/, "").trim();

  // 2. Fix trailing commas before closing braces/brackets
  cleaned = cleaned.replace(/,\s*([\]}])/g, "$1");

  // 3. Escape raw newlines, carriage returns, and unescaped backslashes inside string values
  let inQuote = false;
  let chars = cleaned.split("");
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === '"' && (i === 0 || chars[i-1] !== '\\')) {
      inQuote = !inQuote;
    }
    if (inQuote) {
      if (chars[i] === '\n') {
        chars[i] = '\\n';
      } else if (chars[i] === '\r') {
        chars[i] = '\\r';
      } else if (chars[i] === '\\') {
        // Check if the next character starts a valid JSON escape sequence
        const nextChar = chars[i+1];
        const isDoubleBackslash = nextChar === '\\';
        const isQuote = nextChar === '"';
        const isSlash = nextChar === '/';
        const isControl = ['b', 'f', 'n', 'r', 't'].includes(nextChar);
        const isUnicode = nextChar === 'u' && 
                          i + 5 < chars.length && 
                          /^[0-9a-fA-F]{4}$/.test(chars.slice(i+2, i+6).join(""));
                          
        if (!isDoubleBackslash && !isQuote && !isSlash && !isControl && !isUnicode) {
          // It's an invalid escape sequence (like \vec, \theta, etc. or unescaped single backslash)
          // Double escape it by inserting an extra backslash
          chars[i] = '\\\\';
        } else if (isDoubleBackslash) {
          // Skip the next backslash so we don't process it as an unescaped backslash
          i++;
        }
      }
    }
  }
  cleaned = chars.join("");

  // 4. Try parsing the cleaned string
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.log("Initial repair attempt failed, applying bracket balancing...");
  }

  // 5. Bracket balancer for truncated JSON:
  let openBraces = 0;
  let openBrackets = 0;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{') openBraces++;
      if (char === '}') openBraces--;
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
    }
  }

  // If truncated, let's close the open strings and brackets/braces
  if (inString) {
    cleaned += '"';
  }
  while (openBraces > 0) {
    cleaned += '}';
    openBraces--;
  }
  while (openBrackets > 0) {
    cleaned += ']';
    openBrackets--;
  }

  return JSON.parse(cleaned);
}
