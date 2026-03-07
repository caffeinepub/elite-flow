# Elite Flow

## Current State
The workspace has a prior Elite Flow build in `.old/`. This is a full rebuild from scratch with a clean, stable architecture.

## Requested Changes (Diff)

### Add
- Internet Identity authentication with landing page gate
- Landing page: Elite Flow logo, "Level Up Your Life" headline, description, Sign Up / Login buttons
- Founder system: first principal to register becomes permanent Founder; Founder badge on profile and chat tags
- Dashboard shell that renders immediately after login (no blank screen)
- Habit Tracker: add habits, mark complete daily, track streaks
- Task Manager: add tasks, mark complete, track productivity (completed count)
- Cash Flow System: input Income, Expenses, Savings, Investments; percentage distribution pie/bar chart
- Community System with three sections:
  - Announcements (Founder-only post, all read)
  - General Chat (all users)
  - Direct Messages (private 1-to-1)
- Profile Page: upload profile picture, change username, display Founder badge
- Gamification: XP system (habit complete = +10 XP, task complete = +20 XP), level thresholds (L1: 0-100, L2: 100-300, L3: 300-600, L4: 600-1000, L5: 1000-1500), Solo Leveling style level progress bar on dashboard, level-up popup notification
- Initial loading screen (HTML-level, no blank frame)

### Modify
- Full rebuild: all backend and frontend code replaced

### Remove
- Old architecture (replaced by clean rebuild)

## Implementation Plan

**Backend (Motoko)**
1. User profile store: principal → { username, avatarUrl, xp, level, isFounder, createdAt }
   - First caller of `registerUser` sets isFounder = true
2. Habit store: habitId, userId, name, completedDates (array of date strings), streak
   - `completeHabit` awards +10 XP
3. Task store: taskId, userId, title, completed, createdAt
   - `completeTask` awards +20 XP
4. Cash Flow store: userId → { income, expenses, savings, investments }
5. Community store:
   - Announcements: array of { id, authorId, text, timestamp }; only Founder can post
   - General messages: array of { id, authorId, text, timestamp }
   - DMs: map of (senderId, recipientId) → messages array
6. XP/Level helper: pure function mapping XP to level
7. Profile picture stored as base64 data URL in profile (small images only)

**Frontend**
1. `index.html` with inline CSS loading screen (Elite Flow logo, "Loading Elite Flow...", pink-purple gradient)
2. `App.tsx`: auth gate — show Landing page if not authenticated, Dashboard if authenticated
3. Landing page: logo, headline, description, Sign Up / Login buttons (both trigger II)
4. Dashboard layout: sidebar nav (Habits, Tasks, Cash Flow, Community, Profile), XP level bar at top
5. HabitTracker module: list, add form, daily complete toggle, streak display
6. TaskManager module: list, add form, complete toggle, productivity counter
7. CashFlow module: four number inputs, save button, percentage distribution chart (recharts)
8. Community module: tab switcher (Announcements / General / DMs), message list, input box
9. Profile module: avatar upload (FileReader to base64), username edit, Founder badge
10. XP level bar component: current level, XP progress, animated bar, level-up toast
11. Lazy load Community and CashFlow modules; show skeleton while loading
12. All data fetches happen after dashboard shell renders
