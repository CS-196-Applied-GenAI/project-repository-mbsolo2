import React from 'react';

import { ScreenContainer } from '../components';
import { AddRecipeModal } from '../modals/AddRecipeModal';

/**
 * Add Recipe tab screen. Renders the same form as AddRecipeModal in a full-screen context.
 * CookbookScreen still opens AddRecipeModal for "+ Add Recipe" from My Cookbook.
 */
export default function AddRecipeScreen() {
  return (
    <ScreenContainer>
      <AddRecipeModal
        visible
        asScreen
        onClose={() => {}}
        onAdded={() => {}}
      />
    </ScreenContainer>
  );
}
