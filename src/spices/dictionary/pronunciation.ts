import needle, { NeedleOptions } from 'needle';

import { SPICE_BASE } from '../../util';

export type DictionaryPronunciationType = 'ahd-5' | 'arpabet' | 'gcide-diacritical' | 'IPA';

/**
 * The result from the dictionary pronunciation spice.
 * @see https://developer.wordnik.com/docs#!/word/getTextPronunciations
 */
export interface DictionaryPronunciationResult {
  seq: number;
  raw: string;
  rawType: DictionaryPronunciationType;
  id: string;
  attributionText: string;
  attributionUrl: string;
}

/**
 * Get text pronunciations of a word.
 * Data provided by Wordnik.
 * @category Spice
 * @see https://www.wordnik.com/
 * @param word The word to define
 * @param needleOptions The options for the HTTP request
 * @returns The dictionary pronunciation result
 */
export async function dictionaryPronunciation(word: string, needleOptions?: NeedleOptions): Promise<DictionaryPronunciationResult[]> {
  if (!word) throw new Error('Word cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/dictionary/pronunciation/${word}`, needleOptions);
  if (response.body.toString() === 'ddg_spice_dictionary_pronunciation();\n') return [];
  return response.body;
}
