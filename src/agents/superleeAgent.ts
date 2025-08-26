import { OpenAI } from "openai";
import fs from "fs";
import path from "path";
import { searchDocs, quickAnswers } from "../data/storyDocs";
import { isStoryProtocolRelated, cleanPrompt } from "../utils/helpers";

interface ScoredSection {
  section: string;
  score: number;
}

export class StoryProtocolAgent {
  private openai: OpenAI | null = null;
  private knowledgeBase: string = "";

  constructor() {
    // Initialize OpenAI with better error handling
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (apiKey && apiKey.trim()) {
      try {
        this.openai = new OpenAI({
          apiKey: apiKey.trim(),
        });
        console.log("✅ OpenAI initialized with key:", apiKey.substring(0, 10) + "...");
        
        // Test API key dengan simple call
        this.testApiKey();
      } catch (error) {
        console.error("❌ Failed to initialize OpenAI:", error);
        this.openai = null;
      }
    } else {
      console.warn("⚠️ OPENAI_API_KEY not found or empty");
    }

    // Load knowledge base
    this.loadKnowledgeBase();
  }

  // Test API key method
  private async testApiKey() {
    if (!this.openai) return;
    
    try {
      const models = await this.openai.models.list();
      console.log("✅ API key valid, available models:", models.data.length);
    } catch (error: any) {
      console.error("❌ API key test failed:", error.message);
      if (error.code === 'invalid_api_key') {
        console.error("❌ Invalid API key - please check your OPENAI_API_KEY");
      }
      if (error.code === 'insufficient_quota') {
        console.error("❌ Insufficient quota - please add credits to your OpenAI account");
      }
    }
  }

  private loadKnowledgeBase() {
    try {
      const docsPath = path.join(process.cwd(), "docs", "combined.md");
      if (fs.existsSync(docsPath)) {
        this.knowledgeBase = fs.readFileSync(docsPath, "utf-8");
        console.log("✅ Loaded combined.md knowledge base");
      } else {
        console.warn("⚠️ combined.md not found, using structured documentation");
        this.knowledgeBase = this.createFallbackKnowledgeBase();
      }
    } catch (error) {
      console.error("❌ Error loading knowledge base:", error);
      this.knowledgeBase = this.createFallbackKnowledgeBase();
    }
  }

  private createFallbackKnowledgeBase(): string {
    const docs = searchDocs("");
    return docs.map(doc => `# ${doc.title}\n\n${doc.content}\n\n`).join("");
  }

  async answerQuestion(question: string): Promise<string> {
    try {
      const cleanedQuestion = cleanPrompt(question);
      console.log("🤔 Processing question:", cleanedQuestion);
      console.log("🔑 OpenAI available:", !!this.openai);
      console.log("📚 Knowledge base length:", this.knowledgeBase.length);

      // Check if question is Story Protocol related
      if (!isStoryProtocolRelated(cleanedQuestion)) {
        return this.getOffTopicResponse();
      }

      // Check for quick answers first
      const quickAnswer = this.getQuickAnswer(cleanedQuestion);
      if (quickAnswer) {
        console.log("⚡ Using quick answer");
        return quickAnswer;
      }

      // Try OpenAI first if available
      if (this.openai) {
        console.log("🤖 Attempting OpenAI with knowledge base");
        try {
          const aiResponse = await this.getAIResponseWithContext(cleanedQuestion);
          console.log("✅ OpenAI response successful");
          return aiResponse;
        } catch (error: any) {
          console.error("❌ OpenAI failed, falling back to documentation:", error.message);
          // Continue to documentation fallback
        }
      } else {
        console.log("⚠️ OpenAI not available, using documentation");
      }
      
      // Fallback to documentation-based response
      console.log("📚 Using documentation fallback");
      return this.getDocumentationResponse(cleanedQuestion);
      
    } catch (error: any) {
      console.error("❌ Error in answerQuestion:", error);
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
    // Fix: Add null check for this.openai
    if (!this.openai) {
      throw new Error("OpenAI not initialized");
    }

    // Extract relevant context from knowledge base
    const relevantContext = this.extractRelevantContext(question);
    
    const systemPrompt = `You are SuperLee, an expert AI assistant specialized in Story Protocol - the world's IP blockchain. You help users understand intellectual property management, licensing, and blockchain technology.

CRITICAL INSTRUCTIONS:
- Answer ONLY based on the provided Story Protocol documentation
- Be accurate, helpful, and conversational
- If information isn't in the documentation, clearly state that
- Provide practical examples and code snippets when relevant
- Use markdown formatting for better readability
- Keep responses comprehensive but concise
- Always stay focused on Story Protocol topics

STORY PROTOCOL KNOWLEDGE BASE:
${relevantContext}

Remember: You are an expert on Story Protocol. Provide accurate, helpful answers based solely on the documentation provided above.`;

    const userPrompt = `User Question: ${question}

Please provide a comprehensive and accurate answer based on the Story Protocol documentation. Include relevant examples, code snippets, or step-by-step instructions when helpful.`;

    console.log("🔄 Calling OpenAI API...");
    
    // Fix: Now TypeScript knows this.openai is not null
    const response = await this.openai.chat.completions.create({
      model: "gpt-4o", // Using gpt-4o since it's available in your account
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      max_tokens: 2000,
      temperature: 0.2,
      presence_penalty: 0.1,
      frequency_penalty: 0.1,
    });

    const aiResponse = response.choices[0].message.content;
    
    if (!aiResponse) {
      throw new Error("Empty response from OpenAI");
    }

    return aiResponse;
  }

  private extractRelevantContext(question: string): string {
    const lowerQuestion = question.toLowerCase();
    const keywords = this.extractKeywords(lowerQuestion);
    
    // Split knowledge base into sections
    const sections = this.knowledgeBase.split(/\n(?=#)/);
    const relevantSections: ScoredSection[] = [];
    
    for (const section of sections) {
      const sectionLower = section.toLowerCase();
      
      // Check if section contains relevant keywords
      const relevanceScore = keywords.reduce((score, keyword) => {
        const occurrences = (sectionLower.match(new RegExp(keyword, 'g')) || []).length;
        return score + occurrences;
      }, 0);
      
      if (relevanceScore > 0) {
        relevantSections.push({ section, score: relevanceScore });
      }
    }
    
    // Sort by relevance and take top sections
    const sortedSections = relevantSections
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map(item => item.section);
    
    // If no specific sections found, return first part of knowledge base
    if (sortedSections.length === 0) {
      return this.knowledgeBase.substring(0, 8000);
    }
    
    // Combine relevant sections, but limit total length
    const combined = sortedSections.join('\n\n');
    return combined.length > 10000 ? combined.substring(0, 10000) + '\n\n...' : combined;
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

**🔹 Core Concepts**
• What is Story Protocol?
• IP Asset Registration  
• PIL Terms and Licensing
• Royalty Distribution System

**🔹 Development**
• TypeScript SDK Usage
• Smart Contract Integration
• API Reference

**🔹 Practical Guides**
• How to register an IP Asset
• Setting up licensing terms
• Managing derivatives and royalties

Could you try rephrasing your question or ask about one of these specific topics?`;
    }

    // Return more dynamic responses based on the question
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

🔹 **IP Asset Registration** - How to register your intellectual property on-chain
🔹 **Licensing & PIL Terms** - Understanding programmable licensing frameworks  
🔹 **Royalty Distribution** - How creators earn from derivative works
🔹 **SDK Development** - Using the TypeScript SDK for integration
🔹 **Smart Contracts** - Technical implementation and deployment details

What would you like to know about Story Protocol?`;
  }
}