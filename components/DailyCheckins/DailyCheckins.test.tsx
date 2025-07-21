import * as useDailyCheckins from '@/hooks/useDailyCheckins';
import { render } from '@testing-library/react-native';
import React from 'react';
import { DailyCheckinContainer } from './DailyCheckins';

describe('DailyCheckinContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    jest.spyOn(useDailyCheckins, 'useTodayCheckin').mockReturnValue({
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
    const { getByText } = render(<DailyCheckinContainer />);
    expect(getByText('Loading check-ins...')).toBeTruthy();
  });

  it('shows check-in questions when loaded', () => {
    jest.spyOn(useDailyCheckins, 'useTodayCheckin').mockReturnValue({
      isLoading: false,
      isError: false,
      isSuccess: true,
      isIdle: false,
      isFetching: false,
      data: null,
      error: null,
      refetch: jest.fn(),
      status: 'success',
    } as any);
    jest.spyOn(useDailyCheckins, 'useUpsertDailyCheckin').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      error: null,
      status: 'idle',
    } as any);
    const { getByText } = render(<DailyCheckinContainer />);
    expect(getByText("How's your energy level today?")).toBeTruthy();
    expect(getByText("How well are you handling today's challenges?")).toBeTruthy();
    expect(getByText("How focused and on-track do you feel?"));
  });
}); 