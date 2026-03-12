import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export type AIProvider = 'gemini' | 'groq';

export interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AIGenerationOptions {
  temperature?: number;
  maxTokens?: number;
}

/**
 * Abstract AI provider interface
 */
export interface ILLMProvider {
  generateText(prompt: string, options?: AIGenerationOptions): Promise<string>;
  chat(messages: AIMessage[], systemPrompt?: string, options?: AIGenerationOptions): Promise<string>;
}

/**
 * Gemini provider implementation
 */
class GeminiProvider implements ILLMProvider {
  private genAI: GoogleGenerativeAI;
  private modelName = 'gemini-2.0-flash';

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateText(prompt: string, _options?: AIGenerationOptions): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    return result.response.text();
  }

  async chat(messages: AIMessage[], systemPrompt?: string, _options?: AIGenerationOptions): Promise<string> {
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    const contents = messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const result = await model.generateContent({
      contents: contents as any,
      systemInstruction: systemPrompt,
    });

    return result.response.text();
  }
}

/**
 * Groq provider implementation
 */
class GroqProvider implements ILLMProvider {
  private groq: Groq;
  private modelName = 'llama-3.3-70b-versatile';

  constructor(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  async generateText(prompt: string, _options?: AIGenerationOptions): Promise<string> {
    const response = await (this.groq.chat.completions.create as any)({
      model: this.modelName,
      max_tokens: _options?.maxTokens || 2048,
      temperature: _options?.temperature || 0.7,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from Groq');
    }

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    return content;
  }

  async chat(messages: AIMessage[], systemPrompt?: string, _options?: AIGenerationOptions): Promise<string> {
    const groqMessages: any[] = [];

    // Add system prompt if provided
    if (systemPrompt) {
      groqMessages.push({
        role: 'system',
        content: systemPrompt,
      });
    }

    // Add conversation history
    groqMessages.push(
      ...messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }))
    );

    const response = await (this.groq.chat.completions.create as any)({
      model: this.modelName,
      max_tokens: _options?.maxTokens || 2048,
      temperature: _options?.temperature || 0.7,
      messages: groqMessages,
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error('No response from Groq');
    }

    const content = response.choices[0].message?.content;
    if (!content) {
      throw new Error('No content in Groq response');
    }

    return content;
  }
}

/**
 * AI Provider Factory
 */
export class AIProviderFactory {
  static createProvider(provider: AIProvider = 'gemini'): ILLMProvider {
    switch (provider) {
      case 'gemini':
        const geminiKey = process.env.GEMINI_API_KEY;
        if (!geminiKey) {
          throw new Error('GEMINI_API_KEY environment variable is not set');
        }
        return new GeminiProvider(geminiKey);

      case 'groq':
        const groqKey = process.env.GROQ_API_KEY;
        if (!groqKey) {
          throw new Error('GROQ_API_KEY environment variable is not set');
        }
        return new GroqProvider(groqKey);

      default:
        throw new Error(`Unknown AI provider: ${provider}`);
    }
  }

  static getAvailableProviders(): AIProvider[] {
    const available: AIProvider[] = [];

    if (process.env.GEMINI_API_KEY) {
      available.push('gemini');
    }

    if (process.env.GROQ_API_KEY) {
      available.push('groq');
    }

    return available;
  }

  static getDefaultProvider(): AIProvider {
    // Try Groq first, fallback to Gemini
    if (process.env.GROQ_API_KEY) {
      return 'groq';
    }
    if (process.env.GEMINI_API_KEY) {
      return 'gemini';
    }
    throw new Error('No AI provider configured. Set either GROQ_API_KEY or GEMINI_API_KEY');
  }
}
