import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import CircleButton from './CircleButton';

describe('CircleButton', () => {
  it('renders without crashing', () => {
    const { getByRole } = render(<CircleButton onPress={jest.fn()} />);
    // The button should be present
    expect(getByRole('button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByRole } = render(<CircleButton onPress={onPressMock} />);
    fireEvent.press(getByRole('button'));
    expect(onPressMock).toHaveBeenCalled();
  });
}); 