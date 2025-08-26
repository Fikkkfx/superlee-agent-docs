import { NextRequest, NextResponse } from "next/server";
import { StoryProtocolAgent } from "../../../agents/superleeAgent";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    // Initialize the Story Protocol Agent
    const agent = new StoryProtocolAgent();

    // Get response from the agent
    const response = await agent.answerQuestion(message.trim());

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
      success: true
    });
  } catch (error: any) {
    console.error("Agent API error:", error);
    
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

export async function GET() {
  return NextResponse.json({
    status: "SuperLee AI Agent API is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
}