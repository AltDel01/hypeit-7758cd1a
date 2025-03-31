
/**
 * Generates a reliable Unsplash URL based on the prompt
 */
export function generateUnsplashUrl(prompt: string): string {
  // Clean up the prompt
  const cleanPrompt = prompt.replace(/generate|post|wording:|image|attached|instagram story/gi, '');
  
  // Extract search terms
  const keyTerms = extractKeyTerms(cleanPrompt);
  const productType = extractProductType(cleanPrompt);
  const colorTerm = extractColorTerm(cleanPrompt);
  
  // Combine terms for better search results
  const searchTerms = combineSearchTerms(keyTerms, productType, colorTerm);
  
  // Add cache busting parameter
  const timestamp = Date.now();
  
  // Use high quality featured images
  return `https://source.unsplash.com/featured/800x800/?${encodeURIComponent(searchTerms)}&t=${timestamp}`;
}

/**
 * Extracts key terms from a prompt
 */
function extractKeyTerms(prompt: string): string {
  return prompt
    .split(' ')
    .filter(word => word.length > 3)
    .slice(0, 5)
    .join(',');
}

/**
 * Extracts product type from a prompt
 */
function extractProductType(prompt: string): string {
  const productMatch = prompt.match(/(?:skincare|makeup|serum|moisturizer|cleanser|toner|cream|lotion)/i);
  return productMatch ? productMatch[0] : 'product';
}

/**
 * Extracts color information from a prompt
 */
function extractColorTerm(prompt: string): string {
  const colorMatch = prompt.match(/(?:cream|white|black|blue|red|green|yellow|purple|pink|orange|brown|gray|grey)/i);
  return colorMatch ? colorMatch[0] : '';
}

/**
 * Combines search terms for better image results
 */
function combineSearchTerms(keyTerms: string, productType: string, colorTerm: string): string {
  const specificTerms = [productType, colorTerm, 'photography', 'premium']
    .filter(Boolean)
    .join(',');
  
  return specificTerms || keyTerms || 'skincare,product';
}
