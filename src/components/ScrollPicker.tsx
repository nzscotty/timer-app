import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useTheme } from 'react-native-paper';

interface Props {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  /** When provided, the center slot becomes an editable TextInput.
   *  The parent controls the value; onChange fires on every keystroke. */
  editableValue?: string;
  onEditChange?: (text: string) => void;
  itemHeight?: number;
  visibleCount?: number;
}

export default function ScrollPicker({
  items,
  selectedIndex,
  onSelect,
  editableValue,
  onEditChange,
  itemHeight = 52,
  visibleCount = 5,
}: Props) {
  const theme = useTheme();
  const listRef = useRef<FlatList>(null);
  const isUserScroll = useRef(false);
  const lastProgrammaticIndex = useRef(selectedIndex);

  const containerHeight = itemHeight * visibleCount;
  const padCount = Math.floor(visibleCount / 2);

  // Pad items with empty strings at top and bottom so the first/last real item can center
  const paddedItems = [
    ...Array(padCount).fill(''),
    ...items,
    ...Array(padCount).fill(''),
  ];

  // Scroll to selected item when it changes externally
  useEffect(() => {
    if (lastProgrammaticIndex.current !== selectedIndex && !isUserScroll.current) {
      lastProgrammaticIndex.current = selectedIndex;
      listRef.current?.scrollToOffset({
        offset: selectedIndex, // * itemHeight,
        animated: true,
      });
    }
  }, [selectedIndex, itemHeight]);

  // Initial scroll (no animation)
  useEffect(() => {
    const timer = setTimeout(() => {
      listRef.current?.scrollToOffset({
        offset: selectedIndex, // * itemHeight,
        animated: false,
      });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleScrollBegin = () => {
    isUserScroll.current = true;
  };

  const handleMomentumEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const y = e.nativeEvent.contentOffset.y;
      const index = Math.round(y / itemHeight);
      const clamped = Math.max(0, Math.min(items.length - 1, index));
      lastProgrammaticIndex.current = clamped;
      isUserScroll.current = false;
      onSelect(clamped);
    },
    [itemHeight, items.length, onSelect]
  );

  const getItemLayout = (_: any, index: number) => ({
    length: itemHeight,
    offset: itemHeight * index,
    index,
  });

  const renderItem = ({ item, index }: { item: string; index: number }) => {
    const realIndex = index - padCount;
    const isSelected = realIndex === selectedIndex;
    const isEmpty = item === '';

    // The selected item renders as a TextInput when editable
    if (!isEmpty && isSelected && editableValue !== undefined && onEditChange) {
      return (
        <View style={[styles.item, { height: itemHeight }]}>
          <TextInput
            value={editableValue}
            onChangeText={onEditChange}
            keyboardType="number-pad"
            maxLength={2}
            selectTextOnFocus
            style={[
              styles.editInput,
              {
                height: itemHeight,
                color: theme.colors.primary,
              },
            ]}
          />
        </View>
      );
    }

    return (
      <View style={[styles.item, { height: itemHeight }]}>
        {!isEmpty && (
          <Text
            style={[
              styles.itemText,
              {
                color: isSelected
                  ? theme.colors.primary
                  : theme.colors.onSurfaceVariant,
                fontWeight: isSelected ? '600' : '400',
                opacity: isSelected ? 1 : 0.5,
              },
            ]}
          >
            {item}
          </Text>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Selection highlight — border only */}
      <View
        pointerEvents="none"
        style={[
          styles.highlight,
          {
            top: padCount * itemHeight,
            height: itemHeight,
            borderColor: theme.colors.primary,
          },
        ]}
      />
      <FlatList
        ref={listRef}
        data={paddedItems}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        getItemLayout={getItemLayout}
        onScrollBeginDrag={handleScrollBegin}
        onMomentumScrollEnd={handleMomentumEnd}
        bounces={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: 80,
  },
  highlight: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: `rgba(0,0,0,0)`,
  },
  editInput: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    fontVariant: ['tabular-nums'],
    padding: 0,
    margin: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  itemText: {
    fontSize: 24,
    fontVariant: ['tabular-nums'],
  },
});
