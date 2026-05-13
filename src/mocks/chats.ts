import { Chat } from '../types';

export const chats: Chat[] = [
  {
    id: 'c1',
    name: 'Sarah Cohen',
    avatar: 'https://i.pravatar.cc/200?img=5',
    lastMessage: 'On se voit demain à la synagogue ?',
    lastMessageAt: '2026-05-13T09:42:00Z',
    unread: 2,
    online: true,
    messages: [
      { id: 'm1', senderId: 'u1', text: 'Hello Daniel !', createdAt: '2026-05-13T09:30:00Z' },
      { id: 'm2', senderId: 'u1', text: 'Tu viens à la conférence ce soir ?', createdAt: '2026-05-13T09:31:00Z' },
      { id: 'm3', senderId: 'u-me', text: 'Salut Sarah ! Oui je pense passer', createdAt: '2026-05-13T09:35:00Z' },
      { id: 'm4', senderId: 'u1', text: 'Super, on se gardera une place', createdAt: '2026-05-13T09:36:00Z' },
      { id: 'm5', senderId: 'u1', text: 'On se voit demain à la synagogue ?', createdAt: '2026-05-13T09:42:00Z' },
    ],
  },
  {
    id: 'c2',
    name: 'Étudiants juifs de Paris',
    avatar: 'https://picsum.photos/seed/students/200/200',
    lastMessage: 'David: Quelqu’un pour le déjeuner ?',
    lastMessageAt: '2026-05-13T08:15:00Z',
    unread: 5,
    isGroup: true,
    messages: [
      { id: 'm10', senderId: 'u4', text: 'Quelqu’un pour le déjeuner ?', createdAt: '2026-05-13T08:15:00Z' },
    ],
  },
  {
    id: 'c3',
    name: 'David Azoulay',
    avatar: 'https://i.pravatar.cc/200?img=33',
    lastMessage: 'Merci beaucoup pour le minyan !',
    lastMessageAt: '2026-05-12T22:10:00Z',
    unread: 0,
    messages: [
      { id: 'm20', senderId: 'u4', text: 'Merci beaucoup pour le minyan !', createdAt: '2026-05-12T22:10:00Z' },
    ],
  },
  {
    id: 'c4',
    name: 'Yusuf Aslan',
    avatar: 'https://i.pravatar.cc/200?img=14',
    lastMessage: 'On se croise vendredi inchAllah',
    lastMessageAt: '2026-05-12T17:45:00Z',
    unread: 0,
    online: true,
    messages: [
      { id: 'm30', senderId: 'u3', text: 'On se croise vendredi inchAllah', createdAt: '2026-05-12T17:45:00Z' },
    ],
  },
];
