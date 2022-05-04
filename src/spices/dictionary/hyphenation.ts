import needle, { NeedleOptions } from 'needle';

import { SPICE_BASE } from '../../util';

export type DictionaryHyphenationType = 'stress' | 'secondary stress';

/**
 * The result from the dictionary hyphenation spice.
 * @see https://developer.wordnik.com/docs#!/word/getHyphenation
 */
export interface DictionaryHyphenationResult {
  text: string;
  seq: number;
  type?: DictionaryHyphenationType;
}

/**
 * Get word syllables.
 * Data provided by Wordnik.
 * @category Spice
 * @see https://www.wordnik.com/
 * @param word The word to define
 * @param needleOptions The options for the HTTP request
 * @returns The dictionary hyphenation result
 */
export async function dictionaryHyphenation(word: string, needleOptions?: NeedleOptions): Promise<DictionaryHyphenationResult[]> {
  if (!word) throw new Error('Word cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/dictionary/hyphenation/${word}`, needleOptions);
  if (response.body.toString() === 'ddg_spice_dictionary_hyphenation();\n') return [];
  return response.body;
}
