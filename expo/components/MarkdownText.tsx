import React, { useMemo } from 'react';
import { Text, View, StyleSheet, Platform, TextStyle } from 'react-native';

interface MarkdownTextProps {
  children: string;
  style?: TextStyle | TextStyle[];
}

type ParsedBlock =
  | { type: 'paragraph'; content: string }
  | { type: 'heading'; level: number; content: string }
  | { type: 'bullet'; content: string }
  | { type: 'numbered'; number: string; content: string }
  | { type: 'code_block'; content: string };

export const MarkdownText = React.memo(function MarkdownText({ children, style }: MarkdownTextProps) {
  const blocks = useMemo(() => parseBlocks(children), [children]);

  const flatStyle = StyleSheet.flatten(style) || {};

  return (
    <View style={s.container}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'heading':
            return (
              <Text
                key={i}
                style={[
                  flatStyle,
                  s.heading,
                  block.level === 1 && s.h1,
                  block.level === 2 && s.h2,
                  block.level >= 3 && s.h3,
                  i > 0 && s.headingSpacing,
                ]}
                selectable
              >
                {renderInline(block.content, flatStyle)}
              </Text>
            );

          case 'bullet':
            return (
              <View key={i} style={s.listRow}>
                <Text style={[flatStyle, s.bulletDot]}>{'•'}</Text>
                <Text style={[flatStyle, s.listText]} selectable>
                  {renderInline(block.content, flatStyle)}
                </Text>
              </View>
            );

          case 'numbered':
            return (
              <View key={i} style={s.listRow}>
                <Text style={[flatStyle, s.numberLabel]}>{block.number}.</Text>
                <Text style={[flatStyle, s.listText]} selectable>
                  {renderInline(block.content, flatStyle)}
                </Text>
              </View>
            );

          case 'code_block':
            return (
              <View key={i} style={s.codeBlock}>
                <Text style={[flatStyle, s.codeBlockText]} selectable>
                  {block.content}
                </Text>
              </View>
            );

          default:
            if (!block.content.trim()) return null;
            return (
              <Text key={i} style={[flatStyle, s.paragraph]} selectable>
                {renderInline(block.content, flatStyle)}
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
  let inCodeBlock = false;
  let codeLines: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({ type: 'code_block', content: codeLines.join('\n') });
        codeLines = [];
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      blocks.push({ type: 'heading', level: headingMatch[1].length, content: headingMatch[2].trim() });
      continue;
    }

    const bulletMatch = line.match(/^\s*[-*+]\s+(.+)$/);
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

  if (inCodeBlock && codeLines.length > 0) {
    blocks.push({ type: 'code_block', content: codeLines.join('\n') });
  }

  return blocks;
}

function renderInline(text: string, baseStyle: TextStyle): React.ReactNode {
  const tokens: { text: string; bold?: boolean; italic?: boolean; code?: boolean }[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      tokens.push({ text: boldMatch[1], bold: true });
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      tokens.push({ text: codeMatch[1], code: true });
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      tokens.push({ text: italicMatch[1], italic: true });
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    const nextSpecial = remaining.search(/[*`]/);
    if (nextSpecial === -1) {
      tokens.push({ text: remaining });
      break;
    } else if (nextSpecial === 0) {
      tokens.push({ text: remaining[0] });
      remaining = remaining.slice(1);
    } else {
      tokens.push({ text: remaining.slice(0, nextSpecial) });
      remaining = remaining.slice(nextSpecial);
    }
  }

  if (tokens.length === 1 && !tokens[0].bold && !tokens[0].italic && !tokens[0].code) {
    return tokens[0].text;
  }

  return (
    <>
      {tokens.map((t, i) => {
        if (t.bold) {
          return <Text key={i} style={[baseStyle, s.bold]}>{t.text}</Text>;
        }
        if (t.italic) {
          return <Text key={i} style={[baseStyle, s.italic]}>{t.text}</Text>;
        }
        if (t.code) {
          return <Text key={i} style={[baseStyle, s.inlineCode]}>{t.text}</Text>;
        }
        return <Text key={i}>{t.text}</Text>;
      })}
    </>
  );
}

const s = StyleSheet.create({
  container: {
    gap: 4,
  },
  paragraph: {
    lineHeight: 21,
  },
  heading: {
    fontWeight: '700' as const,
  },
  h1: {
    fontSize: 18,
    lineHeight: 24,
  },
  h2: {
    fontSize: 16,
    lineHeight: 22,
  },
  h3: {
    fontSize: 15,
    lineHeight: 21,
  },
  headingSpacing: {
    marginTop: 6,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  bulletDot: {
    width: 16,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  numberLabel: {
    width: 20,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600' as const,
  },
  listText: {
    flex: 1,
    lineHeight: 21,
  },
  bold: {
    fontWeight: '600' as const,
  },
  italic: {
    fontStyle: 'italic' as const,
  },
  inlineCode: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: 'rgba(0,0,0,0.06)',
    paddingHorizontal: 3,
    borderRadius: 3,
    fontSize: 13,
  },
  codeBlock: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 8,
    padding: 10,
    marginVertical: 2,
  },
  codeBlockText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 13,
    lineHeight: 18,
  },
});
