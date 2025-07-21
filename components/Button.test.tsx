import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';
import Button from './Button';

describe('Button', () => {
  it('renders correctly with label', () => {
    const { getByText } = render(<Button label="Test Button" onPress={jest.fn()} />);
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const onPressMock = jest.fn();
    const { getByText } = render(<Button label="Press Me" onPress={onPressMock} />);
    fireEvent.press(getByText('Press Me'));
    expect(onPressMock).toHaveBeenCalled();
  });
}); 