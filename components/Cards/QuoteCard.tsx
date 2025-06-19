import { colors, theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from './Card';

interface QuoteCardProps {
  quote: string;
  author?: string;
  transparent?: boolean;
}

export const QuoteCard: React.FC<QuoteCardProps> = ({
  quote,
  author,
  transparent = false,
}) => {
  return (
    <Card transparent={transparent}>
      <View style={styles.quoteContainer}>
        <Text style={[styles.quote, { color: colors.text.primary.dark }]}>
          "{quote}"
        </Text>
        {author && (
          <Text style={[styles.author, { color: colors.text.secondary.light }]}>
            — {author}
          </Text>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  quoteContainer: {
    alignItems: 'center',
  },
  quote: {
    fontSize: 16,
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: theme.spacing.sm,
  },
  author: {
    fontSize: 14,
    fontWeight: '500',
  },
}); 