export function extractHashtags(text = '') {
  return [...new Set((text.match(/#[\w]+/g) || []).map((tag) => tag.toLowerCase()))];
}

export function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined));
}
