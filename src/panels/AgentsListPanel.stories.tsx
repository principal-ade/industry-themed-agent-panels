import type { Meta, StoryObj } from '@storybook/react';
import { AgentsListPanel } from './AgentsListPanel';
import { MockPanelProvider } from '../mocks/panelContext';
import type { Agent } from './agents/hooks/useAgentsData';
import type { Subagent } from './agents/hooks/useSubagentsData';

const mockAgents: Agent[] = [
  {
    id: 'AGENTS.md',
    name: 'Project Agents',
    path: 'AGENTS.md',
    content: `# Project Setup

Install dependencies:

\`\`\`bash
npm install
\`\`\`

## Build

Run the build:

\`\`\`bash
npm run build
\`\`\`

## Testing

Run tests:

\`\`\`bash
npm test
\`\`\`

## Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for formatting`,
    source: 'project-root',
    priority: 1,
    sections: {
      setup: 'Install dependencies: npm install',
      build: 'Run the build: npm run build',
      test: 'Run tests: npm test',
      style: 'Use TypeScript strict mode, Follow ESLint rules',
    },
  },
  {
    id: 'packages/web/AGENTS.md',
    name: 'web',
    path: 'packages/web/AGENTS.md',
    content: `# Web Package

This is the web frontend package.

## Setup

Install dependencies and build the UI components.

## Testing

Run Cypress tests for the web interface.`,
    source: 'project-nested',
    priority: 2,
    sections: {
      setup: 'Install dependencies and build the UI components.',
      test: 'Run Cypress tests for the web interface.',
    },
  },
];

const mockSubagents: Subagent[] = [
  {
    id: '.claude/agents/code-reviewer.md',
    name: 'code-reviewer',
    path: '.claude/agents/code-reviewer.md',
    content: `---
name: code-reviewer
description: Reviews code for quality and best practices
tools: Read, Glob, Grep
model: sonnet
---

You are a code reviewer. When invoked, analyze the code and provide specific, actionable feedback on quality, security, and best practices.`,
    prompt: 'You are a code reviewer. When invoked, analyze the code and provide specific, actionable feedback on quality, security, and best practices.',
    frontmatter: {
      name: 'code-reviewer',
      description: 'Reviews code for quality and best practices',
      tools: 'Read, Glob, Grep',
      model: 'sonnet',
    },
    source: 'project-claude',
    priority: 1,
  },
  {
    id: '.claude/agents/test-writer.md',
    name: 'test-writer',
    path: '.claude/agents/test-writer.md',
    content: `---
name: test-writer
description: Writes comprehensive unit tests for code
tools: Read, Write, Bash
model: haiku
permissionMode: acceptEdits
---

You are a test writing expert. When invoked, write comprehensive unit tests with good coverage and edge cases.`,
    prompt: 'You are a test writing expert. When invoked, write comprehensive unit tests with good coverage and edge cases.',
    frontmatter: {
      name: 'test-writer',
      description: 'Writes comprehensive unit tests for code',
      tools: 'Read, Write, Bash',
      model: 'haiku',
      permissionMode: 'acceptEdits',
    },
    source: 'project-claude',
    priority: 1,
  },
];

const meta: Meta<typeof AgentsListPanel> = {
  title: 'Panels/AgentsListPanel',
  component: AgentsListPanel,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AgentsListPanel>;

export const Default: Story = {
  render: () => (
    <MockPanelProvider
      mockSlices={{
        fileTree: {
          allFiles: [
            { name: 'AGENTS.md', relativePath: 'AGENTS.md', type: 'file' },
            { name: 'AGENTS.md', relativePath: 'packages/web/AGENTS.md', type: 'file' },
            { name: 'code-reviewer.md', relativePath: '.claude/agents/code-reviewer.md', type: 'file' },
            { name: 'test-writer.md', relativePath: '.claude/agents/test-writer.md', type: 'file' },
          ] as any,
          sha: 'mock-sha',
        },
      }}
      mockAdapters={{
        fileSystem: {
          readFile: async (path: string) => {
            if (path.includes('AGENTS.md')) {
              const agent = mockAgents.find(a => path.endsWith(a.path));
              return agent?.content || '';
            }
            if (path.includes('code-reviewer.md')) {
              return mockSubagents[0].content;
            }
            if (path.includes('test-writer.md')) {
              return mockSubagents[1].content;
            }
            return '';
          },
        },
      }}
    >
      {({ context, actions }) => (
        <AgentsListPanel
          context={context}
          actions={actions}
          events={{
            emit: () => {},
            on: () => () => {},
          }}
        />
      )}
    </MockPanelProvider>
  ),
};

export const OnlyDocumentation: Story = {
  render: () => (
    <MockPanelProvider
      mockSlices={{
        fileTree: {
          allFiles: [
            { name: 'AGENTS.md', relativePath: 'AGENTS.md', type: 'file' },
          ] as any,
          sha: 'mock-sha',
        },
      }}
      mockAdapters={{
        fileSystem: {
          readFile: async () => mockAgents[0].content,
        },
      }}
    >
      {({ context, actions }) => (
        <AgentsListPanel
          context={context}
          actions={actions}
          events={{
            emit: () => {},
            on: () => () => {},
          }}
        />
      )}
    </MockPanelProvider>
  ),
};

export const OnlySubagents: Story = {
  render: () => (
    <MockPanelProvider
      mockSlices={{
        fileTree: {
          allFiles: [
            { name: 'code-reviewer.md', relativePath: '.claude/agents/code-reviewer.md', type: 'file' },
            { name: 'test-writer.md', relativePath: '.claude/agents/test-writer.md', type: 'file' },
          ] as any,
          sha: 'mock-sha',
        },
      }}
      mockAdapters={{
        fileSystem: {
          readFile: async (path: string) => {
            if (path.includes('code-reviewer.md')) {
              return mockSubagents[0].content;
            }
            return mockSubagents[1].content;
          },
        },
      }}
    >
      {({ context, actions }) => (
        <AgentsListPanel
          context={context}
          actions={actions}
          events={{
            emit: () => {},
            on: () => () => {},
          }}
        />
      )}
    </MockPanelProvider>
  ),
};

export const Empty: Story = {
  render: () => (
    <MockPanelProvider
      mockSlices={{
        fileTree: {
          allFiles: [],
          sha: 'mock-sha',
        },
      }}
    >
      {({ context, actions }) => (
        <AgentsListPanel
          context={context}
          actions={actions}
          events={{
            emit: () => {},
            on: () => () => {},
          }}
        />
      )}
    </MockPanelProvider>
  ),
};

export const Loading: Story = {
  render: () => (
    <MockPanelProvider
      mockSlices={{
        fileTree: null as any,
      }}
    >
      {({ context, actions }) => (
        <AgentsListPanel
          context={context}
          actions={actions}
          events={{
            emit: () => {},
            on: () => () => {},
          }}
        />
      )}
    </MockPanelProvider>
  ),
};
