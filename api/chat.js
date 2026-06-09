export default async function handler(req, res) {
  // Tillad kun POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages, systemPrompt, maxTokens } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array er påkrævet' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: maxTokens || 1024,
        system: systemPrompt || '',
        messages: messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Anthropic API fejl:', data);
      return res.status(response.status).json({
        error: data.error?.message || 'API fejl',
      });
    }

    return res.status(200).json({
      content: data.content[0].text,
    });
  } catch (error) {
    console.error('Server fejl:', error);
    return res.status(500).json({ error: 'Intern serverfejl' });
  }
}
