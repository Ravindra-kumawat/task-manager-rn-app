/**
 * Entry point of the React Native app
 * Sets up Redux store, persistence, and navigation
 * Also listens to internet connectivity and shows an Offline modal
 */

import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';

// Redux store and persistence setup
import { Provider as StoreProvider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/store/store';

// Navigation container
import AppNavigator from './src/navigation/AppNavigator';

// NetInfo to check for internet connectivity
import NetInfo from '@react-native-community/netinfo';

// Modal shown when offline
import OfflineModal from './src/components/OfflineModal';

function App() {
  const [showModal, setShowModal] = useState(false); // Controls visibility of offline modal

  useEffect(() => {
    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      setShowModal(!state.isConnected); // Show modal if there's no internet
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    // Provide Redux store to the entire app
    <StoreProvider store={store}>
      {/* Gate to delay rendering until persisted state is loaded */}
      <PersistGate loading={null} persistor={persistor}>
        <View style={styles.container}>
          {/* App navigation */}
          <AppNavigator />
          
          {/* Show Offline modal if network is disconnected */}
          <OfflineModal visible={showModal} onClose={() => setShowModal(false)} />
        </View>
      </PersistGate>
    </StoreProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
