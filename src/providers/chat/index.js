import { chatWithOpenAI } from './openai.js';
import { chatWithAnthropic } from './anthropic.js';

export async function runChat({ config, system, input }) {
  const provider = config.chat?.provider || 'openai';
  if (provider === 'anthropic') return chatWithAnthropic({ system, input, model: config.chat?.model });
  if (provider === 'openai') return chatWithOpenAI({ system, input, model: config.chat?.model });
  throw new Error(`Unsupported chat provider: ${provider}`);
}
