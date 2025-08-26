import { StoryProtocolAgent } from "./agents/superleeAgent";
import readline from "readline";

async function main() {
  const agent = new StoryProtocolAgent();
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🤖 Superlee AI Agent");
  console.log("Ask me anything about IP, licensing, and Story Protocol!");
  console.log("Type 'exit' to quit.\n");

  const askQuestion = () => {
    rl.question("You: ", async (question) => {
      if (question.toLowerCase() === "exit") {
        rl.close();
        return;
      }

      console.log("🤔 Thinking...");
      
      try {
        const answer = await agent.answerQuestion(question);
        console.log(`\n🤖 Agent: ${answer}\n`);
      } catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  console.log(`\n❌ Error: ${errorMessage}\n`);
}

      askQuestion();
    });
  };

  askQuestion();
}

main().catch(console.error);