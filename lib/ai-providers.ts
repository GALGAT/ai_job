export interface AIProvider {
  id: string;
  name: string;
  description: string;
  apiKeyUrl: string;
  icon: string;
}

export const AI_PROVIDERS: AIProvider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    description: 'GPT-4 and advanced language models',
    apiKeyUrl: 'https://platform.openai.com/api-keys',
    icon: '🤖'
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    description: 'Competitive AI with strong reasoning',
    apiKeyUrl: 'https://platform.deepseek.com/api_keys',
    icon: '🧠'
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    description: 'Google\'s multimodal AI platform',
    apiKeyUrl: 'https://makersuite.google.com/app/apikey',
    icon: '💎'
  },
  {
    id: 'copilot',
    name: 'Microsoft Copilot',
    description: 'Microsoft\'s AI assistant',
    apiKeyUrl: 'https://developer.microsoft.com/en-us/microsoft-365/dev-program',
    icon: '🚀'
  }
];

export async function callAI(provider: string, apiKey: string, prompt: string, context?: any) {
  try {
    switch (provider) {
      case 'openai':
        return await callOpenAI(apiKey, prompt, context);
      case 'deepseek':
        return await callDeepSeek(apiKey, prompt, context);
      case 'gemini':
        return await callGemini(apiKey, prompt, context);
      case 'copilot':
        return await callCopilot(apiKey, prompt, context);
      default:
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  } catch (error) {
    console.error(`AI call failed for ${provider}:`, error);
    throw error;
  }
}

async function callOpenAI(apiKey: string, prompt: string, context?: any) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: context || 'You are a helpful AI assistant for job applications.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callDeepSeek(apiKey: string, prompt: string, context?: any) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: context || 'You are a helpful AI assistant for job applications.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGemini(apiKey: string, prompt: string, context?: any) {
  const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: fullPrompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2000
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.candidates[0].content.parts[0].text;
}

async function callCopilot(apiKey: string, prompt: string, context?: any) {
  // Note: Microsoft Copilot API implementation would go here
  // This is a placeholder as the exact API endpoint may vary
  throw new Error('Microsoft Copilot API integration not yet implemented');
}