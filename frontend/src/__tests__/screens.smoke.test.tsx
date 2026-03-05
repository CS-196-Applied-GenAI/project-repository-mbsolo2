import { render, screen } from '@testing-library/react-native';
import React from 'react';

import CookbookScreen from '../screens/CookbookScreen';
import FeedScreen from '../screens/FeedScreen';
import InventoryScreen from '../screens/InventoryScreen';
import UpcomingScreen from '../screens/UpcomingScreen';

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
    const { container } = render(<FeedScreen />);
    expect(container).toBeTruthy();
  });

  it('UpcomingScreen renders', () => {
    const { container } = render(<UpcomingScreen />);
    expect(container).toBeTruthy();
  });

  it('InventoryScreen renders with title Inventory', () => {
    render(<InventoryScreen />);
    expect(screen.getByText('Inventory')).toBeTruthy();
  });

  it('CookbookScreen renders with title My Cookbook', () => {
    render(<CookbookScreen />);
    expect(screen.getByText('My Cookbook')).toBeTruthy();
  });
});
