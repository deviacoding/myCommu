export type CommunityId = 'jewish' | 'christian' | 'muslim';

export interface Community {
  id: CommunityId;
  name: string;
  shortName: string;
  description: string;
  icon: string;
}

export interface User {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  community: CommunityId;
  bio?: string;
  level: number;
  points: number;
  badges: string[];
  followers: number;
  following: number;
}

export interface Post {
  id: string;
  authorId: string;
  community: CommunityId;
  content: string;
  image?: string;
  createdAt: string;
  likes: number;
  comments: number;
  liked?: boolean;
  tags?: string[];
}

export interface Event {
  id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  cover?: string;
  community: CommunityId;
  attendees: number;
  going?: boolean;
  organizerId: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: number;
  community: CommunityId;
  cover?: string;
  joined?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  online?: boolean;
  isGroup?: boolean;
  messages: ChatMessage[];
}

export type NotificationType = 'like' | 'comment' | 'follow' | 'event' | 'badge' | 'message' | 'mention';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  text: string;
  actorName?: string;
  actorAvatar?: string;
  createdAt: string;
  read?: boolean;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned?: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  points: number;
  level: number;
}
