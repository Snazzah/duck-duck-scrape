import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/** A list of synonyms and antonyms. */
export interface ThesaurusList {
  /** The synonyms of this word */
  syn?: string[];
  /** The antonyms of this word */
  ant?: string[];
}

/**
 * The result from the thesaurus spice.
 */
export interface ThesaurusResult {
  [type: string]: ThesaurusList;
}

/**
 * Get synonyms and antonyms of a word.
 * Data provided by Big Huge Thesaurus.
 * @category Spice
 * @see https://words.bighugelabs.com/
 * @param word The word to define
 * @param needleOptions The options for the HTTP request
 * @since v2.2.0
 * @returns The thesaurus result
 */
export async function thesaurus(word: string, needleOptions?: NeedleOptions): Promise<ThesaurusResult | null> {
  if (!word) throw new Error('Word cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/thesaurus/${word}`, needleOptions);
  if (response.body.toString() === 'ddg_spice_thesaurus();\n') return null;
  const result = parseSpiceBody(response.body) as ThesaurusResult;

  return result;
}
