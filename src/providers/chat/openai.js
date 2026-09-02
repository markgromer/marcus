import OpenAI from 'openai';

export async function chatWithOpenAI({ system, input, model }) {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({ model: model || process.env.OPENAI_MODEL || 'gpt-5', instructions: system, input });
  return response.output_text || '';
}
