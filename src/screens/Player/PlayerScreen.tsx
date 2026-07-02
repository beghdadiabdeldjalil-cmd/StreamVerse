import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import Video from 'react-native-video';
import { addFavorite, removeFavorite, isFavorite } from '../services/storage';
import { useAppStore } from '../store/appStore';

type PlayerScreenProps = NativeStackScreenProps<RootStackParamList, 'Player'>;

export default function PlayerScreen({ navigation, route }: PlayerScreenProps) {
  const { channelId } = route.params;
  const { channels } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [controlsVisible, setControlsVisible] = useState(true);
  const videoRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const channel = channels.find((c) => c.id === channelId);

  useEffect(() => {
    if (channel) {
      setIsFav(isFavorite(channelId));
    }
  }, [channel, channelId]);

  const toggleControls = () => {
    setControlsVisible(!controlsVisible);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (!controlsVisible) {
      controlsTimeoutRef.current = setTimeout(() => {
        setControlsVisible(false);
      }, 5000);
    }
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleFavorite = () => {
    if (isFav) {
      removeFavorite(channelId);
    } else {
      addFavorite(channelId);
    }
    setIsFav(!isFav);
  };

  const handleLoadStart = () => {
    setLoading(true);
    setError(null);
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = (e: any) => {
    setLoading(false);
    setError('Failed to load stream');
    console.error('Video error:', e);
  };

  if (!channel) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Channel not found</Text>
          <TouchableOpacity
            style={styles.backButtonError}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.videoContainer}
        activeOpacity={1}
        onPress={toggleControls}
      >
        <Video
          ref={videoRef}
          source={{ uri: channel.url }}
          style={styles.video}
          controls={false}
          paused={!isPlaying}
          onLoadStart={handleLoadStart}
          onLoad={handleLoad}
          onError={handleError}
          resizeMode="contain"
          progressUpdateInterval={1000}
        />

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#e74c3c" />
          </View>
        )}

        {controlsVisible && (
          <View style={styles.controlsOverlay}>
            <View style={styles.topControls}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>Back</Text>
              </TouchableOpacity>
              <Text style={styles.channelTitle} numberOfLines={1}>
                {channel.name}
              </Text>
              <TouchableOpacity
                onPress={handleFavorite}
                style={styles.favoriteButton}
              >
                <Text style={styles.favoriteIcon}>{isFav ? 'FILLED' : 'EMPTY'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.centerControls}>
              <TouchableOpacity
                onPress={handlePlayPause}
                style={styles.playButton}
              >
                <Text style={styles.playIcon}>{isPlaying ? 'PAUSE' : 'PLAY'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {error && (
          <View style={styles.errorOverlay}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'space-between',
  },
  topControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  backButton: {
    padding: 10,
  },
  backIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  channelTitle: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 10,
    textAlign: 'center',
  },
  favoriteButton: {
    padding: 10,
  },
  favoriteIcon: {
    fontSize: 20,
  },
  centerControls: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e74c3c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 28,
    color: '#fff',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  backButtonError: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#e74c3c',
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
