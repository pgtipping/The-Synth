export async function callAI(
  operation: 'research' | 'factCheck',
  content: string,
  context: string = ''
) {
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        operation,
        content,
        context,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'AI request failed');
    }

    return response.json();
  } catch (error) {
    console.error('AI request failed:', error);
    throw error;
  }
}
