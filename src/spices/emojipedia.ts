import needle, { NeedleOptions } from 'needle';

import { parseSpiceBody, SPICE_BASE } from '../util';

/** An emoji crossref. */
export interface EmojipediaCrossref {
  /** The raw emoji */
  emoji: string;
  /** The name of the emoji */
  name: string;
  /** The URL of the emoji */
  permalink: string;
}

/**
 * The result from the emojipedia spice.
 */
export interface EmojipediaResult {
  /** The raw emoji */
  emoji: string;
  /** The emoji codepoints */
  codepoints: string[];
  /** The name of the emoji */
  name: string;
  /** The description of the emoji */
  description: string;
  /** The preview image of the emoji */
  image: string;
  /** The URL of the emoji */
  permalink: string;
  /** The aliases of the emoji */
  aliases: string[];
  /** The cross references of this emoji */
  crossref: EmojipediaCrossref[];
  /** Each image of the emoji by vendor */
  vendor_images: {
    [vendor: string]: string;
  };
}

/**
 * Get information on an emoji.
 * Data provided by Emojipedia.
 * @category Spice
 * @see https://emojipedia.org/
 * @param emoji The emoji to use
 * @param needleOptions The options for the HTTP request
 * @since v2.2.0
 * @returns The emojipedia result
 */
export async function emojipedia(emoji: string, needleOptions?: NeedleOptions): Promise<EmojipediaResult> {
  if (!emoji) throw new Error('Emoji cannot be empty!');

  const response = await needle('get', `${SPICE_BASE}/emojipedia/${emoji}`, needleOptions);
  const result = parseSpiceBody(response.body) as EmojipediaResult;

  return result;
}
