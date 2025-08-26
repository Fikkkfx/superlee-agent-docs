import { OpenAI } from "openai";
import { storyClient } from "../config/story";
import fs from "fs";
import path from "path";

export class StoryProtocolAgent {
  private openai: OpenAI;
  private knowledgeBase: string;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    // Load Story Protocol documentation
    this.knowledgeBase = fs.readFileSync(
      path.join(__dirname, "../../docs/combined.md"), 
      "utf-8"
    );
  }

  async answerQuestion(question: string): Promise<string> {
    const prompt = `
You are a Story Protocol expert AI assistant. Use the following documentation to answer questions about IP, licensing, and Story Protocol.

Documentation:
${this.knowledgeBase.substring(0, 8000)} // Truncate for token limits

Question: ${question}

Provide a helpful, accurate answer based on the documentation. If you can suggest practical code examples or next steps, include them.
    `;

    const response = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1000,
    });

    return response.choices[0].message.content || "I couldn't generate a response.";
  }

  async registerIP(metadata: any) {
    try {
      const response = await storyClient.ipAsset.mintAndRegisterIpAssetWithPilTerms({
        spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
        licenseTermsData: [{ terms: metadata.licenseTerms }],
        ipMetadata: metadata.ipMetadata,
      });
      
      return {
        success: true,
        ipId: response.ipId,
        txHash: response.txHash,
        explorerUrl: `https://aeneid.explorer.story.foundation/ipa/${response.ipId}`
      };
    } catch (error) {
  return {
    success: false,
    error: error instanceof Error ? error.message : String(error)
  };
    }
  }
}
