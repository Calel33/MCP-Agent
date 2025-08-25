# 📋 Universal Document Rules

## 🔒 CRITICAL RULES - NEVER VIOLATE

### **Rule 1: Check/Create Documentation First**
Before ANY work: ✅ Check `docs/` exists → CREATE if missing → Read current status

### **Rule 2: Session Documentation**
- `/start session` - Initialize with context
- `/session pause` - Document current state  
- `/resume` - Continue from pause
- `/session end` - Complete with summary

### **Rule 3: Context Preservation**
✅ Maintain project identity ✅ Preserve functionality ✅ Document changes ✅ Create audit trail

### **Rule 4: Learning Documentation**
✅ MUST create `WHAT_WE_LEARNED_SESSION_YYYY-MM-DD.md` for significant sessions

## 📁 Required Documentation Structure
```
docs/
├── README.md                    # Documentation index
├── PROJECT_BRIEF.md            # Project overview  
├── PROJECT_PROGRESS.md         # Current status
├── SESSION_LOG.md              # Session tracking
├── WHAT_WE_LEARNED_SESSION_YYYY-MM-DD.md  # Learning docs (REQUIRED)
└── sessions/                   # Session-specific docs
    ├── SESSION_YYYY-MM-DD_HH-MM.md
    └── PAUSE_YYYY-MM-DD_HH-MM.md
```

## 🎮 Session Commands

### `/start session`
1. Check/create docs structure
2. Read existing documentation  
3. Create `docs/sessions/SESSION_YYYY-MM-DD_HH-MM.md`
4. Update `docs/SESSION_LOG.md`

### `/session pause`
1. Create `docs/sessions/PAUSE_YYYY-MM-DD_HH-MM.md` with:
   - Exact current state
   - Next immediate steps
   - Context needed to resume
2. Update session log

### `/resume`
1. Find latest `PAUSE_*.md` file
2. Restore complete context
3. Continue from documented state

### `/session end`
1. Update session document with summary
2. Update project documentation
3. Create `WHAT_WE_LEARNED_SESSION_YYYY-MM-DD.md`
4. Mark session complete in log

## 📝 Standards

### **File Naming**
- Core docs: `UPPERCASE_WITH_UNDERSCORES.md`
- Sessions: `SESSION_YYYY-MM-DD_HH-MM.md`
- Pauses: `PAUSE_YYYY-MM-DD_HH-MM.md`

### **Content Standards**
- Headers: Emoji + text (`# 🎯 Purpose`)
- Status: ✅ ❌ 🔄 ⏳
- Dates: ISO format (YYYY-MM-DD)
- Code blocks: Specify language

### **Session Document Sections**
```markdown
# 📅 Session YYYY-MM-DD HH:MM - [Description]
## 🎯 Session Overview
## 📋 Project Context  
## 🔄 Work Completed
## 🚧 Work In Progress
## 🎯 Next Session Recommendations
## 📊 Session Summary
```

## 🚨 Never/Always Rules

### **NEVER**
❌ Start work without checking docs structure  
❌ Skip session documentation  
❌ Delete session documentation  
❌ Change project fundamentals without docs  

### **ALWAYS**  
✅ Check for docs folder, create if missing  
✅ Document session start/pause/resume/end  
✅ Maintain project context across sessions  
✅ Update documentation when making changes  

## 🔧 Auto-Creation Templates

### **PROJECT_BRIEF.md**
```markdown
# 📋 Project Brief - [Name]
## 🎯 Overview: [Description]
## 🏗️ Tech Stack: [Technologies]
## 📊 Status: [Current phase]
## 🎯 Goals: [Objectives]
```

### **SESSION_LOG.md**
```markdown
# 📅 Session Log
| Date | Agent | Status | Description | Link |
|------|-------|--------|-------------|------|
| YYYY-MM-DD | Name | Complete | Brief desc | [Link](./sessions/SESSION_*.md) |
```

---
**🔒 ENFORCEMENT**: MANDATORY for ALL agents on ANY project  
**🚀 GOAL**: Professional documentation + seamless session management
