import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const systemPrompt = "Use your own system prompt here"; // Replace with your system prompt

export async function POST(req) {
  const openai = new OpenAI() // Initialize OpenAI client
  const data = await req.json(); // Parse the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{ role: 'system', content: systemPrompt }, ...data],
    model: 'gpt-4o', // Specify the model to use
    stream: true, // Enable streaming responses
  });

  // Create a stream to handle the response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      try {
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            const text = encoder.encode(content);
            controller.enqueue(text);
          }
        }
      } catch (err) {
        controller.error(err);
      } finally {
        controller.close();
      }
    },
  });

  return new NextResponse(stream);
}
