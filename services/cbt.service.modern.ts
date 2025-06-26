import { supabase } from '@/lib/supabase';

// Types
export interface CBTMessage {
  id: string;
  user_id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
  updated_at: string;
  metadata?: {
    isTemporary?: boolean;
    isLoading?: boolean;
  };
}

export interface CBTConversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

// Modern functional service using RPC functions
export const cbtService = {
  // Get all CBT conversations for current user
  async getConversations(): Promise<CBTConversation[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_user_conversations', {
        p_user_id: user.id
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('CBTService.getConversations:', error);
      throw error;
    }
  },

  // Create a new CBT conversation
  async createConversation(title: string): Promise<CBTConversation> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('create_conversation', {
        p_user_id: user.id,
        p_title: title.trim()
      });

      if (error) throw error;
      
      // Handle case where RPC returns an array instead of single object
      const conversation = Array.isArray(data) ? data[0] : data;
      return conversation;
    } catch (error) {
      console.error('CBTService.createConversation:', error);
      throw error;
    }
  },

  // Get messages for a specific conversation
  async getConversationMessages(conversationId: string): Promise<CBTMessage[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Try different possible function names
      let data, error;
      
      // First try the original function name
      const result1 = await supabase.rpc('get_conversation_messages', {
        p_user_id: user.id,
        p_conversation_id: conversationId
      });
      
      if (!result1.error) {
        data = result1.data;
        error = result1.error;
      } else {
        // Try alternative function name
        const result2 = await supabase.rpc('get_messages', {
          p_user_id: user.id,
          p_conversation_id: conversationId
        });
        data = result2.data;
        error = result2.error;
      }

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('CBTService.getConversationMessages:', error);
      throw error;
    }
  },

  // Add a message to a conversation
  async addMessage(
    conversationId: string, 
    content: string, 
    role: 'user' | 'assistant' = 'user'
  ): Promise<CBTMessage> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      // Try different possible function names
      let data, error;
      
      // First try the suggested function name
      const result1 = await supabase.rpc('save_message', {
        p_user_id: user.id,
        p_conversation_id: conversationId,
        p_content: content.trim(),
        p_role: role
      });
      
      if (!result1.error) {
        data = result1.data;
        error = result1.error;
      } else {
        // Try alternative function name
        const result2 = await supabase.rpc('create_conversation_message', {
          p_user_id: user.id,
          p_conversation_id: conversationId,
          p_content: content.trim(),
          p_role: role
        });
        data = result2.data;
        error = result2.error;
      }

      if (error) throw error;
      
      // Handle case where RPC returns an array instead of single object
      const message = Array.isArray(data) ? data[0] : data;
      return message;
    } catch (error) {
      console.error('CBTService.addMessage:', error);
      throw error;
    }
  },

  // Get AI response using ChatGPT
  async getAIResponse(conversationId: string, userMessage: string): Promise<string> {
    try {
      // Get conversation history for context
      const messages = await this.getConversationMessages(conversationId);
      
      // Prepare messages for ChatGPT API
      const chatMessages = [
        {
          role: 'system',
          content: `You are a compassionate Cognitive Behavioral Therapy (CBT) therapist. Your role is to help users identify and challenge negative thought patterns, develop coping strategies, and work towards positive behavioral changes.

Key principles to follow:
- Use Socratic questioning to help users explore their thoughts
- Help identify cognitive distortions (all-or-nothing thinking, catastrophizing, etc.)
- Guide users to reframe negative thoughts into more balanced perspectives
- Encourage behavioral activation and small, achievable goals
- Maintain a warm, supportive, and non-judgmental tone
- Focus on the present and practical solutions
- Validate emotions while gently challenging unhelpful thinking patterns
- Keep responses concise but meaningful (2-3 sentences)
- Ask follow-up questions to deepen understanding
- Avoid giving direct advice; instead, guide users to discover their own insights

Remember: You're here to support and guide, not to diagnose or replace professional therapy. If someone is in crisis, encourage them to seek immediate professional help.`
        },
        ...messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ];
      
      // Call ChatGPT API
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: chatMessages,
          max_tokens: 300,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I\'m having trouble responding right now. Please try again.';
      
      return aiResponse;
    } catch (error) {
      console.error('CBTService.getAIResponse:', error);
      
      // If ChatGPT fails, provide a fallback response
      const fallbackResponse = "I understand you're going through something difficult. Could you tell me more about what's on your mind? I'm here to listen and help you work through this.";
      
      return fallbackResponse;
    }
  },

  // Send a message and get AI response
  async sendMessage(conversationId: string, content: string): Promise<CBTMessage> {
    try {
      // Add user message
      await this.addMessage(conversationId, content, 'user');
      
      // Get AI response
      const response = await this.getAIResponse(conversationId, content);
      
      // Save AI response
      const aiMessage = await this.addMessage(conversationId, response, 'assistant');
      
      return aiMessage;
    } catch (error) {
      console.error('CBTService.sendMessage:', error);
      throw error;
    }
  },

  // Delete a conversation and all its messages
  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('delete_conversation', {
        p_user_id: user.id,
        p_conversation_id: conversationId
      });

      if (error) throw error;
    } catch (error) {
      console.error('CBTService.deleteConversation:', error);
      throw error;
    }
  },

  // Update conversation title
  async updateConversationTitle(
    conversationId: string, 
    title: string
  ): Promise<CBTConversation> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('update_conversation', {
        p_user_id: user.id,
        p_conversation_id: conversationId,
        p_title: title.trim()
      });

      if (error) throw error;
      
      // Handle case where RPC returns an array instead of single object
      const conversation = Array.isArray(data) ? data[0] : data;
      return conversation;
    } catch (error) {
      console.error('CBTService.updateConversationTitle:', error);
      throw error;
    }
  },

  // Get conversation by ID
  async getConversation(conversationId: string): Promise<CBTConversation> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('User not authenticated');

      const { data, error } = await supabase.rpc('get_conversation', {
        p_user_id: user.id,
        p_conversation_id: conversationId
      });

      if (error) throw error;
      
      // Handle case where RPC returns an array instead of single object
      const conversation = Array.isArray(data) ? data[0] : data;
      return conversation;
    } catch (error) {
      console.error('CBTService.getConversation:', error);
      throw error;
    }
  }
}; 