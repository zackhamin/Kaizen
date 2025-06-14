// components/types/PainScale.ts

export type PainLevel = 'No Pain' | 'Mild' | 'Moderate' | 'Severe' | 'Worst Pain';

export interface PainScaleProps {
  value?: number;
  onValueChange?: (value: number) => void;
  showLabels?: boolean;
  activeColor?: string;
  inactiveColor?: string;
  textColor?: string;
}

export interface PainScaleCirclesProps extends PainScaleProps {
  size?: 'small' | 'medium' | 'large';
}