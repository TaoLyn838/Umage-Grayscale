import { View, Text, StyleSheet, ViewStyle, Platform } from 'react-native';
import React, { ReactNode } from 'react';
import { BlurView } from 'expo-blur';

interface CardProps {
  children: ReactNode;
  title?: string;
  rightAction?: ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, title, rightAction, style }: CardProps) => {
  return (
    <BlurView
      intensity={15}
      tint="light"
      style={[styles.card, style]}
    >
      {(title || rightAction) && (
        <View style={styles.header}>
          {title ? <Text style={styles.title}>{title}</Text> : <View />}
          {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </View>
      )}
      <View style={styles.content}>
        {children}
      </View>
    </BlurView>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.28)',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  rightAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  content: {
    flex: 1,
  },
});
