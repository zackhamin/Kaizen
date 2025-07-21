import { render } from '@testing-library/react-native';
import React from 'react';
import { QuoteCard } from './QuoteCard';

describe('QuoteCard', () => {
  it('renders quote and author', () => {
    const { getByText } = render(
      <QuoteCard quote="Test quote" author="Test Author" />
    );
    expect(getByText('"Test quote"')).toBeTruthy();
    expect(getByText(/Test Author/)).toBeTruthy();
  });

  it('renders quote without author', () => {
    const { getByText, queryByText } = render(
      <QuoteCard quote="Another quote" />
    );
    expect(getByText('"Another quote"')).toBeTruthy();
    expect(queryByText(/—/)).toBeNull();
  });
}); 