/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { PathsFileTreeBuilder } from '@principal-ai/repository-abstraction';
import { ThemeProvider } from '@principal-ade/industry-theme';
import { SkillsListPanel } from './SkillsListPanel';
import { SkillDetailPanel } from './SkillDetailPanel';
import {
  createMockContext,
  createMockActions,
  createMockEvents,
} from '../mocks/panelContext';
import type { DataSlice } from '../types';

/**
 * Skills Lifecycle demonstrates the complete workflow of browsing and viewing skills.
 * Click a skill in the list panel to see its details in the detail panel.
 */
const meta = {
  title: 'Workflows/Skills Lifecycle',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Interactive demonstration of the skills workflow. Select a skill from the list panel on the left to view its details on the right.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock SKILL.md content
const createSkillContent = (
  title: string,
  description: string,
  capabilities: string[]
) => `# ${title}

${description}

## Capabilities

${capabilities.map((cap) => `- ${cap}`).join('\n')}

## Usage

This skill can be used by AI agents to ${description.toLowerCase()}.

## Implementation Notes

When using this skill, ensure that:
- Input data is properly validated
- Error handling is implemented
- Results are formatted appropriately

## Examples

\`\`\`typescript
// Example usage
const result = await executeSkill({
  input: data,
  options: {}
});
\`\`\`

## Dependencies

- Core Agent Framework
- Required APIs and services
`;

// Create comprehensive mock skills
const createSkillsMocks = () => {
  const builder = new PathsFileTreeBuilder();
  const mockFileTreeWithSkills = builder.build({
    files: [
      '.skills/legal-review/SKILL.md',
      '.skills/data-analysis/SKILL.md',
      '.skills/presentation-maker/SKILL.md',
      '.skills/code-reviewer/SKILL.md',
      '.skills/sql-generator/SKILL.md',
      '.skills/email-drafter/SKILL.md',
      'src/index.ts',
      'README.md',
    ],
    rootPath: '/Users/developer/my-project',
  });

  const skillContents: Record<string, string> = {
    'legal-review/SKILL.md': createSkillContent(
      'Legal Review',
      'Review contracts and legal documents for potential issues and compliance',
      [
        'Identify contractual obligations and liabilities',
        'Check for regulatory compliance',
        'Flag ambiguous or problematic clauses',
        'Suggest improvements to legal language',
        'Compare against standard contract templates',
      ]
    ),
    'data-analysis/SKILL.md': createSkillContent(
      'Data Analysis',
      'Analyze datasets to extract insights and generate visualizations',
      [
        'Statistical analysis and trend identification',
        'Data cleaning and preprocessing',
        'Generate charts and visualizations',
        'Detect anomalies and outliers',
        'Predictive modeling',
      ]
    ),
    'presentation-maker/SKILL.md': createSkillContent(
      'Presentation Maker',
      'Create professional presentations from content and data',
      [
        'Design slide layouts and themes',
        'Convert data into visual stories',
        'Generate speaker notes',
        'Create infographics and diagrams',
        'Optimize for different audiences',
      ]
    ),
    'code-reviewer/SKILL.md': createSkillContent(
      'Code Reviewer',
      'Review code for quality, security, and best practices',
      [
        'Identify potential bugs and security vulnerabilities',
        'Suggest performance improvements',
        'Check adherence to coding standards',
        'Detect code smells and anti-patterns',
        'Recommend refactoring opportunities',
      ]
    ),
    'sql-generator/SKILL.md': createSkillContent(
      'SQL Generator',
      'Generate SQL queries from natural language descriptions',
      [
        'Parse natural language query descriptions',
        'Generate optimized SQL queries',
        'Support multiple database dialects',
        'Validate query safety and permissions',
        'Explain query logic',
      ]
    ),
    'email-drafter/SKILL.md': createSkillContent(
      'Email Drafter',
      'Draft professional emails based on context and intent',
      [
        'Adapt tone for different audiences',
        'Structure emails professionally',
        'Suggest subject lines',
        'Include appropriate greetings and signatures',
        'Maintain brand voice',
      ]
    ),
  };

  const fileSystem = {
    readFile: async (path: string) => {
      const match = path.match(/\.skills\/([^/]+\/SKILL\.md)$/);
      if (match && skillContents[match[1]]) {
        return skillContents[match[1]];
      }
      throw new Error(`File not found: ${path}`);
    },
  };

  const mockSlices = new Map<string, DataSlice>();
  mockSlices.set('fileTree', {
    scope: 'repository',
    name: 'fileTree',
    data: mockFileTreeWithSkills,
    loading: false,
    error: null,
    refresh: async () => {},
  });

  const events = createMockEvents();

  const context = createMockContext({
    currentScope: {
      type: 'repository',
      workspace: {
        name: 'my-workspace',
        path: '/Users/developer/my-workspace',
      },
      repository: {
        name: 'my-project',
        path: '/Users/developer/my-project',
      },
    },
    slices: mockSlices,
    adapters: {
      fileSystem,
    },
  });

  const actions = createMockActions({
    openFile: (filePath: string) => {
      // eslint-disable-next-line no-console
      console.log('[Skills Lifecycle] Opening file:', filePath);
    },
  });

  // Create mock global skills
  const mockGlobalSkills = [
    {
      id: 'global:~/.agent/skills/security-audit',
      name: 'Security Audit',
      path: '/Users/developer/.agent/skills/security-audit/SKILL.md',
      source: 'global-universal' as const,
      priority: 2 as const,
      description: 'Perform comprehensive security audits on codebases and infrastructure',
      content: createSkillContent(
        'Security Audit',
        'Perform comprehensive security audits on codebases and infrastructure',
        [
          'Scan for common vulnerabilities (OWASP Top 10)',
          'Review authentication and authorization implementations',
          'Check for insecure dependencies',
          'Analyze security headers and configurations',
          'Generate security reports with remediation steps',
        ]
      ),
      capabilities: [
        'Scan for common vulnerabilities (OWASP Top 10)',
        'Review authentication and authorization implementations',
        'Check for insecure dependencies',
      ],
      skillFolderPath: '/Users/developer/.agent/skills/security-audit',
      hasScripts: true,
      hasReferences: true,
      hasAssets: false,
      scriptFiles: ['scan.sh', 'audit-dependencies.js'],
      referenceFiles: ['owasp-checklist.md', 'security-best-practices.md'],
    },
    {
      id: 'global:~/.claude/skills/translation-helper',
      name: 'Translation Helper',
      path: '/Users/developer/.claude/skills/translation-helper/SKILL.md',
      source: 'global-claude' as const,
      priority: 4 as const,
      description: 'Translate content between multiple languages while preserving context',
      content: createSkillContent(
        'Translation Helper',
        'Translate content between multiple languages while preserving context',
        [
          'Support for 50+ languages',
          'Preserve technical terminology and code',
          'Maintain formatting and structure',
          'Cultural context awareness',
          'Batch translation capabilities',
        ]
      ),
      capabilities: [
        'Support for 50+ languages',
        'Preserve technical terminology and code',
        'Maintain formatting and structure',
      ],
      skillFolderPath: '/Users/developer/.claude/skills/translation-helper',
      hasScripts: false,
      hasReferences: true,
      hasAssets: true,
      referenceFiles: ['language-codes.md', 'glossary.md'],
      assetFiles: ['terminology-database.json'],
    },
    {
      id: 'global:~/.agent/skills/api-documentation-generator',
      name: 'API Documentation Generator',
      path: '/Users/developer/.agent/skills/api-documentation-generator/SKILL.md',
      source: 'global-universal' as const,
      priority: 2 as const,
      description: 'Generate comprehensive API documentation from code and annotations',
      content: createSkillContent(
        'API Documentation Generator',
        'Generate comprehensive API documentation from code and annotations',
        [
          'Parse REST, GraphQL, and gRPC APIs',
          'Generate interactive API references',
          'Create code examples in multiple languages',
          'Auto-generate OpenAPI/Swagger specs',
          'Export to multiple formats (Markdown, HTML, PDF)',
        ]
      ),
      capabilities: [
        'Parse REST, GraphQL, and gRPC APIs',
        'Generate interactive API references',
        'Create code examples in multiple languages',
      ],
      skillFolderPath: '/Users/developer/.agent/skills/api-documentation-generator',
      hasScripts: true,
      hasReferences: false,
      hasAssets: true,
      scriptFiles: ['generate-docs.js', 'parse-api.py'],
      assetFiles: ['doc-template.html', 'styles.css'],
    },
  ];

  // Add global skills to mock slices
  mockSlices.set('globalSkills', {
    scope: 'global',
    name: 'globalSkills',
    data: { skills: mockGlobalSkills },
    loading: false,
    error: null,
    refresh: async () => {},
  });

  return { context, actions, events };
};

/**
 * Interactive workflow showing skill list and detail panels side by side.
 * Click a skill in the list to see its details.
 */
const SkillsBrowsingStory = () => {
  const [events] = useState(() => createMockEvents());
  const lastEventTimestampRef = useRef<number | null>(null);
  const mocks = createSkillsMocks();

  // Replace the events object with our shared one
  mocks.events = events;

  // Host orchestration for focus events
  useEffect(() => {
    // Skill selected -> focus detail panel
    const unsubscribeSkillSelected = events.on('skill:selected', (event) => {
      // Check if we already handled this exact event to prevent infinite loops
      if (lastEventTimestampRef.current === event.timestamp) {
        console.log('[SkillsLifecycle] Skipping already-handled event');
        return;
      }

      lastEventTimestampRef.current = event.timestamp;
      console.log('[SkillsLifecycle] skill:selected event received, focusing skill-detail panel');

      // Delay focus event slightly to allow panel's listener to register
      setTimeout(() => {
        console.log('[SkillsLifecycle] Emitting panel:focus after brief delay');
        events.emit({
          type: 'panel:focus',
          payload: { panelId: 'skill-detail', panelSlot: 'right' },
          source: 'skills-lifecycle-story',
          timestamp: Date.now(),
        });
      }, 50);
    });

    return () => {
      unsubscribeSkillSelected();
    };
  }, [events]);

  return (
    <ThemeProvider>
      <div
        style={{
          height: '100vh',
          display: 'grid',
          gridTemplateColumns: '400px 1fr',
          gap: 0,
          background: '#f5f5f5',
        }}
      >
        {/* Skills List Panel */}
        <div
          style={{
            borderRight: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <SkillsListPanel
            context={mocks.context}
            actions={mocks.actions}
            events={mocks.events}
          />
        </div>

        {/* Skill Detail Panel */}
        <div style={{ overflow: 'hidden' }}>
          <SkillDetailPanel
            context={mocks.context}
            actions={mocks.actions}
            events={mocks.events}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export const SkillsBrowsing: Story = {
  render: () => <SkillsBrowsingStory />,
  parameters: {
    docs: {
      description: {
        story:
          'Click any skill in the list panel (left) to view its details in the detail panel (right). Try searching and filtering skills, then selecting them to see the full information.',
      },
    },
  },
};

/**
 * Vertical layout variant showing list above detail
 */
const SkillsBrowsingVerticalStory = () => {
  const [events] = useState(() => createMockEvents());
  const lastEventTimestampRef = useRef<number | null>(null);
  const mocks = createSkillsMocks();

  // Replace the events object with our shared one
  mocks.events = events;

  // Host orchestration for focus events
  useEffect(() => {
    // Skill selected -> focus detail panel
    const unsubscribeSkillSelected = events.on('skill:selected', (event) => {
      // Check if we already handled this exact event to prevent infinite loops
      if (lastEventTimestampRef.current === event.timestamp) {
        console.log('[SkillsLifecycle] Skipping already-handled event');
        return;
      }

      lastEventTimestampRef.current = event.timestamp;
      console.log('[SkillsLifecycle] skill:selected event received, focusing skill-detail panel');

      // Delay focus event slightly to allow panel's listener to register
      setTimeout(() => {
        console.log('[SkillsLifecycle] Emitting panel:focus after brief delay');
        events.emit({
          type: 'panel:focus',
          payload: { panelId: 'skill-detail', panelSlot: 'bottom' },
          source: 'skills-lifecycle-story',
          timestamp: Date.now(),
        });
      }, 50);
    });

    return () => {
      unsubscribeSkillSelected();
    };
  }, [events]);

  return (
    <ThemeProvider>
      <div
        style={{
          height: '100vh',
          display: 'grid',
          gridTemplateRows: '300px 1fr',
          gap: 0,
          background: '#f5f5f5',
        }}
      >
        {/* Skills List Panel */}
        <div
          style={{
            borderBottom: '1px solid #e0e0e0',
            overflow: 'hidden',
          }}
        >
          <SkillsListPanel
            context={mocks.context}
            actions={mocks.actions}
            events={mocks.events}
          />
        </div>

        {/* Skill Detail Panel */}
        <div style={{ overflow: 'hidden' }}>
          <SkillDetailPanel
            context={mocks.context}
            actions={mocks.actions}
            events={mocks.events}
          />
        </div>
      </div>
    </ThemeProvider>
  );
};

export const SkillsBrowsingVertical: Story = {
  render: () => <SkillsBrowsingVerticalStory />,
  parameters: {
    docs: {
      description: {
        story:
          'Vertical layout with list panel on top and detail panel below. Good for wide screens.',
      },
    },
  },
};
