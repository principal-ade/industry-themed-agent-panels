/**
 * Typed interfaces for Agent Panels migration to panel-framework-core v0.3.0
 *
 * This file defines strongly-typed context interfaces for agent panels
 * that depend on specific slices from the global context.
 */

import type { FileTree } from '@principal-ai/repository-abstraction';
import type { PanelActions, DataSlice } from '@principal-ade/panel-framework-core';
import type { Skill } from '../panels/skills/hooks/useSkillsData';
import type { Agent } from '../panels/agents/hooks/useAgentsData';
import type { Subagent } from '../panels/agents/hooks/useSubagentsData';

/**
 * Global skills data slice
 */
export interface GlobalSkillsSlice {
  skills: Skill[];
}

/**
 * Global agents data slice
 */
export interface GlobalAgentsSlice {
  agents: Agent[];
}

/**
 * Global subagents data slice
 */
export interface GlobalSubagentsSlice {
  subagents: Subagent[];
}

/**
 * Empty actions interface - agent panels don't use any actions
 */
export interface AgentPanelActions extends PanelActions {}

/**
 * Context for panels that need fileTree and globalSkills
 * Used by: SkillsListPanel, GlobalSkillsPanel, SkillsBrowsePanel, SkillDetailPanel
 *
 * Note: Slices use `DataSlice<T | null>` to distinguish between:
 * - `null` = "not fetched yet" or "not available"
 * - Empty data = "fetched successfully, no items"
 */
export interface SkillsPanelContext {
  fileTree: DataSlice<FileTree | null>;
  globalSkills: DataSlice<GlobalSkillsSlice | null>;
}

/**
 * Context for panels that need fileTree, globalAgents, and globalSubagents
 * Used by: AgentsListPanel, AgentDetailPanel
 */
export interface AgentsPanelContext {
  fileTree: DataSlice<FileTree | null>;
  globalAgents: DataSlice<GlobalAgentsSlice | null>;
  globalSubagents: DataSlice<GlobalSubagentsSlice | null>;
}

/**
 * Context for panels that need all agent-related slices
 * Used by: AgenticResourcesPanel (unified panel for both skills and agents)
 */
export interface AgenticResourcesPanelContext {
  fileTree: DataSlice<FileTree | null>;
  globalSkills: DataSlice<GlobalSkillsSlice | null>;
  globalAgents: DataSlice<GlobalAgentsSlice | null>;
  globalSubagents: DataSlice<GlobalSubagentsSlice | null>;
}
