import json

data = {
  "A": {
    "title": "Dopamine Hijacking",
    "color": "#ff4d4d",
    "cells": [
      "Wake Up Phone Pick", "Infinite Scroll Apps", "Background Video Noise",
      "Notification Triggers", "DOPAMINE HIJACKING", "Post-Scroll Guilt",
      "Hidden Reddit Binge", "Bedtime Screen Use", "Algorithmic Comparison"
    ],
    "why": "As a filmmaker and video editor, your visual processing and attention span are your literal tools of production. Every minute spent running through high-speed short-form video algorithms strips away your ability to hold a complex, multi-layered timeline or screenplay arc in your working memory. You are training your brain to seek a cut every 3 seconds, making long-form engineering synthesis or film editing feel physically painful.",
    "how": "The Environmental Quarantine: Your phone must not exist within arm's reach when you wake up or when you study for finals. Put it in another room.\n\nFriction Scaling: Delete all leisure apps from your editing workstation machine. If you must use social media for agency outbound, do it through desktop platforms with newsfeed-blocking extensions enabled."
  },
  "B": {
    "title": "Escapist Mind",
    "color": "#ff1a66", 
    "cells": [
      "The Perfect Vision Trap", "Future Argument Loop", "Scripting Without Base",
      "Paralysis by Analysis", "ESCAPIST MIND", "Instant Goal Grabbing",
      "Past Mistake Replay", "Waiting for Inspiration", "No-Action Planning"
    ],
    "why": "You are an aspiring director, which means your imagination is incredibly highly active. However, when you use that imagination to daydream about winning entry to USC or running a high-revenue agency instead of writing the text or sending the pitch, your brain receives a counterfeit dopamine reward. You experience the emotional high of success without the underlying labor, making the reality of your current 2nd-year position look unbearable.",
    "how": "Physical Bias to Action: The second you catch yourself pacing and daydreaming about a future state, you must force a physical micro-action. Write one sentence, solve one ECE network loop, or drop and do 20 pushups. Break the mental projection with raw physical presence.\n\nThe \"Script to Execution\" Lock: No planning sessions without a blank document open for immediate, active drafting. If you aren't actively logging items, the session is banned."
  },
  "C": {
    "title": "The Low-Value Loop",
    "color": "#ff6600", 
    "cells": [
      "Late-Night Loneliness", "Private Tab Access", "Visual Overstimulation",
      "Immediate Reset State", "THE LOW-VALUE LOOP", "Deep Self-Loathing",
      "Energy Drainage Cycle", "Escaping Stress/Fatigue", "Post-Relapse Sludge"
    ],
    "why": "This habit strips your psychological drive of its edge. It satisfies your hardwired survival and conquest impulses with a digital fiction. For an individual trying to execute a high-stakes, 24-month independent business sprint under heavy pressure, losing this raw energy means you lose the aggressive confidence needed to handle direct client negotiation and face rejection without shattering.",
    "how": "The Stress Link Fix: Notice that your handwritten note connects Brain Sludge/Music/Guilt. You are using low-tier sensory consumption to numb stress loops. When a task gets difficult or an exam feels overwhelming, do not retreat to private windows. Sit directly in the discomfort.\n\nStrict Digital Boundaries: DNS-level adult content blockers must be deployed across your home routers and devices. Treat your bedroom strictly as a clean zone for deep rest and academic study."
  },
  "D": {
    "title": "Fake Self-Improvement Loop",
    "color": "#ff3399", 
    "cells": [
      "Video/Podcast Overdose", "Notebook Strategy Only", "Tool Hoarding (Apps)",
      "Ideation Without Code", "FAKE SELF-IMPROVEMENT", "Intellectual Vanity",
      "Buying Unused Courses", "Talking About the Plan", "The Tomorrow Delusion"
    ],
    "why": "Your notebooks are beautiful and highly structured, but a strategy document is not currency. This loop tricks you into thinking you are making operational progress because you are reading about high-performance habits, Ohtani matrices, or agency scaling mechanics. It lets you feel superior to your peers while your active client conversion rate and your exam preparation remain at absolute zero.",
    "how": "The 1:5 Consumption-to-Execution Ratio: For every 10 minutes of self-improvement content you read or view, you must complete 50 minutes of raw, unglamorous production (editing video drafts, solving formulas, writing clean scripts).\n\nThe Production Metric: Measure your daily value strictly by what you completed and shipped, never by what you learned or intended to plan."
  },
  "E": {
    "title": "THE CENTRAL REJECTION CORE",
    "color": "#ff0000", 
    "cells": [
      "Dopamine Hijacking (Block A)", "Escapist Mind (Block B)", "The Low-Value Loop (Block C)",
      "Fake Self-Improvement (Block D)", "ACT 2 REJECTION (THE TRAP)", "Physical Friction (Block F)",
      "Isolation & FOMO (Block G)", "The Retention Killer (Block H)", "System Fractures (Block I)"
    ],
    "why": "The absolute anchor of inversion. If the center tile (Act 2 Rejection) is triggered by your actions, you automatically drop down into these 8 structural failure states.",
    "how": "Kill the surrounding 8 blocks to secure the core."
  },
  "F": {
    "title": "Physical Friction",
    "color": "#ff8533", 
    "cells": [
      "Out-of-Sync Bedtimes", "Skips Daily Showers", "Messy, Unmade Workspace",
      "Heavy Morning Grogginess", "PHYSICAL FRICTION", "Delayed Dental Care",
      "Screen Glare at 3 AM", "Dehydration Migraines", "Uniform Sweats/Slouch"
    ],
    "why": "You explicitly noted Brain Fog/Brain Sludge -> (Lacks Routine). Brain fog is not a mysterious emotional state; it is a direct biological consequence of erratic circadian rhythms and low baseline physical self-respect. If you face your engineering finals or client pitch assignments with a sleep-deprived, unwashed system, your working memory capacity drops significantly, rendering you completely unable to solve complex technical tasks.",
    "how": "The Fixed Anchored Wake Time: Wake up at the exact same hour every single day, including weekends, regardless of when you fell asleep. This sets your biological clock.\n\nThe Dressing Protocol: Shower and put on a clean, professional shirt before you touch your computer keyboard or open an ECE textbook. Treat your home desk as a professional workspace."
  },
  "G": {
    "title": "Isolation & FOMO",
    "color": "#ff6666", 
    "cells": [
      "Story / Status Stalking", "Peer Milestone Jealousy", "Ghosting Real Contacts",
      "Digital Envy Spirals", "ISOLATION & FOMO", "Silent Social Retreat",
      "Rejecting Local Allies", "The \"Nobody Knows\" Myth", "Parasocial Video Binge"
    ],
    "why": "When you isolate yourself in a room with unmanaged internet access, you begin comparing your raw internal struggles with the highly curated external highlight reels of old classmates. This triggers an acute sense of missing out, which saps your motivation. You begin to feel that your 24-month roadmap is too long, causing you to look for quick fixes that ruin your long-term consistency.",
    "how": "Complete Feed Blindness: Use software extensions to systematically block status updates, stories, and feeds across your communication channels.\n\nThe Local Reality Check: Remember that your immediate family and real peers are your essential baseline network. Engage cleanly and honestly in short, real-world human interactions daily to break your mental echo chamber."
  },
  "H": {
    "title": "The Retention Killer",
    "color": "#e65c00", 
    "cells": [
      "High Sugar / Low Water", "Overplaying Hype Music", "Extended Screen Stare",
      "Heavy Cognitive Stalls", "THE RETENTION KILLER", "Constant Task-Switching",
      "Unmanaged Mental Loops", "Zero Physical Sunlight", "Processing Slowdowns"
    ],
    "why": "You explicitly highlighted Brain Sludge/Music/Guilt. You are using high-tempo music or sensory input to artificially stimulate a brain that is exhausted from task-switching and poor habits. This creates a state of active exhaustion where you feel incredibly busy but produce nothing of value. It makes memorizing ECE parameters or formatting script subtext absolutely impossible.",
    "how": "The Silent Work Block: Perform your first two hours of daily execution (study or editing work) in complete and absolute silence. No background tracks, no podcasts, no artificial noise. Retrain your brain to focus on internal logic.\n\nSunlight Input: Step directly outside for 10 minutes immediately upon waking to stop melatonin production and clear out morning grogginess cleanly."
  },
  "I": {
    "title": "System Fractures",
    "color": "#ff00ff", 
    "cells": [
      "Drop-Off at First No", "Missing One Day Panic", "Continuous Reset Cycle",
      "Half-Finished Project", "SYSTEM FRACTURES", "Chasing New Niches",
      "Giving Up on Bad Days", "Blaming the Framework", "Avoiding Cold Metrics"
    ],
    "why": "The operational habit of abandoning an outreach channel or study system the exact moment it meets friction.",
    "how": "One Win Per Day: Do not try to be perfect. Execute ONE critical action every single day without exception. Build momentum from the dirt up."
  }
}

output = "export const antiMandalaData = {\n"
for b_id in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']:
    block = data[b_id]
    output += f'  "{b_id}": {{\n'
    output += f'    title: {json.dumps(block["title"])},\n'
    output += f'    color: "{block["color"]}",\n'
    output += f'    cells: [\n'
    
    for i, cell_title in enumerate(block["cells"]):
        cell_id = f"{b_id}{i+1}"
        steps = [
            "WHY IT DESTROYS PROGRESS:",
            block["why"],
            "",
            "HOW TO KILL IT:",
            block["how"]
        ]
        output += f'      {{\n'
        output += f'        id: "{cell_id}",\n'
        output += f'        title: {json.dumps(cell_title)},\n'
        output += f'        steps: {json.dumps(steps)}\n'
        output += f'      }}{"," if i < 8 else ""}\n'
        
    output += f'    ]\n'
    output += f'  }}{"," if b_id != "I" else ""}\n'
output += "};\n"

with open("anti_data.js", "w", encoding="utf-8") as f:
    f.write(output)

print("done")
