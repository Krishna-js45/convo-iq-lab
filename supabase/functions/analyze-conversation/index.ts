import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcript } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert conversation analyst. Analyze the given conversation transcript between a user and GPT, and provide detailed scores.

Score each aspect from 0-100:

UserIQ (Overall prompt quality):
- Clarity: How clear and well-structured are the user's prompts?
- Depth: How thoughtful and detailed are the questions?
- Creativity: How original and innovative are the prompts?

GPTIQ (Overall response quality):
- Clarity: How clear and understandable are GPT's responses?
- Depth: How comprehensive and detailed are the answers?
- Flow: How well does GPT maintain context and conversation flow?

ConversationIQ (Overall interaction quality):
- Flow: How natural is the conversation progression?
- Synergy: How well do user and GPT complement each other?

Also provide a brief justification (2-3 sentences) explaining the scores.

Return ONLY a valid JSON object with this exact structure:
{
  "user_iq": number,
  "user_clarity": number,
  "user_depth": number,
  "user_creativity": number,
  "gpt_iq": number,
  "gpt_clarity": number,
  "gpt_depth": number,
  "gpt_flow": number,
  "conversation_iq": number,
  "conversation_flow": number,
  "conversation_synergy": number,
  "justification": "string"
}`;

    console.log("Calling Lovable AI for analysis...");
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: transcript }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No response from AI");
    }

    console.log("AI Response:", content);
    
    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Invalid JSON response from AI");
    }
    
    const scores = JSON.parse(jsonMatch[0]);
    
    return new Response(
      JSON.stringify(scores),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error in analyze-conversation:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});