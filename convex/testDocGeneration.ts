/**
 * Test script for document generation
 *
 * This file contains example data for testing the document generation functions.
 * You can run these in the Convex dashboard or use them as reference.
 */

// Example answers to test with
export const exampleAnswers = {
  q1: "A platform that helps companies see their carbon emissions across their entire supply chain.",
  q2: "Sustainability leads and ESG directors at large companies with complex, multi-input supply chains.",
  q3: "They want to be more sustainable but can't track emissions due to the volume of data involved.",
  q4: "They seek vendor support or make manual assumptions based on incomplete data.",
  q5: "Centralizes all supply chain data, collects emissions across every input, and cross-references with historical benchmark data.",
  q6: "Better decisions on sustainability, efficiency, supply chain predictability, and cost reduction.",
  q7: "There are a lot of competitors. Differentiation will be key to standing out.",
};

// Test user ID (use email or submission ID)
export const testUserId = "test@example.com";

/**
 * How to test in Convex Dashboard:
 *
 * 1. Go to your Convex dashboard (http://127.0.0.1:6790 for local)
 * 2. Navigate to "Functions" tab
 * 3. Find "documentGeneration:generateAllDocuments"
 * 4. Click "Run"
 * 5. Paste this JSON:
 *
 * {
 *   "userId": "test@example.com",
 *   "answers": {
 *     "q1": "A platform that helps companies see their carbon emissions across their entire supply chain.",
 *     "q2": "Sustainability leads and ESG directors at large companies with complex, multi-input supply chains.",
 *     "q3": "They want to be more sustainable but can't track emissions due to the volume of data involved.",
 *     "q4": "They seek vendor support or make manual assumptions based on incomplete data.",
 *     "q5": "Centralizes all supply chain data, collects emissions across every input, and cross-references with historical benchmark data.",
 *     "q6": "Better decisions on sustainability, efficiency, supply chain predictability, and cost reduction.",
 *     "q7": "There are a lot of competitors. Differentiation will be key to standing out."
 *   }
 * }
 *
 * 6. Click "Run function"
 * 7. Wait for completion (should take 10-30 seconds)
 * 8. Check the "Data" tab → "userDocuments" to see the saved metadata
 * 9. Check the "Storage" tab to see the actual files
 *
 * To retrieve documents:
 * 1. Go to Functions → "documents:getUserDocumentUrls"
 * 2. Run with: { "userId": "test@example.com" }
 * 3. You'll get URLs to download each document
 */
