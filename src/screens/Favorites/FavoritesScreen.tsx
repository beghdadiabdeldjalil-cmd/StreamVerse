import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/AppNavigator';
import FastImage from 'react-native-fast-image';
import { getFavorites, removeFavorite } from '../../services/storage';
import { useAppStore } from '../../store/AppStore';
import { Channel } from '../../services/iptvService';

type FavoritesScreenProps = NativeStackScreenProps<RootStackParamList, 'Favorites'>;

export default function FavoritesScreen({ navigation }: FavoritesScreenProps) {
  const { channels, isLoading, loadChannels } = useAppStore();
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    const loadFavorites = async () => {
      const fav = getFavorites();
      setFavorites(fav);
      if (fav.length > 0) {
        await loadChannels();
      }
    };
    loadFavorites();
  }, []);

  const favoriteChannels = channels.filter((channel: Channel) => favorites.includes(channel.id));

  const handleRemoveFavorite = (channelId: string) => {
    removeFavorite(channelId);
    setFavorites(getFavorites());
  };

  const handleChannelPress = (channelId: string) => {
    navigation.navigate('Player', { channelId });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChannels();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backIcon}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>My Favorites</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#e74c3c" />
        </View>
      ) : favoriteChannels.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No favorite channels</Text>
          <Text style={styles.emptySubtext}>Add channels to your favorites to see them here</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteChannels}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => item.id}
          onRefresh={handleRefresh}
          refreshing={refreshing}
          renderItem={({ item }) => (
            <View style={styles.channelCardContainer}>
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
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFavorite(item.id)}
              >
                <Text style={styles.removeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={styles.channelsList}
        />
      )}
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
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  backButton: {
    marginRight: 10,
  },
  backIcon: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  emptySubtext: {
    color: '#666',
    fontSize: 14,
  },
  channelsList: {
    padding: 10,
  },
  channelCardContainer: {
    flex: 1,
    margin: 5,
    position: 'relative',
  },
  channelCard: {
    flex: 1,
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
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#e74c3c',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});