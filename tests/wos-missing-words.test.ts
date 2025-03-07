import { test, describe, expect } from 'bun:test';
import { findAllMissingWords } from '../src/scripts/wos-missing-words';

describe('Words on Stream - Find Words by Letters', async () => {
  test('Find any words with the given letters', async () => {
    const letters = 'violence';
    const knownWords = [  "violence", "evince", "cloven", "novice", "niece", "clone", "olive", "voile", "coven", "liven", "clove",        
      "novel", "voice", "cone", "nice", "once", "cine", "lice", "lien", "line", "lion", "coin", "icon", "lino",       
      "loin", "coil", "loci", "love", "vole", "vine", "evil",
     "live", "nevi", "veil", "vile", "cove", "noel", "oven", 
      "vein", "even", "lone", "vice", "viol"]
    
    console.log(`Letters: ${letters}`);
    
    const missingWords = await findAllMissingWords(knownWords, letters);
    
    console.log(`Total missing words: ${missingWords.length}`);
    console.log(missingWords);

    // Assertions
  });
});

// Helper function to count letter occurrences
function countLetters(word: string): Record<string, number> {
  return word.split('').reduce((counts, letter) => {
    counts[letter] = (counts[letter] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);
}
