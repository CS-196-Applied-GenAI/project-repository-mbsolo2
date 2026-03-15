import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { BottomTabs } from './BottomTabs';

jest.mock('../api/mealplanApi', () => ({
  generateMealplan: jest.fn().mockResolvedValue([]),
}));

describe('BottomTabs', () => {
  it('renders the five tab labels', () => {
    render(
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    );

    expect(screen.getAllByText('Discover').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Inventory').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Cookbook').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Add Recipe').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Profile').length).toBeGreaterThanOrEqual(1);
  });
});
