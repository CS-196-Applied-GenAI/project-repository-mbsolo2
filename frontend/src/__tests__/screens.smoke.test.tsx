import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import AddRecipeScreen from '../screens/AddRecipeScreen';
import CookbookScreen from '../screens/CookbookScreen';
import FeedScreen from '../screens/FeedScreen';
import InventoryScreen from '../screens/InventoryScreen';
import ProfileScreen from '../screens/ProfileScreen';

jest.mock('../api/mealplanApi', () => ({
  generateMealplan: jest.fn().mockResolvedValue([]),
}));

jest.mock('../api/inventoryApi', () => ({
  getInventory: jest.fn().mockResolvedValue([]),
  addInventory: jest.fn(),
  deleteInventory: jest.fn(),
}));

describe('screens smoke', () => {
  it('FeedScreen renders', () => {
    const { root } = render(<FeedScreen />);
    expect(root).toBeTruthy();
  });

  it('InventoryScreen renders with title Kitchen Inventory', () => {
    render(
      <NavigationContainer>
        <InventoryScreen />
      </NavigationContainer>
    );
    expect(screen.getByText('Kitchen Inventory')).toBeTruthy();
  });

  it('CookbookScreen renders with title My Cookbook', async () => {
    render(<CookbookScreen />);
    expect(await screen.findByText('My Cookbook')).toBeTruthy();
  });

  it('AddRecipeScreen renders with title Add Recipe', () => {
    render(<AddRecipeScreen />);
    expect(screen.getByText('Add Recipe')).toBeTruthy();
  });

  it('ProfileScreen renders with title Profile', async () => {
    render(<ProfileScreen />);
    expect(await screen.findByText('Profile')).toBeTruthy();
  });
});
