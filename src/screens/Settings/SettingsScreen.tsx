import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { logout, getServerConfig } from '../../services/storage';
import { useAppStore } from '../../store/AppStore';

type SettingsScreenProps = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: SettingsScreenProps) {
  const { setAuthenticated, setChannels, setCategories } = useAppStore();
  const [serverConfig] = useState(getServerConfig());

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          setAuthenticated(false);
          setChannels([]);
          setCategories([]);
          navigation.replace('Connect');
        },
        style: 'destructive',
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Server</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>URL</Text>
            <Text style={styles.infoValue}>{serverConfig.url}</Text>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Username</Text>
            <Text style={styles.infoValue}>{serverConfig.username}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>App</Text>
            <Text style={styles.infoValue}>StreamVerse v1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.actionButton} onPress={handleLogout}>
            <Text style={styles.actionButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  backButton: { padding: 10, width: 40 },
  backIcon: { color: '#e74c3c', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: 'bold', color: '#fff', flex: 1, textAlign: 'center' },
  content: { flex: 1, padding: 15 },
  section: { marginBottom: 25 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#e74c3c', marginBottom: 12, textTransform: 'uppercase' },
  infoBox: { backgroundColor: '#1a1a1a', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#333' },
  infoLabel: { fontSize: 12, fontWeight: '600', color: '#999', marginBottom: 4 },
  infoValue: { fontSize: 14, color: '#fff', fontWeight: '500' },
  actionButton: { backgroundColor: '#e74c3c', borderRadius: 8, paddingVertical: 12, paddingHorizontal: 15, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});