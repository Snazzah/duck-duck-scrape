import needle, { NeedleOptions } from 'needle';
import { parseSpiceBody, SPICE_BASE } from '../util';

/** A list of synonyms and antonyms. */
export interface ThesaurusList {
  syn?: string[];
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
 * @param word The word to define
 * @param needleOptions The options for the HTTP request
 * @returns The thesaurus result
 */
export async function thesaurus(word: string, needleOptions?: NeedleOptions): Promise<ThesaurusResult> {
  if (!word) throw new Error('Word cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/thesaurus/${word}`, needleOptions);
  const result = parseSpiceBody(response.body) as ThesaurusResult;

  return result;
}
