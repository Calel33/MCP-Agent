# Base PRP Template v4 - Implementation-Focused with Precision Standards

---

## Goal

**Feature Goal**: [Specific, measurable end state of what needs to be built]

**Deliverable**: [Concrete artifact - API endpoint, service class, integration, etc.]

**Success Definition**: [How you'll know this is complete and working]

---

## User Persona (if applicable)

**Target User**: [Specific user type - developer, end user, admin, etc.]

**Use Case**: [Primary scenario when this feature will be used]

**User Journey**: [Step-by-step flow of how user interacts with this feature]

**Pain Points Addressed**: [Specific user frustrations this feature solves]

---

## Why

- [Business value and user impact]  
- [Integration with existing features]  
- [Problems this solves and for whom]  

---

## What

[User-visible behavior and technical requirements]

### Success Criteria

- [ ] [Specific measurable outcomes]  

---

## All Needed Context

### Context Completeness Check  
_Before writing this PRP, validate: "If someone knew nothing about this codebase, would they have everything needed to implement this successfully?"_

### Documentation & References

```yaml
# MUST READ - Include these in your context window
- url: [Complete URL with section anchor]
  why: [Specific methods/concepts needed for implementation]
  critical: [Key insights that prevent common implementation errors]

- file: [exact/path/to/pattern/file.py]
  why: [Specific pattern to follow - class structure, error handling, etc.]
  pattern: [Brief description of what pattern to extract]
  gotcha: [Known constraints or limitations to avoid]

- docfile: [PRPs/ai_docs/domain_specific.md]
  why: [Custom documentation for complex library/integration patterns]
  section: [Specific section if document is large]
```

### Current Codebase tree  

```bash

```

### Desired Codebase tree  

```bash

```

### Known Gotchas of our codebase & Library Quirks  

```python
# CRITICAL: [Library name] requires [specific setup]
# Example: FastAPI requires async functions for endpoints
# Example: This ORM doesn't support batch inserts over 1000 records
```

---

## 🔑 Full Implementation Checklist  

- [ ] **Frontend** (components, forms, UI state)  
- [ ] **Backend** (services, controllers, logic)  
- [ ] **Database** (schemas, migrations, seeds)  
- [ ] **API** (routes, contracts, clients)  
- [ ] **Tests** (unit, integration, E2E)  
- [ ] **Documentation** (API reference, guides, changelogs)  

---

## Implementation Blueprint

### Data models and structure

```python
# Example:
class Task(BaseModel):
    id: str
    title: str
    due_date: Optional[datetime]
```

### Implementation Tasks (ordered by dependencies)

```yaml
Task 1: [Describe step]
  - IMPLEMENT: [specifics]
  - FOLLOW pattern: [reference file]
  - NAMING: [standards]
  - DEPENDENCIES: [other tasks]
  - PLACEMENT: [file path]

Task 2: ...
```

### Implementation Patterns & Key Details

```python
# Critical examples, gotchas, non-obvious details
```

### Integration Points

```yaml
DATABASE:
  - migrations / schema changes
CONFIG:
  - settings updates
ROUTES:
  - API or server route additions
```

---

## Validation Loop  

### Level 1: Syntax & Style  
[Checks: linting, type checking, formatting]  

### Level 2: Unit Tests  
[Tests for components/services/tools]  

### Level 3: Integration Testing  
[API, services, DB, server health]  

### Level 4: Creative & Domain-Specific Validation  
[Performance, security, domain-specific checks]  

---

## Final Validation Checklist  

### Technical Validation  
- [ ] Syntax, lint, type checks pass  
- [ ] Tests pass  
- [ ] No formatting errors  

### Feature Validation  
- [ ] Success criteria met  
- [ ] Manual testing successful  
- [ ] Integration points validated  

### Code Quality Validation  
- [ ] Matches codebase patterns  
- [ ] Proper file placement  
- [ ] Dependencies managed  

### Documentation & Deployment  
- [ ] Docs updated  
- [ ] Logs meaningful  
- [ ] Env vars documented  

---

## Anti-Patterns to Avoid  

- ❌ Don’t create new patterns unnecessarily  
- ❌ Don’t skip validation because “it should work”  
- ❌ Don’t ignore failing tests  
- ❌ Don’t hardcode config values  
- ❌ Don’t catch all exceptions blindly  
