import React, { useMemo } from 'react';
import { Text, View, StyleSheet, TextStyle } from 'react-native';
import { cleanMarkdown } from '@/utils/cleanMarkdown';

interface MarkdownTextProps {
  children: string;
  style?: TextStyle | TextStyle[];
}

type ParsedBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'bullet'; content: string }
  | { type: 'numbered'; number: string; content: string };

export const MarkdownText = React.memo(function MarkdownText({ children, style }: MarkdownTextProps) {
  const blocks = useMemo(() => parseBlocks(cleanMarkdown(children)), [children]);

  const flatStyle = StyleSheet.flatten(style) || {};

  return (
    <View style={s.container}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'bullet':
            return (
              <View key={i} style={s.listRow}>
                <Text style={[flatStyle, s.bulletDot]}>{'•'}</Text>
                <Text style={[flatStyle, s.listText]} selectable>
                  {block.content}
                </Text>
              </View>
            );

          case 'numbered':
            return (
              <View key={i} style={s.listRow}>
                <Text style={[flatStyle, s.numberLabel]}>{block.number}.</Text>
                <Text style={[flatStyle, s.listText]} selectable>
                  {block.content}
                </Text>
              </View>
            );

          default:
            if (!block.content.trim()) return null;
            return (
              <Text key={i} style={[flatStyle, s.paragraph]} selectable>
                {block.content}
              </Text>
            );
        }
      })}
    </View>
  );
});

function parseBlocks(raw: string): ParsedBlock[] {
  const lines = raw.split('\n');
  const blocks: ParsedBlock[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const bulletMatch = line.match(/^\s*[•]\s+(.+)$/);
    if (bulletMatch) {
      blocks.push({ type: 'bullet', content: bulletMatch[1].trim() });
      continue;
    }

    const numMatch = line.match(/^\s*(\d+)[.)]\s+(.+)$/);
    if (numMatch) {
      blocks.push({ type: 'numbered', number: numMatch[1], content: numMatch[2].trim() });
      continue;
    }

    if (line.trim() === '') {
      continue;
    }

    blocks.push({ type: 'paragraph', content: line });
  }

  return blocks;
}

const s = StyleSheet.create({
  container: {
    gap: 3,
  },
  paragraph: {
    lineHeight: 21,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
    marginVertical: 1,
  },
  bulletDot: {
    width: 16,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  numberLabel: {
    width: 22,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  listText: {
    flex: 1,
    lineHeight: 21,
  },
});
