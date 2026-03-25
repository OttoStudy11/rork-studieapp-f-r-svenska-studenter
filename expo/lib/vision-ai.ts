import { generateText } from '@rork-ai/toolkit-sdk';
import * as FileSystem from 'expo-file-system';

export async function extractTextFromImage(imageUri: string): Promise<string> {
  console.log('📸 [Vision AI] Starting text extraction from image:', imageUri);
  
  try {
    let base64Image: string;
    
    // Format as data URL for the AI
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri;
    } else if (imageUri.startsWith('file://')) {
      console.log('📁 [Vision AI] Reading file from:', imageUri);
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });
      base64Image = `data:image/jpeg;base64,${base64}`;
    } else {
      // Assume it's already base64, add data URL prefix
      base64Image = `data:image/jpeg;base64,${imageUri}`;
    }

    console.log('📡 [Vision AI] Sending image to AI for text extraction...');
    console.log('📏 [Vision AI] Base64 length:', base64Image.length);
    
    const extractedText = await generateText({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: base64Image,
            },
            {
              type: 'text',
              text: `Du är en expert på att läsa text från bilder (OCR). 
              
Din uppgift är att extrahera ALL text från bilden, inklusive:
- Skriven text (även handskriven)
- Text i tabeller och diagram
- Rubriker och underrubriker
- Punktlistor och numrerade listor
- Matematiska formler och ekvationer
- Alla synliga ord

Regler:
1. Skriv ut HELA texten exakt som den ser ut
2. Bevara struktur (nya rader, stycken)
3. Om texten är suddig eller svår att läsa, gör ditt bästa
4. Om bilden innehåller diagram eller illustrationer, beskriv vad de visar
5. Inkludera ALL text - även små detaljer

Svara ENDAST med den extraherade texten, inga kommentarer.`,
            },
          ],
        },
      ],
    });

    console.log('✅ [Vision AI] Text extraction complete');
    console.log('📝 [Vision AI] Extracted text:', extractedText.substring(0, 200) + '...');
    console.log('📏 [Vision AI] Extracted text length:', extractedText.length);
    
    const trimmedText = extractedText.trim();
    
    if (trimmedText.length < 10) {
      console.warn('⚠️ [Vision AI] Very short text extracted:', trimmedText);
      throw new Error('Bilden innehåller för lite text. Försök med en tydligare bild.');
    }

    return trimmedText;
  } catch (error: any) {
    console.error('❌ [Vision AI] Text extraction failed:', error);
    console.error('❌ [Vision AI] Error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    throw new Error(error?.message || 'Kunde inte extrahera text från bilden. Försök med en tydligare bild.');
  }
}

export async function analyzeImageForFlashcards(imageUri: string): Promise<{
  text: string;
  suggestions: string[];
}> {
  console.log('🔍 [Vision AI] Analyzing image for flashcard generation');
  
  try {
    let base64Image: string;
    
    // Format as data URL for the AI
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri;
    } else if (imageUri.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });
      base64Image = `data:image/jpeg;base64,${base64}`;
    } else {
      // Assume it's already base64, add data URL prefix
      base64Image = `data:image/jpeg;base64,${imageUri}`;
    }

    const result = await generateText({
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              image: base64Image,
            },
            {
              type: 'text',
              text: `Analysera denna bild för att skapa flashcards. 

1. Extrahera all viktig text och information från bilden
2. Identifiera nyckelkoncept som skulle vara bra för flashcards
3. Lista 3-5 förslag på ämnesområden

Svara i formatet:
TEXT: [all extraherad text här]
FÖRSLAG: [förslag 1], [förslag 2], [förslag 3]`,
            },
          ],
        },
      ],
    });

    console.log('✅ [Vision AI] Analysis complete, parsing result...');
    
    const lines = result.split('\n');
    let text = '';
    let suggestions: string[] = [];

    for (const line of lines) {
      if (line.startsWith('TEXT:')) {
        text = line.substring(5).trim();
      } else if (line.startsWith('FÖRSLAG:')) {
        suggestions = line
          .substring(8)
          .split(',')
          .map(s => s.trim())
          .filter(s => s.length > 0);
      }
    }

    if (!text || text.length < 10) {
      text = result;
    }

    console.log('📝 [Vision AI] Extracted text length:', text.length);
    console.log('💡 [Vision AI] Suggestions count:', suggestions.length);

    return { text, suggestions };
  } catch (error: any) {
    console.error('❌ [Vision AI] Image analysis failed:', error);
    throw new Error(error?.message || 'Kunde inte analysera bilden');
  }
}
