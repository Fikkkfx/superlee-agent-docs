import { NextRequest, NextResponse } from "next/server";
import { StoryProtocolAgent } from "../../../agents/superleeAgent";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Initialize the Story Protocol Agent
    const agent = new StoryProtocolAgent();

    // Get response from the agent
    const response = await agent.answerQuestion(message);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}