
//Access from Ollama (Local Chat Model)
import axios from 'axios';
import * as z from 'zod';

// Use WHATWG URL API instead of string concatenation
const OLLAMA_BASE_URL = new URL('http://localhost:11434');

const outputSchema = z.object({
  suggestions: z.array(
    z.object({
      name: z.string(),
      category: z.string(),
      reason: z.string(),
      priority: z.enum(['low', 'medium', 'high']),
      quantity: z.number().min(1).optional(),
      unit: z.string().optional(),
    }),
  ),
});

type OutputType = z.infer<typeof outputSchema>;

async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const tagsUrl = new URL('/api/tags', OLLAMA_BASE_URL);
    await axios.get(tagsUrl.toString());
    return true;
  } catch (error) {
    return false;
  }
}

async function listAvailableModels(): Promise<string[]> {
  try {
    const tagsUrl = new URL('/api/tags', OLLAMA_BASE_URL);
    const response = await axios.get(tagsUrl.toString());
    return response.data.models?.map((model: any) => model.name) || [];
  } catch (error) {
    return [];
  }
}

export async function generateSuggestions(items: string[]): Promise<OutputType> {
  const prompt = `
    You are a grocery shopping assistant. I have these items in my shopping list:
${items.join(', ')}

Please suggest 3-5 additional grocery items that would complement this list. For each suggestion, provide:
- name: the item name
- category: one of (produce, dairy, meat, pantry, beverages, snacks, other)
- reason: why this item is suggested (complementary, essential, healthy, etc.)
- priority: low, medium, or high

Respond in valid JSON format matching this structure:
{
  "suggestions": [
    {
      "name": string,
      "category": string,
      "reason": string,
      "priority": "low" | "medium" | "high"
    }
  ]
}

Focus on practical, commonly purchased items that make sense with the current list.`;

  try {
    const isOllamaAvailable = await checkOllamaAvailability();
    if (!isOllamaAvailable) {
      console.error('Ollama service is not running. Please start Ollama first.');
      return { suggestions: [] };
    }

    const generateUrl = new URL('/api/generate', OLLAMA_BASE_URL);
    const response = await axios.post(generateUrl.toString(), {
      model: 'llama3.2', // Updated to use available model
      prompt,
      stream: false,
      format: 'json',
    });

    // Add error handling for model not found
    if (response.status === 404) {
      const availableModels = await listAvailableModels();
      console.error(`
Model not found. Available models:
${availableModels.join('\n')}

To use a different model, update the 'model' parameter in generateSuggestions().
`);
      return { suggestions: [] };
    }

    const result = response.data;
    // Parse and validate the response
    const parsed = outputSchema.parse(JSON.parse(result.response));
    return parsed;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 404) {
        const availableModels = await listAvailableModels();
        console.error(`
Model not found. Available models:
${availableModels.join('\n')}

To use a different model, update the 'model' parameter in generateSuggestions().
`);
      } else {
        console.error('Error connecting to Ollama:', error.message);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return { suggestions: [] };
  }
}

export const simpleSuggestionsFlow = {
  execute: async (input: { items: string[] }): Promise<OutputType> => {
    return generateSuggestions(input.items);
  },
};

export function initializeGenkit(): Promise<void> {
  return checkOllamaAvailability().then(isAvailable => {
    if (isAvailable) {
      console.log('Ollama API initialized');
    } else {
      console.error('Failed to connect to Ollama. Please make sure Ollama is running.');
    }
  });
}


/**
 *
 * Access from Vertexai
 *
 * **/
// import { genkit } from 'genkit';
// import * as z from 'zod';
// import { vertexAI } from '@genkit-ai/vertexai';

// const ai = genkit({
//   plugins: [vertexAI()],
// });

// const outputSchema = z.object({
//   suggestions: z.array(
//     z.object({
//       name: z.string(),
//       category: z.string(),
//       reason: z.string(),
//       priority: z.enum(['low', 'medium', 'high']),
//       quantity: z.number().min(1).optional(),
//       unit: z.string().optional(),
//     }),
//   ),
// });

// export const simpleSuggestionsFlow = ai.defineFlow(
//   {
//     name: 'simpleSuggestions',
//     inputSchema: z.object({
//       items: z.array(z.string()).describe('Array of grocery items'),
//     }),
//     outputSchema: outputSchema,
//   },
//   async (input) => {
//     const prompt = `
//     You are a grocery shopping assistant. I have these items in my shopping list:
// ${input.items.join(', ')}

// Please suggest 3-5 additional grocery items that would complement this list. For each suggestion, provide:
// - name: the item name
// - category: one of (produce, dairy, meat, pantry, beverages, snacks, other)
// - reason: why this item is suggested (complementary, essential, healthy, etc.)
// - priority: low, medium, or high

// Focus on practical, commonly purchased items that make sense with the current list.
//   `;
//     try {
//       const { output } = await ai.generate({
//         model: 'vertexai/gemini-2.0-flash',
//         prompt,
//         output: {
//           schema: outputSchema,
//         },
//       });

//       return output || { suggestions: [] };
//     } catch (error) {
//       console.error('Error generating suggestions with Genkit: ', error);
//       return { suggestions: [] };
//     }
//   },
// );

// export function initializeGenkit() {
//   console.log('Genkit initialized');
// }

