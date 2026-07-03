import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV();

export const StorageKeys = {
  SERVER_URL: 'server_url',
  USERNAME: 'username',
  PASSWORD: 'password',
  IS_AUTHENTICATED: 'is_authenticated',
  FAVORITES: 'favorites',
  WATCH_HISTORY: 'watch_history',
};

export const setServerConfig = (url: string, username: string, password: string) => {
  storage.set(StorageKeys.SERVER_URL, url);
  storage.set(StorageKeys.USERNAME, username);
  storage.set(StorageKeys.PASSWORD, password);
  storage.set(StorageKeys.IS_AUTHENTICATED, true);
};

export const getServerConfig = () => ({
  url: storage.getString(StorageKeys.SERVER_URL) || '',
  username: storage.getString(StorageKeys.USERNAME) || '',
  password: storage.getString(StorageKeys.PASSWORD) || '',
});

export const isAuthenticated = () => storage.getBoolean(StorageKeys.IS_AUTHENTICATED) || false;

export const logout = () => {
  storage.delete(StorageKeys.SERVER_URL);
  storage.delete(StorageKeys.USERNAME);
  storage.delete(StorageKeys.PASSWORD);
  storage.delete(StorageKeys.IS_AUTHENTICATED);
};

export const addFavorite = (channelId: string) => {
  const favorites = JSON.parse(storage.getString(StorageKeys.FAVORITES) || '[]');
  if (!favorites.includes(channelId)) {
    favorites.push(channelId);
    storage.set(StorageKeys.FAVORITES, JSON.stringify(favorites));
  }
};

export const removeFavorite = (channelId: string) => {
  const favorites = JSON.parse(storage.getString(StorageKeys.FAVORITES) || '[]');
  const index = favorites.indexOf(channelId);
  if (index > -1) {
    favorites.splice(index, 1);
    storage.set(StorageKeys.FAVORITES, JSON.stringify(favorites));
  }
};

export const getFavorites = (): string[] => {
  return JSON.parse(storage.getString(StorageKeys.FAVORITES) || '[]');
};

export const isFavorite = (channelId: string) => {
  return getFavorites().includes(channelId);
};