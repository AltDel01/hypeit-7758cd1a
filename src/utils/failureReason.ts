/**
 * Present a generation failure reason to the user. Anything that looks like
 * a raw provider payload (URLs, JSON, error codes) is replaced with a
 * friendly generic message so internals never leak into the UI.
 */
export function displayFailureReason(reason: string | null | undefined): string {
  if (!reason) return 'Generation failed. Please try again.';
  const r = reason.trim();
  const looksRaw =
    /https?:\/\//i.test(r) ||
    /[{}"\\]/.test(r) ||
    /oss-|aliyuncs|dashscope|signature=|accesskeyid/i.test(r) ||
    /invalidparameter|datainspection|invalidapikey|internal_name/i.test(r) ||
    r.length > 220;
  if (looksRaw) {
    if (/resolution|too small/i.test(r)) {
      return 'The reference image is too small. Please upload a larger image (at least 240x240) and try again.';
    }
    return 'Generation failed. Please try again.';
  }
  return r;
}
