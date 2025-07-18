import { Todos } from '@/components/Todos/Todos';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function TargetsScreen() {

  return (   
      <View style={styles.container}>
        <Todos/>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
});
