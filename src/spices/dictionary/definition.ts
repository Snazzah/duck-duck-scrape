import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../../util';

export type DictionaryDefinitionPartOfSpeech =
  | 'noun'
  | 'adjective'
  | 'verb'
  | 'adverb'
  | 'interjection'
  | 'pronoun'
  | 'preposition'
  | 'abbreviation'
  | 'affix'
  | 'article'
  | 'auxiliary-verb'
  | 'conjunction'
  | 'definite-article'
  | 'family-name'
  | 'given-name'
  | 'idiom'
  | 'imperative'
  | 'noun-plural'
  | 'noun-posessive'
  | 'past-participle'
  | 'phrasal-prefix'
  | 'proper-noun'
  | 'proper-noun-plural'
  | 'proper-noun-posessive'
  | 'suffix'
  | 'verb-intransitive'
  | 'verb-transitive';

export interface DictionaryDefinitionExampleUse {
  text: string;
}

export interface DictionaryDefinitionRelatedWord {
  relationshipType: 'synonym' | 'antonym';
  words: string[];
}

export interface DictionaryDefinitionLabel {
  text: string;
  type: string;
}

export interface DictionaryDefinitionCitation {
  source: string;
  cite: string;
}

/**
 * The result from the dictionary definition spice.
 * @see https://developer.wordnik.com/docs#!/word/getDefinitions
 */
export interface DictionaryDefinitionResult {
  id?: string;
  partOfSpeech?: DictionaryDefinitionPartOfSpeech;
  attributionText: string;
  sourceDictionary: string;
  text?: string;
  sequence: string;
  score: number;
  labels: DictionaryDefinitionLabel[];
  citations: DictionaryDefinitionCitation[];
  word: string;
  relatedWords: DictionaryDefinitionRelatedWord[];
  exampleUses: DictionaryDefinitionExampleUse[];
  textProns: any[];
  notes: any[];
  attributionUrl: string;
  wordnikUrl: string;
}

/**
 * Get definitions of a word.
 * Data provided by Wordnik.
 * @category Spice
 * @see https://www.wordnik.com/
 * @param word The word to define
 * @param needleOptions The options for the HTTP request
 * @returns The dictionary definition result
 */
export async function dictionaryDefinition(word: string, needleOptions?: NeedleOptions): Promise<DictionaryDefinitionResult[]> {
  if (!word) throw new Error('Word cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/dictionary/definition/${word}`, needleOptions);
  if (response.body.toString() === 'ddg_spice_dictionary_definition();\n') return [];
  const result = parseSpiceBody(response.body) as DictionaryDefinitionResult[];

  return result;
}
