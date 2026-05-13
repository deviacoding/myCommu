import { NotificationItem } from '../types';

export const notifications: NotificationItem[] = [
  {
    id: 'n1',
    type: 'like',
    text: 'a aimé votre post sur le Shabbat',
    actorName: 'Sarah Cohen',
    actorAvatar: 'https://i.pravatar.cc/200?img=5',
    createdAt: '2026-05-13T09:50:00Z',
  },
  {
    id: 'n2',
    type: 'badge',
    text: 'Vous avez gagné le badge « Bienfaiteur » !',
    createdAt: '2026-05-13T09:00:00Z',
  },
  {
    id: 'n3',
    type: 'comment',
    text: 'a commenté votre post : « Très inspirant ! »',
    actorName: 'David Azoulay',
    actorAvatar: 'https://i.pravatar.cc/200?img=33',
    createdAt: '2026-05-13T08:20:00Z',
  },
  {
    id: 'n4',
    type: 'event',
    text: 'Nouvel événement : Conférence sur la Torah, le 20 mai',
    createdAt: '2026-05-13T07:00:00Z',
  },
  {
    id: 'n5',
    type: 'follow',
    text: 'vous suit désormais',
    actorName: 'Marie Dubois',
    actorAvatar: 'https://i.pravatar.cc/200?img=10',
    createdAt: '2026-05-12T20:15:00Z',
    read: true,
  },
  {
    id: 'n6',
    type: 'mention',
    text: 'vous a mentionné dans un commentaire',
    actorName: 'Yusuf Aslan',
    actorAvatar: 'https://i.pravatar.cc/200?img=14',
    createdAt: '2026-05-12T16:00:00Z',
    read: true,
  },
];
