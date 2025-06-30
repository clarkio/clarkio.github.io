// import localDictionary from './wos_dictionary.json';
let wosDictionary: string[]; // = localDictionary as string[];

export async function updateWosDictionary(word: string) {
  try {
    if (wosDictionary && wosDictionary.includes(word)) {
      console.log(`Word "${word}" already exists in the WOS dictionary.`);
      return;
    }

    const url = 'https://clarkio.com/wos-dictionary';
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ word }),
    });

    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
    }

    console.log(`Successfully updated dictionary with word: ${word}`);
    wosDictionary.push(word);
    return response.json();
  } catch (error) {
    console.error('Error updating WOS dictionary:', error);
    throw error;
  }
}

export async function loadWosDictionary() {
  try {
    // Use a CORS proxy for local development
    const url = 'https://clarkio.com/wos-dictionary';

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const wordsJson = await response.json();
    wosDictionary = wordsJson.map(word => word.trim());
    console.log('WOS Dictionary loaded:', wosDictionary.length, 'words');
  } catch (error) {
    console.error('Error loading WOS dictionary:', error);
  }
}

export function findAllMissingWords(knownWords: string[], knownLetters: string, minLength: number): string[] {
  // Find all possible words that can be formed from knownLetters
  // and filter out words that are already known
  const possibleWords = findWosWordsByLetters(knownLetters, minLength);
  console.log('Possible words:', possibleWords);
  const tempMissingWords = findMissingWordsFromList(knownWords, possibleWords);
  const missingWords = tempMissingWords.filter(word => word.length >= minLength);
  console.log('Missing words:', missingWords);
  return missingWords;
}

/**
 * Finds words in dictionaryWords that are not present in knownWords
 * @param knownWords Array of words already known
 * @param dictionaryWords Array of words to check against
 * @returns Array of words from dictionaryWords that are not in knownWords
 */
function findMissingWordsFromList(knownWords: string[], dictionaryWords: string[]): string[] {
  // Create a Set of knownWords for efficient lookup
  const knownWordsSet = new Set(knownWords.map(word => word.toLowerCase()));

  // Filter dictionaryWords to find words not in knownWordsSet
  return dictionaryWords.filter(word => !knownWordsSet.has(word.toLowerCase()));
}

/**
 * Finds all possible words from wosWords that can be formed using the given letters
 * @param letters The letters available to form words
 * @param length Optional parameter to filter words by exact length
 * @returns Array of words sorted by length (longest first)
 */
function findWosWordsByLetters(letters: string, length?: number): string[] {
  // Create a map to track letter frequencies in the input
  const letterFrequency: { [key: string]: number } = {};
  letters = letters.toLowerCase();

  for (const char of letters) {
    letterFrequency[char] = (letterFrequency[char] || 0) + 1;
  }

  // Filter words that can be formed from the given letters
  let possibleWords = (wosDictionary as string[]).filter((word) => {
    // Create a copy of the letter frequency map for each word check
    const availableLetters = { ...letterFrequency };

    for (const char of word.toLowerCase()) {
      // If the character isn't available or has been used up, word can't be formed
      if (!availableLetters[char]) {
        return false;
      }
      availableLetters[char]--;
    }

    return true;
  });

  // Filter by length if specified
  if (length !== undefined) {
    possibleWords = possibleWords.filter(word => word.length >= length);
  } else {
    // Words on stream only uses words with 4 or more letters
    possibleWords = possibleWords.filter(word => word.length > 3);
  }

  // Remove duplicates by converting to a Set and back to an array
  possibleWords = Array.from(new Set(possibleWords.map(word => word.toLowerCase())));

  // Sort words by length (descending)
  return possibleWords.sort((a, b) => b.length - a.length);
}
