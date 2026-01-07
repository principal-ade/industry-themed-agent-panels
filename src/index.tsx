import { ExamplePanel } from './panels/ExamplePanel';
import { SkillsListPanel } from './panels/SkillsListPanel';
import { SkillDetailPanel } from './panels/SkillDetailPanel';
import type { PanelDefinition, PanelContextValue } from './types';
import { examplePanelTools } from './tools';

/**
 * Export array of panel definitions.
 * This is the required export for panel extensions.
 */
export const panels: PanelDefinition[] = [
  {
    metadata: {
      id: 'industry-theme.skills-list',
      name: 'Skills List',
      icon: '⚡',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'Display and manage Agent Skills from SKILL.md files',
      slices: ['fileTree'], // Data slices this panel depends on
    },
    component: SkillsListPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Skills List Panel mounted',
        context.currentScope.repository?.path
      );
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Skills List Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'industry-theme.skill-detail',
      name: 'Skill Detail',
      icon: '📋',
      version: '0.1.0',
      author: 'Principal ADE',
      description: 'Display detailed information about a selected Agent Skill',
      slices: ['fileTree'], // Data slices this panel depends on
    },
    component: SkillDetailPanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Skill Detail Panel mounted',
        context.currentScope.repository?.path
      );
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Skill Detail Panel unmounting');
    },
  },
  {
    metadata: {
      id: 'your-org.example-panel',
      name: 'Example Panel',
      icon: '📝',
      version: '0.1.0',
      author: 'Your Organization',
      description: 'A simple example panel demonstrating the panel framework',
      slices: ['git', 'markdown', 'fileTree'], // Data slices this panel depends on
      // UTCP-compatible tools this panel exposes
      tools: examplePanelTools,
    },
    component: ExamplePanel,

    // Optional: Called when this specific panel is mounted
    onMount: async (context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log(
        'Example Panel mounted',
        context.currentScope.repository?.path
      );

      // Example: Refresh git data if available
      if (context.hasSlice('git') && !context.isSliceLoading('git')) {
        await context.refresh('repository', 'git');
      }
    },

    // Optional: Called when this specific panel is unmounted
    onUnmount: async (_context: PanelContextValue) => {
      // eslint-disable-next-line no-console
      console.log('Example Panel unmounting');
    },
  },
];

/**
 * Optional: Called once when the entire package is loaded.
 * Use this for package-level initialization.
 */
export const onPackageLoad = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package loaded - Agent Panels Extension');
};

/**
 * Optional: Called once when the package is unloaded.
 * Use this for package-level cleanup.
 */
export const onPackageUnload = async () => {
  // eslint-disable-next-line no-console
  console.log('Panel package unloading - Agent Panels Extension');
};

/**
 * Export tools for server-safe imports.
 * Use '@your-org/panel-starter/tools' to import without React dependencies.
 */
export {
  examplePanelTools,
  examplePanelToolsMetadata,
  refreshGitStatusTool,
  selectFileTool,
  toggleSectionTool,
} from './tools';
