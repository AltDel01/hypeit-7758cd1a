const EDITOR_STATE_KEY = 'viralin_editor_state';

export interface UploadedFile {
  name: string;
  url: string;
  type: 'video' | 'audio';
}

export interface EditorState {
  prompt: string;
  selectedFeatures: string[];
  selectedAspectRatio: string;
  selectedResolution: string;
  selectedDuration: string;
  selectedFrames: string;
  startTimestamp: string;
  endTimestamp: string;
  uploadedFiles: UploadedFile[];
  autoSubmit?: boolean;
}

export const saveEditorState = (state: EditorState): void => {
  try {
    localStorage.setItem(EDITOR_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save editor state:', error);
  }
};

export const loadEditorState = (): EditorState | null => {
  try {
    const saved = localStorage.getItem(EDITOR_STATE_KEY);
    if (saved) {
      return JSON.parse(saved) as EditorState;
    }
  } catch (error) {
    console.error('Failed to load editor state:', error);
  }
  return null;
};

export const clearEditorState = (): void => {
  try {
    localStorage.removeItem(EDITOR_STATE_KEY);
  } catch (error) {
    console.error('Failed to clear editor state:', error);
  }
};
