import axios from 'axios';
import { getServerConfig } from './storage';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  group?: string;
  tvg_id?: string;
  tvg_name?: string;
  tvg_logo?: string;
  url: string;
}

export interface Category {
  id: string;
  title: string;
  category_id: string;
}

export interface EPG {
  id: string;
  title: string;
  start: string;
  end: string;
  description: string;
}

class IPTVService {
  private baseURL: string = '';
  private username: string = '';
  private password: string = '';

  setCredentials(url: string, username: string, password: string) {
    this.baseURL = url.replace(/\/+$/, '');
    this.username = username;
    this.password = password;
  }

  private getAuthParams() {
    return {
      username: this.username,
      password: this.password,
    };
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseURL}/player_api.php`, {
        params: this.getAuthParams(),
        timeout: 5000,
      });
      return response.status === 200;
    } catch (error) {
      console.error('Connection test failed:', error);
      return false;
    }
  }

  async getCategories(type: 'live' | 'vod' | 'series' = 'live'): Promise<Category[]> {
    try {
      const response = await axios.get(`${this.baseURL}/player_api.php`, {
        params: {
          ...this.getAuthParams(),
          action: 'get_categories',
          category_type: type,
        },
        timeout: 10000,
      });
      return response.data || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      return [];
    }
  }

  async getChannels(categoryId?: string, type: 'live' | 'vod' | 'series' = 'live'): Promise<Channel[]> {
    try {
      const params: any = {
        ...this.getAuthParams(),
        action: 'get_live_streams',
      };

      if (type === 'live') {
        params.action = 'get_live_streams';
      } else if (type === 'vod') {
        params.action = 'get_vod_streams';
      } else if (type === 'series') {
        params.action = 'get_series';
      }

      if (categoryId) {
        params.category_id = categoryId;
      }

      const response = await axios.get(`${this.baseURL}/player_api.php`, {
        params,
        timeout: 10000,
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map((channel: any) => ({
        id: channel.stream_id?.toString() || channel.id?.toString() || '',
        name: channel.name || channel.stream_name || '',
        logo: channel.stream_icon || channel.logo || '',
        group: channel.category_name || channel.category || '',
        url: `${this.baseURL}/live/${this.username}/${this.password}/${channel.stream_id}.m3u8`,
        tvg_id: channel.tvg_id || '',
        tvg_name: channel.tvg_name || '',
        tvg_logo: channel.tvg_logo || '',
      }));
    } catch (error) {
      console.error('Failed to fetch channels:', error);
      return [];
    }
  }

  async searchChannels(query: string, type: 'live' | 'vod' | 'series' = 'live'): Promise<Channel[]> {
    try {
      const channels = await this.getChannels(undefined, type);
      return channels.filter(
        (channel) =>
          channel.name.toLowerCase().includes(query.toLowerCase()) ||
          channel.group?.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async getEPG(streamId: string): Promise<EPG[]> {
    try {
      const response = await axios.get(`${this.baseURL}/player_api.php`, {
        params: {
          ...this.getAuthParams(),
          action: 'get_simple_data_table',
          stream_id: streamId,
        },
        timeout: 5000,
      });
      return response.data?.epg_listings || [];
    } catch (error) {
      console.error('Failed to fetch EPG:', error);
      return [];
    }
  }

  getStreamUrl(streamId: string): string {
    return `${this.baseURL}/live/${this.username}/${this.password}/${streamId}.m3u8`;
  }

  getVodUrl(streamId: string): string {
    return `${this.baseURL}/movie/${this.username}/${this.password}/${streamId}.m3u8`;
  }
}

export default new IPTVService();
