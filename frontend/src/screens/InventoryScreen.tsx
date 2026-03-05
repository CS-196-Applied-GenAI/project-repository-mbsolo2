import { StyleSheet, Text, View } from 'react-native';

export default function InventoryScreen() {
  return (
    <View style={styles.container}>
      <Text>Inventory</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
