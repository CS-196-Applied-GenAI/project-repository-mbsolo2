import { create } from 'zustand';

import { feedStore } from './feedStore';

interface UIState {
  undoPassRecipeId: string | undefined;
  undoVisible: boolean;
  passReasonVisible: boolean;
  passReasonRecipeId: string | undefined;
  showUndo: (recipeId: string) => void;
  dismissUndo: () => void;
  undo: () => void;
  showPassReasonModal: (recipeId: string) => void;
  dismissPassReasonModal: () => void;
}

export const uiStore = create<UIState>((set, get) => ({
  undoPassRecipeId: undefined,
  undoVisible: false,
  passReasonVisible: false,
  passReasonRecipeId: undefined,
  showUndo: (recipeId) => set({ undoPassRecipeId: recipeId, undoVisible: true }),
  dismissUndo: () => set({ undoVisible: false, undoPassRecipeId: undefined }),
  undo: () => {
    const { undoPassRecipeId } = get();
    if (undoPassRecipeId) {
      feedStore.getState().undoPass(undoPassRecipeId);
    }
    get().dismissUndo();
  },
  showPassReasonModal: (recipeId) =>
    set({ passReasonVisible: true, passReasonRecipeId: recipeId }),
  dismissPassReasonModal: () =>
    set({ passReasonVisible: false, passReasonRecipeId: undefined }),
}));
