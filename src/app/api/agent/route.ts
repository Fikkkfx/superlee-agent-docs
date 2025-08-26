import { NextRequest, NextResponse } from "next/server";
import { StoryProtocolAgent } from "../../../agents/superleeAgent"; // ← Pastikan path ini benar

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 API endpoint called"); // ← Tambahkan log ini
    
    const { message } = await request.json();
    console.log("📝 Received message:", message); // ← Tambahkan log ini

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    console.log("🤖 Initializing StoryProtocolAgent..."); // ← Tambahkan log ini
    
    // Initialize the Story Protocol Agent
    const agent = new StoryProtocolAgent();

    console.log("🔄 Calling agent.answerQuestion..."); // ← Tambahkan log ini
    
    // Get response from the agent
    const response = await agent.answerQuestion(message.trim());

    console.log("✅ Agent response received:", response.substring(0, 100) + "..."); // ← Tambahkan log ini

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error: any) {
    console.error("❌ API endpoint error:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to process your question", 
        details: error.message || "Unknown error occurred",
        success: false
      },
      { status: 500 }
    );
  }
}