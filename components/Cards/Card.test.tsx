import { render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import { Card } from './Card';

describe('Card', () => {
  it('renders with title', () => {
    const { getByText } = render(<Card title="Test Card"><Text>Content</Text></Card>);
    expect(getByText('Test Card')).toBeTruthy();
    expect(getByText('Content')).toBeTruthy();
  });
}); 