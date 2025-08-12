import { db } from '../server/db.js';
import { matches } from '../shared/schema.js';
import { parseMatchLog } from '../server/utils/matchParser.js';
import { eq } from 'drizzle-orm';

async function reparseAllMatches() {
  console.log('🔄 Starting re-parse of all matches with corrected win condition logic...');
  
  try {
    // Get all matches
    const allMatches = await db.select().from(matches);
    let updatedCount = 0;
    let errorCount = 0;
    
    console.log(`Found ${allMatches.length} matches to re-parse`);
    
    for (const match of allMatches) {
      try {
        // Re-parse the match log with corrected logic
        const parsed = parseMatchLog(match.fullLog);
        
        // Update the match with new win condition
        await db
          .update(matches)
          .set({
            winCondition: parsed.winCondition,
          })
          .where(eq(matches.id, match.id));
        
        updatedCount++;
        console.log(`✅ Updated ${match.player1} vs ${match.player2} - Win condition: ${parsed.winCondition}`);
        
        // Show the old vs new for debugging
        if (match.winCondition !== parsed.winCondition) {
          console.log(`   📝 Changed from "${match.winCondition}" to "${parsed.winCondition}"`);
        }
        
      } catch (error) {
        console.error(`❌ Error re-parsing match ${match.id}:`, error);
        errorCount++;
      }
    }
    
    console.log('\n✨ Re-parse complete!');
    console.log(`✅ Successfully updated: ${updatedCount} matches`);
    console.log(`❌ Errors: ${errorCount} matches`);
    console.log(`📊 Total: ${allMatches.length} matches processed`);
    
  } catch (error) {
    console.error('💥 Fatal error during re-parse:', error);
  } finally {
    process.exit(0);
  }
}

reparseAllMatches();