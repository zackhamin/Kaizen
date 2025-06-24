import { supabase } from '@/lib/supabase';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  title: string;
  mood_before?: number;
  mood_after?: number;
  session_type: string;
  created_at: string;
}

interface OpenAIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
      role: string;
    };
  }>;
}

// CBT-focused system prompt
const CBT_SYSTEM_PROMPT = `You are a compassionate and skilled CBT (Cognitive Behavioral Therapy) assistant. Your role is to:

1. Listen actively and validate the user's feelings
2. Help identify thought patterns and cognitive distortions
3. Guide users through CBT techniques like thought challenging, behavioral experiments, and mindfulness
4. Ask thoughtful, open-ended questions to promote self-reflection
5. Provide practical coping strategies and tools
6. Maintain appropriate boundaries - you're a therapeutic tool, not a replacement for professional therapy

Guidelines:
- Be warm, non-judgmental, and supportive
- Use CBT language and techniques naturally
- Ask one question at a time to avoid overwhelming
- Validate emotions while gently challenging unhelpful thoughts
- Suggest specific CBT exercises when appropriate
- Always remind users to seek professional help for serious mental health concerns

Keep responses conversational, empathetic, and focused on the user's immediate needs.`;

export const cbtService = {
  // Create new conversation
  async startConversation(sessionType: string = 'general', moodBefore?: number): Promise<Conversation> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const title = `${sessionType} session - ${new Date().toLocaleDateString()}`;

    const { data, error } = await supabase.rpc('create_conversation', {
      p_user_id: user.id,
      p_title: title,
      p_session_type: sessionType,
      p_mood_before: moodBefore
    });

    if (error) throw error;
    return data;
  },

  // Get conversation history
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_conversation_messages', {
      p_conversation_id: conversationId,
      p_user_id: user.id
    });

    if (error) throw error;
    return data || [];
  },

  // Send message and get AI response
  async sendMessage(conversationId: string, userMessage: string): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    try {
      // Save user message first
      await this.saveMessage(conversationId, 'user', userMessage);

      // Get conversation history for context
      const messages = await this.getConversationMessages(conversationId);
      
      // Prepare messages for OpenAI (exclude system messages from history)
      const openAIMessages: OpenAIMessage[] = [
        { role: 'system', content: CBT_SYSTEM_PROMPT },
        ...messages
          .filter(msg => msg.role !== 'system')
          .slice(-10) // Keep last 10 messages for context
          .map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          }))
      ];

      // Get AI response
      const aiResponse = await this.getOpenAIResponse(openAIMessages);
      
      // Save AI response
      await this.saveMessage(conversationId, 'assistant', aiResponse);

      // Return the AI response for streaming
      return aiResponse;

    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw new Error('Failed to send message. Please try again.');
    }
  },

  // Get OpenAI response
  async getOpenAIResponse(messages: OpenAIMessage[]): Promise<string> {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // More cost-effective model
          messages,
          max_tokens: 500,
          temperature: 0.7,
          presence_penalty: 0.1,
          frequency_penalty: 0.1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('OpenAI API Error:', response.status, errorData);
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data: OpenAIResponse = await response.json();
      
      if (!data.choices || data.choices.length === 0) {
        throw new Error('No response from OpenAI');
      }

      return data.choices[0].message.content.trim();
      
    } catch (error) {
      console.error('OpenAI API Error:', error);
      
      // Fallback to supportive response if OpenAI fails
      return "I'm sorry, I'm having trouble connecting right now. How are you feeling, and what would be most helpful to talk about?";
    }
  },

  // Save individual message
  async saveMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('save_message', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_role: role,
      p_content: content
    });

    if (error) throw error;
  },

  // Get user's conversation history
  async getUserConversations(): Promise<Conversation[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase.rpc('get_user_conversations', {
      p_user_id: user.id
    });

    if (error) throw error;
    return data || [];
  },

  // End conversation with mood rating
  async endConversation(conversationId: string, moodAfter: number): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { error } = await supabase.rpc('update_conversation_mood', {
      p_conversation_id: conversationId,
      p_user_id: user.id,
      p_mood_after: moodAfter
    });

    if (error) throw error;
  },
};