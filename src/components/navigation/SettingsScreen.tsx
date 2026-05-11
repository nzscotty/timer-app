import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function SettingsScreen({ visible, onClose }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.background,
            paddingBottom: insets.bottom,
          },
        ]}
      >
        <Appbar.Header style={{ backgroundColor: theme.colors.background }} elevated={false}>
          <Appbar.BackAction onPress={onClose} />
          <Appbar.Content title="Settings" />
        </Appbar.Header>

        {/* Settings content goes here */}
        <View style={styles.body} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    flex: 1,
  },
});
