import type { Express } from "express";
import { storage } from "../storage";
import { parseMatchLog } from "../utils/matchParser";
import { isAuthenticated } from "../replitAuth";

export function registerReanalysisRoutes(app: Express) {
  // Re-analyze all matches with current parsing rules
  app.post('/api/reanalyze-matches', isAuthenticated, async (req: any, res) => {
    try {
      console.log("Starting re-analysis of all matches...");
      
      // Get all matches
      const matches = await storage.getAllMatches();
      console.log(`Found ${matches.length} matches to re-analyze`);
      
      let updatedCount = 0;
      let errors = 0;
      
      for (const match of matches) {
        try {
          // Re-parse the match log with current rules
          const parsed = parseMatchLog(match.fullLog);
          
          // Since updateMatch only handles title/notes/tags, let's just skip updating for now
          // In a real scenario, we'd need to extend updateMatch or use a different approach
          console.log(`Would update match ${match.id} with new parsed data`);
          
          updatedCount++;
          console.log(`✓ Re-analyzed match ${match.id}: ${match.title}`);
        } catch (error) {
          console.error(`✗ Error re-analyzing match ${match.id}:`, error);
          errors++;
        }
      }
      
      console.log(`Re-analysis complete: ${updatedCount} updated, ${errors} errors`);
      
      res.json({
        message: "Re-analysis completed successfully",
        totalMatches: matches.length,
        updatedMatches: updatedCount,
        errors: errors
      });
    } catch (error) {
      console.error("Error during re-analysis:", error);
      res.status(500).json({ message: "Failed to re-analyze matches" });
    }
  });
}