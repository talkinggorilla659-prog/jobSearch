export type AIProvider = 'claude' | 'openai';

// Use proxy endpoints to avoid CORS issues
// In dev: Vite proxies to the real APIs
// In prod: Vercel Edge Functions handle the proxy
const ANTHROPIC_ENDPOINT = '/api/anthropic';
const OPENAI_ENDPOINT = '/api/openai';

export async function callAI(
  provider: AIProvider,
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (provider === 'claude') {
    return callClaude(apiKey, prompt, systemPrompt);
  } else {
    return callOpenAI(apiKey, prompt, systemPrompt);
  }
}

async function callClaude(
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await fetch(ANTHROPIC_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-5-20251101',
      max_tokens: 4096,
      system: systemPrompt || 'You are a helpful career assistant.',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();

  if (data.content?.[0]?.type === 'text') {
    return data.content[0].text;
  }
  throw new Error('Unexpected response format from Claude');
}

async function callOpenAI(
  apiKey: string,
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  const response = await fetch(OPENAI_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful career assistant.' },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}

export async function testApiKey(
  provider: AIProvider,
  apiKey: string
): Promise<boolean> {
  try {
    await callAI(provider, apiKey, 'Say "OK" and nothing else.');
    return true;
  } catch {
    return false;
  }
}
