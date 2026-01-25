import natural from "natural";

/**
 * Advanced Duplicate Detection Logic
 * @param {string} newProductName - Name of the product being checked
 * @param {Array} existingItems - Array of existing inventory items (must contain productName)
 * @returns {Object|null} - Best match object or null if no duplicate
 */
export const findDuplicateProduct = (newProductName, existingItems) => {
  if (!existingItems || existingItems.length === 0) return null;

  const { PorterStemmer, LevenshteinDistance, TfIdf } = natural;

  // Helper: Normalize and stem text
  const normalizeAndStem = (text) => {
    return text
      .toLowerCase()
      .split(/\s+/)
      .map((word) => PorterStemmer.stem(word))
      .filter((word) => word.length > 2);
  };

  // Helper: Calculate cosine similarity using TF-IDF vectors
  const calculateCosineSimilarity = (tfidf, docIndex1, docIndex2) => {
    const terms1 = {};
    const terms2 = {};

    tfidf.listTerms(docIndex1).forEach((item) => {
      terms1[item.term] = item.tfidf;
    });

    tfidf.listTerms(docIndex2).forEach((item) => {
      terms2[item.term] = item.tfidf;
    });

    // Get all unique terms
    const allTerms = new Set([
      ...Object.keys(terms1),
      ...Object.keys(terms2),
    ]);

    // Calculate dot product and magnitudes
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    allTerms.forEach((term) => {
      const val1 = terms1[term] || 0;
      const val2 = terms2[term] || 0;
      dotProduct += val1 * val2;
      magnitude1 += val1 * val1;
      magnitude2 += val2 * val2;
    });

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;
    return dotProduct / (magnitude1 * magnitude2);
  };

  // Normalize new product name
  const newProductStemmed = normalizeAndStem(newProductName);
  // const newProductNormalized = newProductName.trim().toLowerCase();

  // Build TF-IDF corpus
  const tfidf = new TfIdf();
  existingItems.forEach((p) => {
    const stemmed = normalizeAndStem(p.productName);
    tfidf.addDocument(stemmed.join(" "));
  });
  tfidf.addDocument(newProductStemmed.join(" "));
  const newDocIndex = existingItems.length;

  let bestMatch = null;
  let highestSimilarity = 0;

  // Multi-layer detection
  for (let i = 0; i < existingItems.length; i++) {
    const existing = existingItems[i];
    const existingStemmed = normalizeAndStem(existing.productName);
    
    // LAYER 1: Exact match after stemming
    const stemmedMatch =
      newProductStemmed.join(" ") === existingStemmed.join(" ");

    // LAYER 2: Levenshtein distance
    let minLevenshteinDist = Infinity;
    let bestWordMatch = "";

    newProductStemmed.forEach((newWord) => {
      existingStemmed.forEach((existingWord) => {
        const dist = LevenshteinDistance(newWord, existingWord);
        if (dist < minLevenshteinDist) {
          minLevenshteinDist = dist;
          bestWordMatch = existingWord;
        }
      });
    });

    const isTypo = minLevenshteinDist <= 2 && minLevenshteinDist > 0;
    const typoSimilarity = isTypo
      ? Math.round(
          (1 - minLevenshteinDist / Math.max(3, bestWordMatch.length)) * 100,
        )
      : 0;

    // LAYER 3: Cosine similarity
    const cosineSim = calculateCosineSimilarity(tfidf, newDocIndex, i);

    let isDuplicate = false;
    let detectionMethod = "";
    let finalSimilarity = 0;

    if (stemmedMatch) {
      isDuplicate = true;
      detectionMethod = "Exact Match (Stemmed)";
      finalSimilarity = 100;
    } else if (isTypo) {
      isDuplicate = true;
      detectionMethod = "Typo Detection";
      finalSimilarity = typoSimilarity;
    } else if (cosineSim >= 0.35) {
      isDuplicate = true;
      detectionMethod = "Semantic Similarity";
      finalSimilarity = Math.round(cosineSim * 100);
    }

    if (isDuplicate && finalSimilarity > highestSimilarity) {
      highestSimilarity = finalSimilarity;
      bestMatch = {
        existingItem: existing,
        similarity: finalSimilarity,
        detectionMethod,
      };
    }
  }

  return bestMatch;
};
