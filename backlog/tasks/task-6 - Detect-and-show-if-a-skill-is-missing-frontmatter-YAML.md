---
id: task-6
title: Detect and show if a skill is missing frontmatter YAML
status: To Do
assignee: []
created_date: '2026-01-12 22:20'
labels:
  - enhancement
  - skills
dependencies: []
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Add validation to detect skills that are missing frontmatter YAML metadata. Skills should have YAML frontmatter (like backlog tasks) to properly define metadata such as name, description, capabilities, etc. The panel should visually indicate when a skill is missing this frontmatter.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Parse skill markdown files to detect presence/absence of frontmatter YAML
- [ ] #2 Add visual indicator (badge/icon) on SkillCard when frontmatter is missing
- [ ] #3 Show warning/message in SkillDetailPanel for skills without frontmatter
- [ ] #4 Update Skill interface to include 'hasFrontmatter' boolean field
<!-- AC:END -->
