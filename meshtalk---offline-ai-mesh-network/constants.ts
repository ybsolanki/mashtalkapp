
import { DeviceNode } from './types';

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'hi', name: 'Hindi' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ar', name: 'Arabic' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'ja', name: 'Japanese' },
];

export const INITIAL_NODES: DeviceNode[] = [
  { id: 'me', name: 'You (Host)', status: 'online', battery: 84, distance: 0, language: 'en' },
];

export const MOCK_CHATS: Record<string, any[]> = {
  'broadcast': [],
};
