import { render, screen } from '@testing-library/react-native';
import React from 'react';

import App from '../../App';

jest.mock('../api/mealplanApi', () => ({
  generateMealplan: jest.fn().mockResolvedValue([]),
}));

describe('Navigation', () => {
  it('renders App and finds the Feed tab label', () => {
    render(<App />);
    const feedElements = screen.getAllByText('Feed');
    expect(feedElements.length).toBeGreaterThanOrEqual(1);
  });
});
