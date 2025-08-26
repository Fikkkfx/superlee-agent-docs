import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { searchDocs, quickAnswers } from "../data/storyDocs";
import { isStoryProtocolRelated, cleanPrompt } from "../utils/helpers";

export class StoryProtocolAgent {
  private openai: OpenAI | null = null;
  private knowledgeBase: string = "";

  constructor() {
    // Initialize OpenAI
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Load combined.md knowledge base
    this.loadKnowledgeBase();
  }

  private loadKnowledgeBase() {
    try {
      const docsPath = path.join(process.cwd(), "docs", "combined.md");
      if (fs.existsSync(docsPath)) {
        this.knowledgeBase = fs.readFileSync(docsPath, "utf-8");
        console.log("✅ Loaded combined.md knowledge base");
      } else {
        console.warn("⚠️ combined.md not found, using fallback documentation");
        // Fallback to structured docs if combined.md doesn't exist
        this.knowledgeBase = this.createFallbackKnowledgeBase();
      }
    } catch (error) {
      console.error("❌ Error loading knowledge base:", error);
      this.knowledgeBase = this.createFallbackKnowledgeBase();
    }
  }

  private createFallbackKnowledgeBase(): string {
    // Create knowledge base from structured docs as fallback
    const docs = searchDocs(""); // Get all docs
    return docs.map(doc => `# ${doc.title}\n\n${doc.content}\n\n`).join("");
  }

  async answerQuestion(question: string): Promise<string> {
    try {
      const cleanedQuestion = cleanPrompt(question);
      
      // Check if question is Story Protocol related
      if (!isStoryProtocolRelated(cleanedQuestion)) {
        return this.getOffTopicResponse();
      }

      // Check for quick answers first
      const quickAnswer = this.getQuickAnswer(cleanedQuestion);
      if (quickAnswer) {
        return quickAnswer;
      }

      // Use OpenAI with knowledge base context
      if (this.openai && this.knowledgeBase) {
        return await this.getAIResponseWithContext(cleanedQuestion);
      }
      
      // Fallback to documentation-based response
      return this.getDocumentationResponse(cleanedQuestion);
      
    } catch (error: any) {
      console.error("Error in answerQuestion:", error);
      return "I apologize, but I encountered an error while processing your question. Please try asking again or rephrase your question.";
    }
  }

  private getQuickAnswer(question: string): string | null {
    const lowerQuestion = question.toLowerCase();
    
    for (const [key, answer] of Object.entries(quickAnswers)) {
      if (lowerQuestion.includes(key)) {
        return `${answer}\n\nWould you like me to explain any specific aspect in more detail?`;
      }
    }
    
    return null;
  }

  private async getAIResponseWithContext(question: string): Promise<string> {
    try {
      // Extract relevant context from knowledge base
      const relevantContext = this.extractRelevantContext(question);
      
      const systemPrompt = `You are SuperLee, an expert AI assistant specialized in Story Protocol. You help users understand intellectual property management, licensing, and blockchain technology.

IMPORTANT GUIDELINES:
- Answer based ONLY on the provided Story Protocol documentation
- Be helpful, accurate, and conversational
- If information isn't in the documentation, say so clearly
- Provide practical examples when possible
- Keep responses concise but comprehensive
- Use markdown formatting for better readability

KNOWLEDGE BASE:
${relevantContext}`;

      const userPrompt = `Question: ${question}

Please provide a helpful and accurate answer based on the Story Protocol documentation provided above.`;

      const response = await this.openai!.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500,
        temperature: 0.3, // Lower temperature for more consistent answers
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      });

      const aiResponse = response.choices[0].message.content;
      
      if (!aiResponse) {
        throw new Error("Empty response from OpenAI");
      }

      return aiResponse;
    } catch (error: any) {
      console.error("OpenAI API error:", error);
      
      // Provide specific error messages
      if (error.code === 'insufficient_quota') {
        return "I'm currently experiencing API quota limitations. Let me provide an answer based on my knowledge base:\n\n" + this.getDocumentationResponse(question);
      }
      
      if (error.code === 'invalid_api_key') {
        return "There's an API configuration issue. Let me provide an answer based on my knowledge base:\n\n" + this.getDocumentationResponse(question);
      }
      
      // Fallback to documentation response
      return this.getDocumentationResponse(question);
    }
  }

  private extractRelevantContext(question: string): string {
    const lowerQuestion = question.toLowerCase();
    const lines = this.knowledgeBase.split('\n');
    const relevantSections: string[] = [];
    let currentSection = '';
    let isRelevant = false;
    
    // Keywords to look for
    const keywords = this.extractKeywords(lowerQuestion);
    
    for (const line of lines) {
      // Check if this is a header
      if (line.startsWith('#')) {
        // Save previous section if it was relevant
        if (isRelevant && currentSection.trim()) {
          relevantSections.push(currentSection.trim());
        }
        
        // Start new section
        currentSection = line + '\n';
        isRelevant = keywords.some(keyword => 
          line.toLowerCase().includes(keyword)
        );
      } else {
        currentSection += line + '\n';
        
        // Check if current line contains relevant keywords
        if (!isRelevant) {
          isRelevant = keywords.some(keyword => 
            line.toLowerCase().includes(keyword)
          );
        }
      }
    }
    
    // Add last section if relevant
    if (isRelevant && currentSection.trim()) {
      relevantSections.push(currentSection.trim());
    }
    
    // If no specific sections found, return first part of knowledge base
    if (relevantSections.length === 0) {
      return this.knowledgeBase.substring(0, 4000);
    }
    
    // Combine relevant sections, but limit total length
    const combined = relevantSections.join('\n\n');
    return combined.length > 6000 ? combined.substring(0, 6000) + '\n\n...' : combined;
  }

  private extractKeywords(question: string): string[] {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'how', 'what', 'when', 'where', 'why', 'who'];
    
    return question
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word))
      .slice(0, 10);
  }

  private getDocumentationResponse(question: string): string {
    const relevantDocs = searchDocs(question);
    
    if (relevantDocs.length === 0) {
      return `I couldn't find specific information about "${question}" in my knowledge base. 

Here are some topics I can help you with:
• **What is Story Protocol?** - Overview and core concepts
• **IP Asset Registration** - How to register intellectual property
• **PIL Terms** - Programmable IP Licensing explained
• **Royalty System** - How creators earn from derivatives
• **TypeScript SDK** - Development tools and integration
• **Smart Contracts** - Technical implementation details

Could you try rephrasing your question or ask about one of these topics?`;
    }

    // Return the most relevant documentation
    const topDoc = relevantDocs[0];
    let response = `## ${topDoc.title}\n\n${topDoc.content}`;

    // Add related topics if available
    if (relevantDocs.length > 1) {
      const relatedTopics = relevantDocs
        .slice(1, 3)
        .map(doc => `• **${doc.title}**`)
        .join('\n');
      
      response += `\n\n**Related topics:**\n${relatedTopics}`;
    }

    response += `\n\n*Need more specific information? Feel free to ask follow-up questions!*`;

    return response;
  }

  private getOffTopicResponse(): string {
    return `Hi! I'm SuperLee, your Story Protocol AI assistant. I specialize in helping with Story Protocol topics like:

🔹 **IP Asset Registration** - How to register your intellectual property
🔹 **Licensing & PIL Terms** - Understanding programmable licensing
🔹 **Royalty Distribution** - How creators earn from derivatives  
🔹 **SDK Development** - Using the TypeScript SDK
🔹 **Smart Contracts** - Technical implementation details

What would you like to know about Story Protocol?`;
  }
}