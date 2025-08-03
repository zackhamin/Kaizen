import * as useGratitude from '@/hooks/useGratitude';
import { render } from '@testing-library/react-native';
import React from 'react';
import Gratitude from './Gratitude';

describe('Gratitude', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    jest.spyOn(useGratitude, 'useGratitudeEntries').mockReturnValue({
      isLoading: true,
      isError: false,
      isSuccess: false,
      isIdle: false,
      isFetching: false,
      data: undefined,
      error: null,
      refetch: jest.fn(),
      status: 'loading',
    } as any);
    const { getByText } = render(<Gratitude />);
    expect(getByText('Loading your entries...')).toBeTruthy();
  });

  it('shows input when loaded and less than 3 entries', () => {
    jest.spyOn(useGratitude, 'useGratitudeEntries').mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: true,
      isIdle: false,
      isFetching: false,
      data: [],
      error: null,
      refetch: jest.fn(),
      status: 'success',
    } as any);
    jest.spyOn(useGratitude, 'useCreateGratitudeEntry').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      error: null,
      status: 'idle',
    } as any);
    jest.spyOn(useGratitude, 'useDeleteGratitudeEntry').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      error: null,
      status: 'idle',
    } as any);
    const { getByText } = render(<Gratitude />);
    expect(getByText("What are you grateful for right now?")).toBeTruthy();
  });
}); 