# Project Documentation Sync Workflow

## Current Setup

### Documentation Locations:
1. **Project Folder:** `F:\CC\Projects\Corporate Bingo\`
   - `CURRENT_STATUS.md` - Technical status & deployment info
   - `docs/handoffs/` - Timestamped session handoffs
   - `QUICK_START.md` - Setup instructions
   - `README.md` - Overview & getting started

2. **Obsidian Notes:** `F:\Obsidian Notes\01_Projects\Personal\`
   - `Corporate Bingo.md` - Planning & progress tracking
   - Session-specific notes (e.g., `Corporate Bingo - Session 2025-11-20.md`)

---

## Recommended Workflow

### During Development Sessions:

#### Option 1: Session Notes Pattern (Recommended)
**Best for:** Keeping detailed session history without merge conflicts

1. **Project Updates:**
   - Create timestamped handoff in `docs/handoffs/session-YYYY-MM-DD-topic.md`
   - Include: What was done, files changed, commits, testing status, next steps

2. **Obsidian Updates:**
   - Create separate session note: `Corporate Bingo - Session YYYY-MM-DD.md`
   - Link to main project note at top
   - Quick summary format (like today's note)

3. **Periodic Sync:**
   - Update main `Corporate Bingo.md` in Obsidian monthly or at milestones
   - Update `CURRENT_STATUS.md` in project at major version bumps
   - Cross-reference between files

**Pros:**
- No file conflicts
- Detailed history preserved
- Easy to find specific sessions
- Can update independently

**Cons:**
- Need to manually consolidate for big picture view
- Slightly more files to manage

---

### Option 2: Automated Sync Script
**Best for:** Keeping files perfectly synchronized

Create `scripts/sync-docs.sh`:
```bash
#!/bin/bash
# Sync project documentation

OBSIDIAN_DIR="F:/Obsidian Notes/01_Projects/Personal"
PROJECT_DIR="F:/CC/Projects/Corporate Bingo"

# Function to extract version from package.json
get_version() {
    grep '"version"' "$PROJECT_DIR/package.json" | cut -d'"' -f4
}

# Function to get latest commit
get_latest_commit() {
    cd "$PROJECT_DIR" && git log -1 --format="%h - %s"
}

VERSION=$(get_version)
COMMIT=$(get_latest_commit)
DATE=$(date +"%Y-%m-%d")

# Update Obsidian note with latest version info
sed -i "s/\*\*Version\*\*: .*/\*\*Version\*\*: $VERSION/" \
    "$OBSIDIAN_DIR/Corporate Bingo.md"

sed -i "s/\*\*Last Updated\*\*: .*/\*\*Last Updated\*\*: $DATE/" \
    "$OBSIDIAN_DIR/Corporate Bingo.md"

echo "✅ Synced docs - Version: $VERSION | Date: $DATE"
```

Run after each session:
```bash
cd "/f/CC/Projects/Corporate Bingo"
./scripts/sync-docs.sh
```

---

### Option 3: Git Hook Integration
**Best for:** Automatic sync on git operations

Create `.git/hooks/post-commit`:
```bash
#!/bin/bash
# Auto-update docs after each commit

VERSION=$(grep '"version"' package.json | cut -d'"' -f4)
COMMIT_MSG=$(git log -1 --format="%s")

echo "📝 Version $VERSION | $COMMIT_MSG" >> docs/CHANGELOG.md

# Optional: Update Obsidian if it's in the same git repo or mounted
if [ -d "/f/Obsidian Notes" ]; then
    OBSIDIAN_NOTE="/f/Obsidian Notes/01_Projects/Personal/Corporate Bingo.md"
    DATE=$(date +"%Y-%m-%d")

    # Append to progress log
    echo "### $DATE - $COMMIT_MSG" >> "$OBSIDIAN_NOTE"
