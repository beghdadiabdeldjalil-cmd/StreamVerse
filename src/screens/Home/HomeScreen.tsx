import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAppStore } from '../../store/AppStore';
import { Channel } from '../../services/iptvService';
import FastImage from 'react-native-fast-image';

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const {
    categories,
    channels,
    selectedCategory,
    currentStreamType,
    isLoading,
    loadCategories,
    loadChannels,
    setSelectedCategory,
    setStreamType,
  } = useAppStore();

  const [localLoading, setLocalLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const loadData = async () => {
      setLocalLoading(true);
      await loadCategories();
      setLocalLoading(false);
    };
    loadData();
  }, [currentStreamType]);

  useEffect(() => {
    if (selectedCategory) {
      loadChannels(selectedCategory);
    }
  }, [selectedCategory]);

  const filteredChannels = channels.filter((channel: Channel) =>
    channel.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleChannelPress = (channelId: string) => {
    navigation.navigate('Player', { channelId });
  };

  const handleSearchPress = () => {
    navigation.navigate('Search');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>StreamVerse</Text>
        <TouchableOpacity
          style={styles.favoritesButton}
          onPress={() => navigation.navigate('Favorites')}
        >
          <Text style={styles.favoritesIcon}>♡</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.typeSelector}>
        {(['live', 'vod', 'series'] as const).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.typeButton, currentStreamType === type && styles.typeButtonActive]}
            onPress={() => setStreamType(type)}
          >
            <Text style={[styles.typeButtonText, currentStreamType === type && styles.typeButtonTextActive]}>
              {type.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search channels..."
          placeholderTextColor="#666"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity onPress={handleSearchPress}>
          <Text style={styles.searchIcon}>🔍</Text>
        </TouchableOpacity>
      </View>

      {localLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <FlatList
              data={categories}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === item.id && styles.categoryChipActive,
                  ]}
                  onPress={() => handleCategorySelect(item.id)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      selectedCategory === item.id && styles.categoryChipTextActive,
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoriesList}
            />
          </View>

          <Text style={styles.sectionTitle}>Channels</Text>
          <FlatList
            data={filteredChannels}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.channelCard}
                onPress={() => handleChannelPress(item.id)}
              >
                {item.logo && (
                  <FastImage
                    source={{ uri: item.logo }}
                    style={styles.channelLogo}
                    resizeMode="contain"
                  />
                )}
                <Text style={styles.channelName} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.channelsList}
          />
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.footerIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  favoritesButton: {
    padding: 10,
  },
  favoritesIcon: {
    fontSize: 20,
  },
  typeSelector: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  typeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
  },
  typeButtonActive: {
    backgroundColor: '#e74c3c',
  },
  typeButtonText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 14,
  },
  searchIcon: {
    fontSize: 18,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoriesSection: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginVertical: 10,
    marginLeft: 5,
  },
  categoriesList: {
    paddingHorizontal: 5,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  categoryChipActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  categoryChipText: {
    color: '#999',
    fontSize: 12,
    fontWeight: '500',
  },
  categoryChipTextActive: {
    color: '#fff',
  },
  channelsList: {
    paddingBottom: 20,
  },
  channelCard: {
    flex: 1,
    margin: 5,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  channelLogo: {
    width: '100%',
    height: '70%',
    backgroundColor: '#0a0a0a',
  },
  channelName: {
    padding: 8,
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    height: '30%',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  footerIcon: {
    fontSize: 24,
  },
});