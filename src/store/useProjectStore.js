import { create } from 'zustand';

/**
 * Distill Project Store
 * Manages global state for project, canvas, messages, and UI state
 */
export const useProjectStore = create((set, get) => ({
  // Project data
  project: null,
  canvas: null,
  messages: [],
  blueprint: null,
  
  // UI state
  selectedStage: null,
  loading: {
    chat: false,
    blueprint: false,
    project: false,
  },
  error: null,

  // Actions
  
  /**
   * Set current project and its canvas
   */
  setProject: (project) => set({
    project,
    canvas: project?.canvas || null,
    selectedStage: null,
    error: null,
  }),

  /**
   * Update canvas state
   */
  updateCanvas: (canvas) => set({ canvas }),

  /**
   * Add a message to the chat history
   */
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  /**
   * Set all messages (for loading history)
   */
  setMessages: (messages) => set({ messages }),

  /**
   * Select a stage to view in detail panel
   */
  selectStage: (stageName) => set({ selectedStage: stageName }),

  /**
   * Set blueprint data
   */
  setBlueprint: (blueprint) => set({ blueprint }),

  /**
   * Set loading state for specific operation
   */
  setLoading: (operation, isLoading) => set((state) => ({
    loading: {
      ...state.loading,
      [operation]: isLoading,
    },
  })),

  /**
   * Set error state
   */
  setError: (error) => set({ error }),

  /**
   * Clear error state
   */
  clearError: () => set({ error: null }),

  /**
   * Reset store to initial state
   */
  reset: () => set({
    project: null,
    canvas: null,
    messages: [],
    blueprint: null,
    selectedStage: null,
    loading: {
      chat: false,
      blueprint: false,
      project: false,
    },
    error: null,
  }),

  /**
   * Get stage by name from canvas
   */
  getStageByName: (stageName) => {
    const { canvas } = get();
    if (!canvas || !canvas.stages) return null;
    return canvas.stages.find(stage => stage.name === stageName);
  },

  /**
   * Get selected stage data
   */
  getSelectedStage: () => {
    const { selectedStage, canvas } = get();
    if (!selectedStage || !canvas) return null;
    return canvas.stages.find(stage => stage.name === selectedStage);
  },

  /**
   * Check if all stages are complete
   */
  areAllStagesComplete: () => {
    const { canvas } = get();
    if (!canvas || !canvas.stages) return false;
    return canvas.stages.every(
      stage => stage.status === 'complete'
    );
  },

  /**
   * Get canvas completion percentage
   */
  getCompletionPercentage: () => {
    const { canvas } = get();
    if (!canvas || !canvas.stages) return 0;
    
    const completeStages = canvas.stages.filter(
      stage => stage.status === 'complete'
    ).length;
    
    return Math.round((completeStages / canvas.stages.length) * 100);
  },
}));

export default useProjectStore;

// Made with Bob
