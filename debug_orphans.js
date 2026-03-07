
import { db } from './src/lib/supabase.js';

async function findOrphanedActivities() {
    const subs = await db.getAll('subscriptions');
    const activities = await db.getAll('activities');
    const activityIds = new Set(activities.map(a => a.id));

    const orphaned = subs.filter(s => s.activityId && !activityIds.has(s.activityId));

    if (orphaned.length === 0) {
        console.log("No orphaned activities found.");
    } else {
        console.log("Found orphaned activity IDs:");
        const uniqueOrphanedIds = [...new Set(orphaned.map(o => o.activityId))];
        console.log(uniqueOrphanedIds);

        // Let's see some details
        orphaned.forEach(o => {
            console.log(`Sub ID: ${o.id}, Member: ${o.memberId}, Missing Activity ID: ${o.activityId}`);
        });
    }
}

findOrphanedActivities();
