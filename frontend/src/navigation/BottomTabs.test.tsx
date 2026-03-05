import { NavigationContainer } from '@react-navigation/native';
import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { BottomTabs } from './BottomTabs';

describe('BottomTabs', () => {
  it('renders the four tab labels', () => {
    render(
      <NavigationContainer>
        <BottomTabs />
      </NavigationContainer>
    );

    expect(screen.getAllByText('Feed').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Upcoming').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('Inventory').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('My Cookbook').length).toBeGreaterThanOrEqual(1);
  });
});
