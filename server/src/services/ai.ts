import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key'
});

export async function generateAIResponse(userMessage: string, conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []): Promise<string> {
  // If no API key, return mock response
  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'demo-key') {
    return generateMockResponse(userMessage);
  }

  try {
    const messages = [
      {
        role: 'system' as const,
        content: `You are a helpful crypto wallet assistant. You help users with:
- Portfolio management and analysis
- Cryptocurrency trading advice
- DeFi protocols and staking
- Market insights and trends
- Security best practices
- Transaction guidance

Keep responses concise, helpful, and focused on crypto/blockchain topics. Always prioritize security and risk management.`
      },
      ...conversationHistory.slice(-10), // Keep last 10 messages for context
      { role: 'user' as const, content: userMessage }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
      temperature: 0.7
    });

    return completion.choices[0]?.message?.content || generateMockResponse(userMessage);
  } catch (error) {
    console.error('OpenAI API error:', error);
    return generateMockResponse(userMessage);
  }
}

function generateMockResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  if (message.includes('price') || message.includes('market')) {
    return "I can help you track prices and market trends. Current market conditions show mixed signals - consider diversifying your portfolio and setting stop-losses for risk management.";
  }
  
  if (message.includes('swap') || message.includes('trade')) {
    return "For swapping tokens, always check slippage tolerance and gas fees. I recommend using reputable DEXs like Uniswap or 1inch for better rates. Would you like me to explain how to optimize your trades?";
  }
  
  if (message.includes('stake') || message.includes('staking')) {
    return "Staking can provide passive income, but consider the lock-up periods and validator risks. Popular options include ETH 2.0 staking, Polygon, and various DeFi protocols. What tokens are you looking to stake?";
  }
  
  if (message.includes('security') || message.includes('safe')) {
    return "Security is crucial in crypto. Use hardware wallets for large amounts, enable 2FA, never share your seed phrase, and be cautious of phishing attempts. Always verify contract addresses before interacting.";
  }
  
  if (message.includes('portfolio') || message.includes('balance')) {
    return "For portfolio management, consider diversification across different sectors (DeFi, Layer 1s, etc.), regular rebalancing, and setting clear investment goals. Would you like me to analyze your current holdings?";
  }
  
  return "I'm here to help with your crypto journey! I can assist with portfolio analysis, trading strategies, DeFi protocols, security best practices, and market insights. What would you like to know?";
}