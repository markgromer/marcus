import Anthropic from '@anthropic-ai/sdk';

export async function chatWithAnthropic({ system, input, model }) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is not configured.');
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({ model: model || 'claude-sonnet-4-6', max_tokens: 4096, system, messages: [{ role: 'user', content: input }] });
  return response.content.filter((part) => part.type === 'text').map((part) => part.text).join('\n');
}
