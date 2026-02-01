import React from 'react';
import { Text, View, StyleSheet, Platform } from 'react-native';

interface MarkdownTextProps {
  children: string;
  style?: any;
}

export function MarkdownText({ children, style }: MarkdownTextProps) {
  const renderText = (text: string) => {
    const listRegex = /^[\s]*[-*]\s+(.+)$/gm;
    const numberedListRegex = /^[\s]*\d+\.\s+(.+)$/gm;

    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      if (listRegex.test(line)) {
        const match = line.match(/^[\s]*([-*])\s+(.+)$/);
        if (match) {
          return (
            <View key={lineIndex} style={styles.listItem}>
              <Text style={[style, styles.bullet]}>•</Text>
              <Text style={style}>{formatInline(match[2])}</Text>
            </View>
          );
        }
      }
      
      if (numberedListRegex.test(line)) {
        const match = line.match(/^[\s]*(\d+)\.\s+(.+)$/);
        if (match) {
          return (
            <View key={lineIndex} style={styles.listItem}>
              <Text style={[style, styles.bullet]}>{match[1]}.</Text>
              <Text style={style}>{formatInline(match[2])}</Text>
            </View>
          );
        }
      }

      const formatted = formatInline(line);
      return <Text key={lineIndex} style={style}>{formatted}{'\n'}</Text>;
    });
  };

  const formatInline = (text: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    const patterns: { regex: RegExp; style: any }[] = [
      { regex: /\*\*(.+?)\*\*/g, style: styles.bold },
      { regex: /`(.+?)`/g, style: styles.code },
      { regex: /\*(.+?)\*/g, style: styles.italic },
    ];

    const matches: { start: number; end: number; text: string; style: any }[] = [];

    patterns.forEach(({ regex, style }) => {
      let match;
      regex.lastIndex = 0;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[1],
          style,
        });
      }
    });

    matches.sort((a, b) => a.start - b.start);

    if (matches.length === 0) {
      return text;
    }

    matches.forEach((match, index) => {
      if (lastIndex < match.start) {
        parts.push(
          <Text key={key++} style={style}>
            {text.substring(lastIndex, match.start)}
          </Text>
        );
      }
      parts.push(
        <Text key={key++} style={[style, match.style]}>
          {match.text}
        </Text>
      );
      lastIndex = match.end;
    });

    if (lastIndex < text.length) {
      parts.push(
        <Text key={key++} style={style}>
          {text.substring(lastIndex)}
        </Text>
      );
    }

    return <>{parts}</>;
  };

  return <View>{renderText(children)}</View>;
}

const styles = StyleSheet.create({
  bold: {
    fontWeight: '700',
  },
  italic: {
    fontStyle: 'italic',
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 14,
  },
  listItem: {
    flexDirection: 'row',
    marginVertical: 2,
    paddingLeft: 8,
  },
  bullet: {
    marginRight: 8,
    fontWeight: '600',
  },
});
