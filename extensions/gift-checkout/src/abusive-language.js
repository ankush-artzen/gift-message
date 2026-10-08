import {AllProfanity} from 'allprofanity';

const filter = new AllProfanity({
  languages: ['english', 'hindi', 'french', 'german', 'spanish'],
  enableLeetSpeak: true,
  strictMode: true,
  silent: true,
});

/**
 * @param {string} message
 * @returns {boolean}
 */
export function containsAbusiveLanguage(message) {
  if (!message || !String(message).trim()) {
    return false;
  }

  return filter.check(String(message));
}
