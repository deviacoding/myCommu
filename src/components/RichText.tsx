import React, { ReactNode } from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';

// Mise en forme légère, lisible même sans rendu :
//   **gras**   ==surligné==   {{rouge|texte}}  {{bleu|texte}}  {{vert|texte}}
export const RICH_COLORS: Record<string, string> = {
  rouge: '#DC2626',
  bleu: '#1D4ED8',
  vert: '#15803D',
};

const TOKEN = /(\*\*[^*]+\*\*|==[^=]+==|\{\{(?:rouge|bleu|vert)\|[^}]+\}\})/g;

export function hasRichMarkup(text: string): boolean {
  return TOKEN.test(text);
}

export function stripRichMarkup(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/==([^=]+)==/g, '$1')
    .replace(/\{\{(?:rouge|bleu|vert)\|([^}]+)\}\}/g, '$1');
}

export function renderRich(text: string): ReactNode[] {
  const parts = text.split(TOKEN);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <Text key={i} style={{ fontWeight: '800' }}>
          {renderRich(part.slice(2, -2))}
        </Text>
      );
    }
    if (part.startsWith('==') && part.endsWith('==')) {
      return (
        <Text key={i} style={{ backgroundColor: '#FDE68A' }}>
          {renderRich(part.slice(2, -2))}
        </Text>
      );
    }
    const m = part.match(/^\{\{(rouge|bleu|vert)\|([\s\S]+)\}\}$/);
    if (m) {
      return (
        <Text key={i} style={{ color: RICH_COLORS[m[1]], fontWeight: '700' }}>
          {renderRich(m[2])}
        </Text>
      );
    }
    return <Text key={i}>{part}</Text>;
  });
}

export function RichText({ text, style }: { text: string; style?: StyleProp<TextStyle> }) {
  return <Text style={style}>{renderRich(text)}</Text>;
}
