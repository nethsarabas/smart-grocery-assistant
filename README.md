# Smart Grocery Assistant

## Short description
A TypeScript-based assistant that helps users create and manage grocery lists and generates context-aware suggestions to streamline shopping.

## Key features
- Type-safe models for grocery items, lists and suggestions.
- Local LLM integration (Ollama) with fallback instructions for Genkit/Vertex AI.
- Suggestion flow returning prioritized, reasoned item recommendations.
- Configurable suggestion behavior (includeSuggestions, maxSuggestions).

## Technologies
- TypeScript
- Node.js
- (Optional) Frontend framework: Angular or React
- Local LLM: Ollama (recommended for local dev)
- Optional cloud: Vertex AI / Genkit

## Quick start — local (Node)
1. Install dependencies
   - `npm install`

2. Start Ollama (if using local model)
   - Follow Ollama docs to run the service (default: http://localhost:11434)

3. Run the app / tests
   - `npm run build`
   - `npm start`

## Usage examples
- Programmatic (suggestions)
  - import the flow and call with a list of items:
    - `simpleSuggestionsFlow.execute({ items: ['milk', 'eggs', 'bread'] })`

- Genkit / Vertex AI
  - The repo contains an alternative Genkit implementation (commented) — enable and configure Vertex AI credentials if using cloud models.

## Developer notes
- Models and schemas are defined in `src/app/models/grocery.type.ts`
- Local LLM integration and fallback logic live in `src/app/genkit/index.ts`
- Output is validated using zod; ensure responses adhere to the suggestions schema.

## Troubleshooting
- "Ollama service is not running" — start Ollama or switch to a cloud model in `generateSuggestions()`.
- Model not found (404) — run `listAvailableModels()` or adjust the model name in `src/app/genkit/index.ts`.

## Contributing
- Fork, create a branch, add tests, and open a PR. Keep types and zod schemas in sync with any API changes.

## License
- Add your preferred license file (e.g., MIT) at the repo root.

