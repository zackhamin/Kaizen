import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import { Text } from 'react-native';
import CollapsibleCard from './CollapsibleCard';

describe('CollapsibleCard', () => {
  it('renders the title', () => {
    const { getByText } = render(
      <CollapsibleCard title="Test Title"><Text>Content</Text></CollapsibleCard>
    );
    expect(getByText('Test Title')).toBeTruthy();
  });

  it('shows children when expanded', () => {
    const { getByText } = render(
      <CollapsibleCard title="Test Title" initialCollapsed={false}><Text>Content</Text></CollapsibleCard>
    );
    expect(getByText('Content')).toBeTruthy();
  });

  it('toggles collapse state on header press', () => {
    const { getByText, queryByText } = render(
      <CollapsibleCard title="Test Title"><Text>Content</Text></CollapsibleCard>
    );
    // Initially collapsed, so content should not be visible
    expect(queryByText('Content')).toBeNull();
    // Expand by pressing header
    fireEvent.press(getByText('Test Title'));
    expect(getByText('Content')).toBeTruthy();
  });
}); 