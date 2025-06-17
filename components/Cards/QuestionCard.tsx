import React from 'react';
import { StyleSheet } from 'react-native';
import { PainScaleCircles } from '../PainScales';
import { Card } from './Card';

interface QuestionCardProps {
  question: string;
  onValueChange?: (value: number) => void;
  transparent?: boolean;
  showLabels?: boolean;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  onValueChange,
  transparent = false,
  showLabels = true,
}) => {
  return (
    <Card 
      transparent={transparent}
      title={question}
    >
      <PainScaleCircles
        onValueChange={onValueChange}
        showLabels={showLabels}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
}); 