import { generateText } from '@rork-ai/toolkit-sdk';
import * as FileSystem from 'expo-file-system';

export async function extractTextFromImage(imageUri: string): Promise<string> {
  console.log('📸 [Vision AI] Starting text extraction from image:', imageUri);
  
  try {
    let base64Image: string;
    
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri;
    } else if (imageUri.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });
      base64Image = `data:image/jpeg;base64,${base64}`;
    } else {
      base64Image = imageUri;
    }

    console.log('📡 [Vision AI] Sending image to AI for text extraction...');
    
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
              text: 'Extrahera all text från denna bild. Om det är handskrivet, gör ditt bästa för att läsa det. Returnera ENDAST texten utan några förklaringar eller kommentarer. Om ingen text finns, svara "Ingen text hittades".',
            },
          ],
        },
      ],
    });

    console.log('✅ [Vision AI] Text extraction complete, length:', extractedText.length);
    
    if (extractedText.includes('Ingen text hittades') || extractedText.trim().length < 5) {
      throw new Error('Ingen text kunde läsas från bilden');
    }

    return extractedText.trim();
  } catch (error: any) {
    console.error('❌ [Vision AI] Text extraction failed:', error);
    throw new Error(error?.message || 'Kunde inte extrahera text från bilden');
  }
}

export async function analyzeImageForFlashcards(imageUri: string): Promise<{
  text: string;
  suggestions: string[];
}> {
  console.log('🔍 [Vision AI] Analyzing image for flashcard generation');
  
  try {
    let base64Image: string;
    
    if (imageUri.startsWith('data:')) {
      base64Image = imageUri;
    } else if (imageUri.startsWith('file://')) {
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: 'base64' as any,
      });
      base64Image = `data:image/jpeg;base64,${base64}`;
    } else {
      base64Image = imageUri;
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

1. Extrahera all viktig text och information
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

    return { text, suggestions };
  } catch (error: any) {
    console.error('❌ [Vision AI] Image analysis failed:', error);
    throw new Error(error?.message || 'Kunde inte analysera bilden');
  }
}
