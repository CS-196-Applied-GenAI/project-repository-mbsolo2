import { StyleSheet, Text, View } from 'react-native';

export default function UpcomingScreen() {
  return (
    <View style={styles.container}>
      <Text>Upcoming</Text>
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
