import Anthropic from '@anthropic-ai/sdk';
import { config } from './config/config';
import { ClaudeResponse } from './types/claude-response';
import { buildSystemPrompt } from './prompts/system-prompt';

export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: config.claude.apiKey,
    });
  }

  async processMessage(
    userMessage: string,
    existingCategories: any[] = [],
    userPatterns: any = {},
    conversationContext: string[] = []
  ): Promise<ClaudeResponse> {
    const systemPrompt = buildSystemPrompt(
      existingCategories,
      userPatterns,
      conversationContext
    );

    const fullPrompt = `${systemPrompt}

## ТЕКУЩИЙ ЗАПРОС ПОЛЬЗОВАТЕЛЯ

${userMessage}

Верни ТОЛЬКО валидный JSON без дополнительного текста.`;

    try {
      const response = await this.client.messages.create({
        model: config.claude.model,
        max_tokens: 4096,
        messages: [
          {
            role: 'user',
            content: fullPrompt,
          },
        ],
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new Error('Unexpected response type from Claude');
      }

      const jsonText = this.extractJSON(content.text);
      const claudeResponse: ClaudeResponse = JSON.parse(jsonText);

      return claudeResponse;
    } catch (error) {
      console.error('Error processing message with Claude:', error);
      throw error;
    }
  }

  private extractJSON(text: string): string {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      return jsonMatch[1];
    }

    const bareJsonMatch = text.match(/\{[\s\S]*\}/);
    if (bareJsonMatch) {
      return bareJsonMatch[0];
    }

    return text.trim();
  }
}
