#!/usr/bin/env node

/**
 * Script för att generera unika Högskoleprovsfrågor med AI
 * 
 * Användning:
 * 1. Sätt ANTHROPIC_API_KEY i environment
 * 2. Kör: ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-hp-questions-ai.ts
 * 
 * Detta genererar 960 unika frågor (20 frågor × 6 sektioner × 8 versioner)
 */

import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const SECTIONS = [
  { code: 'ORD', name: 'Ordförståelse', description: 'Synonymer, antonymer och ordförståelse' },
  { code: 'LÄS', name: 'Läsförståelse', description: 'Textanalys och förståelse' },
  { code: 'MEK', name: 'Meningskomplettering', description: 'Komplettera meningar logiskt' },
  { code: 'XYZ', name: 'Diagram, tabeller & kartor', description: 'Tolka visuell data' },
  { code: 'KVA', name: 'Kvantitativ analys', description: 'Jämföra kvantiteter' },
  { code: 'DTK', name: 'Data och teknisk förståelse', description: 'Tolka teknisk data' },
];

const VERSIONS = [
  '2024-spring',
  '2023-fall',
  '2023-spring',
  '2022-fall',
  '2022-spring',
  '2021-fall',
  '2021-spring',
  '2020-fall',
];

async function generateQuestionsForSection(
  client: Anthropic,
  section: typeof SECTIONS[0],
  version: string,
  count: number = 20
) {
  const versionId = `${section.code.toLowerCase()}-${version}`;
  
  console.log(`\n🤖 Genererar ${count} frågor för ${section.code} (${version})...`);

  const prompt = `Generera ${count} unika Högskoleprovsfrågor för sektionen ${section.name} (${section.code}).

Beskrivning: ${section.description}

Krav:
- Alla frågor på SVENSKA
- Variera svårighetsgrad (easy, medium, hard)
- För multiple_choice: 4 svarsalternativ, endast 1 korrekt
- För comparison (KVA): Format "Jämför: Kvantitet I: X | Kvantitet II: Y"
- För reading_comprehension (LÄS): Inkludera readingPassage
- Varje fråga ska ha tydlig explanation
- Använd testVersion: '${versionId}'

Returformat (TypeScript array):
[
  {
    id: '${versionId}-1',
    sectionCode: '${section.code}',
    testVersion: '${versionId}',
    questionNumber: 1,
    questionText: 'Frågan här?',
    questionType: 'multiple_choice',
    options: ['Alt 1', 'Alt 2', 'Alt 3', 'Alt 4'],
    correctAnswer: 'Alt 2',
    explanation: 'Förklaring här',
    difficulty: 'medium',
  },
  ...
]

Generera alla ${count} frågor nu:`;

  try {
    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: prompt,
      }],
    });

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '';
    
    // Extract JSON from code block
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Could not extract JSON from response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    console.log(`  ✅ Genererade ${questions.length} frågor`);
    
    return questions;
  } catch (error) {
    console.error(`  ❌ Fel vid generering:`, error);
    return [];
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    console.error('❌ ANTHROPIC_API_KEY saknas!');
    console.log('\nAnvändning:');
    console.log('  ANTHROPIC_API_KEY=sk-... npx tsx scripts/generate-hp-questions-ai.ts');
    process.exit(1);
  }

  const client = new Anthropic({ apiKey });
  
  console.log('🚀 Startar generering av högskoleprövsfrågor...');
  console.log(`   Sektioner: ${SECTIONS.length}`);
  console.log(`   Versioner: ${VERSIONS.length}`);
  console.log(`   Totalt: ${SECTIONS.length * VERSIONS.length * 20} frågor\n`);

  const allQuestions: any[] = [];

  for (const section of SECTIONS) {
    for (const version of VERSIONS) {
      const questions = await generateQuestionsForSection(client, section, version, 20);
      allQuestions.push(...questions);
      
      // Rate limiting: vänta lite mellan requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // Spara till fil
  const outputFile = 'constants/hogskoleprovet-questions-generated.ts';
  const output = `// Auto-generated Högskoleprovsfrågor
// Genererad: ${new Date().toISOString()}

import { HPQuestion } from './hogskoleprovet';

export const GENERATED_HP_QUESTIONS: HPQuestion[] = ${JSON.stringify(allQuestions, null, 2)};
`;

  fs.writeFileSync(outputFile, output, 'utf-8');
  
  console.log(`\n✅ Generering klar!`);
  console.log(`   Totalt frågor: ${allQuestions.length}`);
  console.log(`   Sparad till: ${outputFile}`);
  console.log(`\n📝 Nästa steg:`);
  console.log(`   1. Importera GENERATED_HP_QUESTIONS i hogskoleprovet.ts`);
  console.log(`   2. Lägg till i HogskoleprovetContext.tsx`);
}

main().catch(console.error);
