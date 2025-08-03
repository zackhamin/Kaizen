import * as useTasks from '@/hooks/useTasks';
import { render } from '@testing-library/react-native';
import React from 'react';
import { Todos } from './Todos';

describe('Todos', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    jest.spyOn(useTasks, 'useEverydayTasks').mockReturnValue({
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
    const { getByText } = render(<Todos />);
    expect(getByText('Loading tasks...')).toBeTruthy();
  });

  it('shows tasks section when loaded', () => {
    jest.spyOn(useTasks, 'useEverydayTasks').mockReturnValue({
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
    jest.spyOn(useTasks, 'useCreateEverydayTask').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      error: null,
      status: 'idle',
    } as any);
    jest.spyOn(useTasks, 'useToggleTask').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      error: null,
      status: 'idle',
    } as any);
    jest.spyOn(useTasks, 'useDeleteTask').mockReturnValue({
      mutate: jest.fn(),
      mutateAsync: jest.fn(),
      isPending: false,
      isError: false,
      isSuccess: false,
      reset: jest.fn(),
      error: null,
      status: 'idle',
    } as any);
    const { getByText } = render(<Todos />);
    expect(getByText('Everyday Tasks')).toBeTruthy();
  });
}); 