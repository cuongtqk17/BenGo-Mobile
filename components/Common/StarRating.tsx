import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: number;
  readonly?: boolean;
  color?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = 32,
  readonly = false,
  color = '#FFD700',
}) => {
  const handleStarPress = (starIndex: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((index) => {
        const isFilled = index < rating;
        
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleStarPress(index)}
            disabled={readonly}
            activeOpacity={0.7}
            style={styles.starButton}
          >
            <Ionicons
              name={isFilled ? 'star' : 'star-outline'}
              size={size}
              color={isFilled ? color : '#D1D5DB'}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  starButton: {
    padding: 4,
  },
});
