import '@expo/metro-runtime';
import { registerRootComponent } from 'expo';
import { StatusBar, StyleSheet, Text, View } from 'react-native';

function App() {
  return (
    <View style={styles.screen}>
      <StatusBar barStyle="light-content" />
      <View style={styles.card}>
        <Text accessibilityRole="header" style={styles.title}>Live App</Text>
        <Text style={styles.description}>This is the starter screen for the app preview.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#101828',
  },
  card: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '700',
  },
  description: {
    color: '#d0d5dd',
    fontSize: 16,
    textAlign: 'center',
  },
});

registerRootComponent(App);
