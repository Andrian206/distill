import { useState, useCallback } from 'react';
import { api } from '../api/client';
import { useProjectStore } from '../store/useProjectStore';

/**
 * Custom hook for chat functionality with optimistic updates
 */
export function useChat(projectId) {
  const [error, setError] = useState(null);
  
  const {
    addMessage,
    updateCanvas,
    setLoading,
    setError: setStoreError,
  } = useProjectStore();

  /**
   * Send a message to the AI with optimistic UI updates
   */
  const sendMessage = useCallback(async (text) => {
    if (!text || !text.trim()) {
      setError('Message cannot be empty');
      return;
    }

    if (!projectId) {
      setError('No project selected');
      return;
    }

    // Clear previous errors
    setError(null);
    setStoreError(null);

    // Optimistic update: Add user message immediately
    const userMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toISOString(),
      turn_number: null, // Will be set by server
    };
    addMessage(userMessage);

    // Set loading state
    setLoading('chat', true);

    try {
      // Send message to API
      const response = await api.chat.send(projectId, text.trim());

      // Update canvas with new state
      if (response.canvas) {
        updateCanvas(response.canvas);
      }

      // Add AI response message
      if (response.message) {
        addMessage(response.message);
      }

      return response;
    } catch (err) {
      console.error('Chat error:', err);
      
      const errorMessage = err.message || 'Failed to send message';
      setError(errorMessage);
      setStoreError(errorMessage);

      // Optionally: Remove optimistic user message on error
      // For now, we keep it to show what the user tried to send
      
      throw err;
    } finally {
      setLoading('chat', false);
    }
  }, [projectId, addMessage, updateCanvas, setLoading, setStoreError]);

  /**
   * Load chat history for the project
   */
  const loadHistory = useCallback(async () => {
    if (!projectId) return;

    setLoading('chat', true);
    setError(null);

    try {
      const messages = await api.chat.getHistory(projectId);
      
      // Set messages in store (replaces existing)
      useProjectStore.getState().setMessages(messages);
      
      return messages;
    } catch (err) {
      console.error('Failed to load chat history:', err);
      const errorMessage = err.message || 'Failed to load chat history';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading('chat', false);
    }
  }, [projectId, setLoading]);

  /**
   * Clear chat error
   */
  const clearError = useCallback(() => {
    setError(null);
    setStoreError(null);
  }, [setStoreError]);

  return {
    sendMessage,
    loadHistory,
    error,
    clearError,
    isLoading: useProjectStore(state => state.loading.chat),
  };
}

export default useChat;

// Made with Bob