fi
```

---

## Recommended: Hybrid Approach

### What We're Using Now (Works Well):

1. **During Session:**
   - Create detailed handoff in `docs/handoffs/`
   - Create quick summary in Obsidian session note
   - Both are standalone and don't conflict

2. **At Major Milestones:**
   - Update `CURRENT_STATUS.md` in project
   - Update main `Corporate Bingo.md` in Obsidian
   - Cross-reference between them

3. **For Quick Reference:**
   - Obsidian: High-level planning & progress
   - Project: Technical details & deployment
   - Handoffs: Session-by-session history

### File Roles:

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `Corporate Bingo.md` (Obsidian) | Planning, roadmap, high-level progress | Weekly/milestone |
| `Session YYYY-MM-DD.md` (Obsidian) | Quick session summaries | Each session |
| `CURRENT_STATUS.md` (Project) | Technical status, deployment info | Major versions |
| `docs/handoffs/` (Project) | Detailed session history | Each session |
| `README.md` (Project) | Getting started, overview | Rarely |

---

## Quick Start for Next Session

### 1. Before Starting:
```bash
cd "/f/CC/Projects/Corporate Bingo"
git pull
npm install  # if package.json changed
```

### 2. During Session:
- Take notes in Obsidian or text editor
- Commit frequently with clear messages

### 3. After Session:
```bash
# Create handoff document
touch docs/handoffs/session-$(date +%Y-%m-%d)-topic.md
# Write detailed notes in handoff

# Create Obsidian session note
touch "/f/Obsidian Notes/01_Projects/Personal/Corporate Bingo - Session $(date +%Y-%m-%d).md"
# Write quick summary

# Commit documentation
git add docs/handoffs/
git commit -m "docs: Add session handoff for YYYY-MM-DD"

# Push
git push origin main
```

---

## Tools to Consider

### Obsidian Plugins:
- **Templater** - Auto-generate session note templates
- **Dataview** - Query all session notes dynamically
- **Git** - Auto-commit Obsidian vault changes

### VS Code Extensions:
- **Markdown All in One** - Better markdown editing
- **Markdown Preview Enhanced** - Rich preview

### Scripts:
- **sync-docs.sh** - One-command doc sync
- **new-session.sh** - Create both handoff & Obsidian note with template

---

## Best Practices

### ✅ Do:
- Create session handoffs immediately after sessions (details are fresh)
- Use consistent date format: YYYY-MM-DD
- Cross-reference between docs with file paths
- Keep Obsidian notes concise (link to detailed handoffs)
- Update version numbers in both places at milestones

### ❌ Don't:
- Try to keep files perfectly in sync during active development
- Edit main notes during sessions (creates conflicts)
- Duplicate entire handoffs in multiple places
- Forget to document deployment/testing status

---

## Implementation for Today

### Already Created:
✅ `docs/handoffs/session-2025-11-20-v1.6.0-pwa-viral.md` (detailed)
✅ `Corporate Bingo - Session 2025-11-20.md` (Obsidian, quick summary)

### Still Needed:
- Update main `Corporate Bingo.md` in Obsidian (add v1.6.0 to progress log)
- Update `CURRENT_STATUS.md` in project (bump to v1.6.0)

### For Next Time:
- Use session note pattern (works great!)
- Consolidate into main files monthly
- Consider adding `new-session.sh` script for faster setup

---

## Automation Script (Optional)

Create `scripts/new-session.sh`:
```bash
#!/bin/bash
# Create new session documentation

DATE=$(date +%Y-%m-%d)
TOPIC=${1:-"general"}
VERSION=$(grep '"version"' package.json | cut -d'"' -f4)

HANDOFF="docs/handoffs/session-$DATE-$TOPIC.md"
OBSIDIAN="/f/Obsidian Notes/01_Projects/Personal/Corporate Bingo - Session $DATE.md"

# Create handoff template
cat > "$HANDOFF" << EOF
# Session Handoff: $TOPIC
**Date:** $DATE
**Version:** $VERSION
**Status:** In Progress

## Objectives
-

## Changes Made
-

## Testing
-

## Next Steps
-
EOF

# Create Obsidian note template
cat > "$OBSIDIAN" << EOF
# Session: $DATE

## Quick Summary
**Version**: $VERSION
**Status**: In Progress

### What We're Building
-

### Progress
-

### Testing Checklist
- [ ]

---
*Session started: $DATE*
EOF

echo "✅ Created session docs:"
echo "   Project: $HANDOFF"
echo "   Obsidian: $OBSIDIAN"
```

Usage:
```bash
./scripts/new-session.sh pwa-features
```

---

*Document created: November 20, 2025*
*Recommended workflow: Session notes pattern with periodic consolidation*
