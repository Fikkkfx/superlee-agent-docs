import { OpenAI } from "openai";
import { storyProtocolDocs, searchDocs, quickAnswers } from "../data/storyDocs";
import { isStoryProtocolRelated, cleanPrompt } from "../utils/helpers";

export class StoryProtocolAgent {
  private openai: OpenAI | null = null;

  constructor() {
    // Initialize OpenAI only if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
  }

  async answerQuestion(question: string): Promise<string> {
    try {
      const cleanedQuestion = cleanPrompt(question);
      
      // Check for quick answers first
      const quickAnswer = this.getQuickAnswer(cleanedQuestion);
      if (quickAnswer) {
        return quickAnswer;
      }

      // Search relevant documentation
      const relevantDocs = searchDocs(cleanedQuestion);
      
      // If we have OpenAI API key, use AI with context
      if (this.openai && relevantDocs.length > 0) {
        return await this.getAIResponse(cleanedQuestion, relevantDocs);
      }
      
      // Fallback to documentation-based response
      return this.getDocumentationResponse(cleanedQuestion, relevantDocs);
      
    } catch (error: any) {
      console.error("Error in answerQuestion:", error);
      return "I apologize, but I encountered an error while processing your question. Please try asking again or rephrase your question.";
    }
  }

  private getQuickAnswer(question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    
    for (const [key, answer] of Object.entries(quickAnswers)) {
      if (lowerQuestion.includes(key)) {
        return answer;
      }
    }
    
    return null;
  }

  private async getAIResponse(question: string, relevantDocs: any[]): Promise<string> {
    try {
      const context = relevantDocs
        .slice(0, 3) // Use top 3 most relevant docs
        .map(doc => `**${doc.title}**\n${doc.content}`)
        .join('\n\n');

      const prompt = `You are SuperLee, an AI assistant specialized in Story Protocol. Use the following documentation to answer the user's question accurately and helpfully.

Documentation Context:
${context}

User Question: ${question}

Instructions:
- Answer based on the provided documentation
- Be helpful and conversational
- If the question is not related to Story Protocol, politely redirect to Story Protocol topics
- Include relevant examples or code snippets when appropriate
- Keep responses concise but informative
- If you're not sure about something, say so rather than guessing

Answer:`;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content || "I couldn't generate a response. Please try again.";
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      // Fallback to documentation response if AI fails
      return this.getDocumentationResponse(question, relevantDocs);
    }
  }

  private getDocumentationResponse(question: string, relevantDocs: any[]): string {
    if (relevantDocs.length === 0) {
      if (isStoryProtocolRelated(question)) {
        return "I couldn't find specific information about that topic in my knowledge base. Could you try rephrasing your question or ask about:\n\n• What is Story Protocol?\n• How to register an IP Asset\n• PIL Terms and licensing\n• Royalty system\n• Using the TypeScript SDK\n\nOr check out the official documentation at https://docs.story.foundation";
      } else {
        return "I'm SuperLee, your Story Protocol AI assistant! I specialize in helping with Story Protocol questions like:\n\n• IP Asset registration\n• Licensing and PIL Terms\n• Royalty distribution\n• SDK usage and development\n• Smart contracts and technical details\n\nWhat would you like to know about Story Protocol?";
      }
    }

    // Return the most relevant documentation section
    const topDoc = relevantDocs[0];
    let response = `**${topDoc.title}**\n\n${topDoc.content}`;

    // Add related topics if available
    if (relevantDocs.length > 1) {
      const relatedTopics = relevantDocs
        .slice(1, 3)
        .map(doc => `• ${doc.title}`)
        .join('\n');
      
      response += `\n\n**Related topics you might be interested in:**\n${relatedTopics}`;
    }

    return response;
  }

  // Method for registering IP (if needed for future features)
  async registerIP(metadata: any) {
    try {
      // This would integrate with Story Protocol SDK
      // For now, return a placeholder response
      return {
        success: false,
        error: "IP registration feature is not yet implemented in this documentation agent. Please use the Story Protocol SDK directly or visit the official documentation."
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to register IP Asset"
      };
    }
  }
}