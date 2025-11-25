import { GoogleGenAI, Type } from "@google/genai";
import { Book } from '../types';

// Utility function to convert file to base64
const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result.split(',')[1]);
        }
    };
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};


export const parseBookListFromImage = async (imageFile: File): Promise<Omit<Book, 'id' | 'status'>[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imagePart = await fileToGenerativePart(imageFile);

    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
            parts: [
                imagePart,
                { text: `
                    You are an expert data extraction tool. Analyze the provided image, which contains a table of library books for the 'Istanbul International School'. 
                    Extract the information for each book and return it as a JSON array. Each object in the array should conform to the provided schema.
                    The columns are "Kitap Adı" (title), "Kategori" (category), "Yazar" (author), and "S. Sayısı" (pageCount).
                    - Ignore the header, row numbers, and any text outside the table like school name or date.
                    - Clean up any OCR errors. For example, "100 Wys For Every Girt To Look Or Feel Fantastic" should be corrected to "100 Ways For Every Girl To Look Or Feel Fantastic".
                    - Ensure author names are correctly spelled, e.g., "Nigugi WA Thiong'o" and "Ngugi Wa Thiong O" should both be "Ngugi wa Thiong'o".
                    - For page count ("S. Sayısı"), return only the number.
                    - Do not include rows with empty or missing titles.
                `}
            ]
        },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        author: { type: Type.STRING },
                        category: { type: Type.STRING },
                        pageCount: { type: Type.INTEGER },
                    },
                    required: ["title", "author", "category", "pageCount"]
                }
            }
        }
    });

    const text = result.text;
    if (!text) {
        throw new Error("No text returned from Gemini");
    }
    const parsedJson = JSON.parse(text);
    return parsedJson as Omit<Book, 'id' | 'status'>[];

  } catch (error) {
    console.error("Error parsing book list from image:", error);
    throw new Error("Failed to process the library list. The image might be unclear or in an unsupported format.");
  }
};