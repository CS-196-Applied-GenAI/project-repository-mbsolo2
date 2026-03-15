import { render, screen } from '@testing-library/react-native';
import React from 'react';

import App from '../../App';

jest.mock('../api/mealplanApi', () => ({
  generateMealplan: jest.fn().mockResolvedValue([]),
}));

describe('Navigation', () => {
  it('renders App and finds the Discover tab label', () => {
    render(<App />);
    const discoverElements = screen.getAllByText('Discover');
    expect(discoverElements.length).toBeGreaterThanOrEqual(1);
  });
});
