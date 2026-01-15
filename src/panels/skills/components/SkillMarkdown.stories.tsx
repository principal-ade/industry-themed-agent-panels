import { ThemeProvider, theme as defaultTheme } from '@principal-ade/industry-theme';
import type { ParsedSkill } from '@principal-ade/markdown-utils';
import type { Meta, StoryObj } from '@storybook/react';
import React, { useEffect, useRef, useState } from 'react';
import { fn } from 'storybook/test';

import { SkillMarkdown } from './SkillMarkdown';

/**
 * SkillMarkdown component for rendering Agent Skills with frontmatter
 */
const meta = {
  title: 'Components/SkillMarkdown',
  component: SkillMarkdown,
  decorators: [
    (Story) => (
      <ThemeProvider theme={defaultTheme}>
        <div style={{ height: '100vh', width: '100%' }}>
          <Story />
        </div>
      </ThemeProvider>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Renders Agent Skills markdown following the agentskills.io specification. Parses YAML frontmatter and displays skill metadata with markdown body.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof SkillMarkdown>;

export default meta;
type Story = StoryObj<typeof meta>;

const basicSkillContent = `---
name: legal-review
description: Review contracts and legal documents for potential issues and compliance
license: MIT
compatibility: ">=1.0.0"
allowed-tools: "Read Write Bash(jq:*)"
metadata:
  author: AI Team
  version: "1.0.0"
  category: Legal
---

# Legal Review Skill

This skill enables AI agents to review legal documents for compliance and potential issues.

## Capabilities

- **Contract Analysis**: Identify contractual obligations and liabilities
- **Regulatory Compliance**: Check documents against relevant regulations
- **Risk Assessment**: Flag ambiguous or problematic clauses
- **Language Review**: Suggest improvements to legal language
- **Template Comparison**: Compare against standard contract templates

## Usage

\`\`\`typescript
const result = await agent.useSkill('legal-review', {
  document: contractText,
  jurisdiction: 'US',
  checkCompliance: true,
});
\`\`\`

## Best Practices

1. Always specify the jurisdiction for accurate compliance checking
2. Provide context about the transaction type
3. Review flagged items with human legal counsel
4. Keep the legal database up to date

## Limitations

- Not a replacement for professional legal advice
- May not catch all edge cases
- Jurisdiction-specific rules require up-to-date data
`;

const minimalSkillContent = `---
name: email-drafter
description: Draft professional emails based on context and intent
---

# Email Drafter

Simple skill for drafting emails.

## Features

- Professional tone
- Context-aware
- Multiple templates
`;

const fullFeaturedSkillContent = `---
name: sql-query-generator
description: Generate optimized SQL queries from natural language descriptions
license: Apache-2.0
compatibility: "Requires PostgreSQL 12+, MySQL 8+, or SQLite 3.35+. Network access required for schema introspection."
allowed-tools: "Read Write Bash(psql:*) Bash(mysql:*) Bash(sqlite3:*)"
metadata:
  author: Database Team
  version: "2.1.0"
  category: Database
  difficulty: Advanced
  last-updated: "2024-01-06"
---

# SQL Query Generator

Advanced skill for converting natural language into optimized, secure SQL queries.

## Overview

This skill leverages natural language processing and database schema understanding to generate production-ready SQL queries. It supports multiple database dialects and includes built-in security validation.

## Capabilities

### Query Generation
- Parse natural language query descriptions
- Generate syntactically correct SQL
- Support for complex joins and subqueries
- Aggregate functions and window functions

### Multi-Dialect Support
- PostgreSQL
- MySQL
- SQL Server
- Oracle
- SQLite

### Security & Optimization
- SQL injection prevention
- Query optimization suggestions
- Index usage analysis
- Permission validation

## Usage Examples

### Basic Query
\`\`\`typescript
const query = await agent.useSkill('sql-generator', {
  prompt: 'Find all users who registered in the last 30 days',
  dialect: 'postgresql',
});
// Output: SELECT * FROM users WHERE created_at >= NOW() - INTERVAL '30 days';
\`\`\`

### Complex Join
\`\`\`typescript
const query = await agent.useSkill('sql-generator', {
  prompt: 'Show total orders per customer with their contact info',
  dialect: 'mysql',
  optimize: true,
});
\`\`\`

## Configuration

\`\`\`yaml
sql-generator:
  default-dialect: postgresql
  max-query-complexity: 10
  require-explain-plan: true
  security-level: strict
\`\`\`

## Best Practices

1. **Always validate schemas**: Ensure the skill has access to current schema information
2. **Review generated queries**: Don't blindly execute without review
3. **Use EXPLAIN**: Check query plans for performance
4. **Limit permissions**: Grant minimal required database permissions

## Performance Considerations

- Large result sets may require pagination
- Complex queries might need manual optimization
- Consider using materialized views for frequent queries

## Security

This skill includes multiple layers of security validation:

- ✅ SQL injection prevention
- ✅ Permission boundary checking
- ✅ Query complexity limits
- ✅ Sensitive data access controls

## Troubleshooting

### Query Returns No Results
- Check schema names and table names
- Verify column names match schema
- Review WHERE clause conditions

### Performance Issues
- Add appropriate indexes
- Consider query rewriting
- Check for N+1 problems

## Version History

- **2.1.0**: Added Oracle support, improved optimization
- **2.0.0**: Multi-dialect support, security hardening
- **1.5.0**: Performance profiling integration
- **1.0.0**: Initial release
`;

const invalidSkillContent = `---
name: Invalid Skill
# Missing required description field!
license: MIT
---

# This will fail validation

Because description is missing.
`;

const malformedYamlContent = `---
name: broken-skill
description: This has malformed YAML
  bad indentation
  - and list issues
---

# Broken YAML

This won't parse correctly.
`;

const invalidNameUppercase = `---
name: Email-Sender
description: This skill name contains uppercase letters which violates the spec
---

# Email Sender

Names must be lowercase only.
`;

const invalidNameConsecutiveHyphens = `---
name: email--sender
description: This skill name contains consecutive hyphens which violates the spec
---

# Email Sender

Names cannot have consecutive hyphens.
`;

const invalidNameStartsWithHyphen = `---
name: -email-sender
description: This skill name starts with a hyphen which violates the spec
---

# Email Sender

Names cannot start with a hyphen.
`;

const invalidNameEndsWithHyphen = `---
name: email-sender-
description: This skill name ends with a hyphen which violates the spec
---

# Email Sender

Names cannot end with a hyphen.
`;

const invalidNameSpecialChars = `---
name: email_sender@v1
description: This skill name contains special characters which violates the spec
---

# Email Sender

Names can only contain lowercase alphanumeric and hyphens.
`;

/**
 * Basic skill with all standard fields
 */
export const Basic: Story = {
  args: {
    content: basicSkillContent,
    theme: defaultTheme,
    onParsed: fn(),
    onError: fn(),
  },
};

/**
 * Minimal skill with only required fields
 */
export const Minimal: Story = {
  args: {
    content: minimalSkillContent,
    theme: defaultTheme,
    onParsed: fn(),
    onError: fn(),
  },
};

/**
 * Full-featured skill with extensive documentation
 */
export const FullFeatured: Story = {
  args: {
    content: fullFeaturedSkillContent,
    theme: defaultTheme,
    onParsed: fn(),
    onError: fn(),
  },
};

/**
 * Invalid skill missing required field
 */
export const InvalidSkill: Story = {
  args: {
    content: invalidSkillContent,
    theme: defaultTheme,
    onError: fn(),
  },
};

/**
 * Invalid skill with malformed YAML
 */
export const MalformedYAML: Story = {
  args: {
    content: malformedYamlContent,
    theme: defaultTheme,
    onError: fn(),
  },
};

/**
 * Invalid skill with fallback to raw markdown
 */
export const InvalidWithFallback: Story = {
  args: {
    content: invalidSkillContent,
    theme: defaultTheme,
    showRawOnError: true,
    onParsed: fn(),
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When showRawOnError is true, the component falls back to rendering raw markdown instead of showing an error message.',
      },
    },
  },
};

/**
 * Skill with code examples and syntax highlighting
 */
export const WithCodeExamples: Story = {
  args: {
    content: `---
name: api-client-generator
description: Generate type-safe API clients from OpenAPI specifications
license: MIT
allowed-tools: "Read Write Bash(npm:*) Bash(python:*)"
---

# API Client Generator

Generate fully type-safe API clients.

## TypeScript Example

\`\`\`typescript
import { generateClient } from './api-generator';

const client = await generateClient({
  spec: './openapi.yaml',
  output: './src/api',
  features: {
    validation: true,
    retry: true,
    auth: 'bearer',
  },
});
\`\`\`

## Python Example

\`\`\`python
from api_generator import generate_client

client = generate_client(
    spec="./openapi.yaml",
    output="./api",
    async_mode=True
)
\`\`\`

## Supported Languages

- TypeScript
- Python
- Go
- Rust
`,
    theme: defaultTheme,
    onParsed: fn(),
    onError: fn(),
  },
};

/**
 * Skill with tables and advanced markdown
 */
export const WithTables: Story = {
  args: {
    content: `---
name: data-transformer
description: Transform data between different formats and schemas
allowed-tools: "Read Write Bash(jq:*) Bash(yq:*)"
---

# Data Transformer

Transform data between formats.

## Supported Formats

| Input Format | Output Format | Validation | Schema Support |
|--------------|---------------|------------|----------------|
| JSON         | CSV          | ✅         | ✅             |
| CSV          | JSON         | ✅         | ✅             |
| XML          | JSON         | ✅         | ⚠️             |
| YAML         | JSON         | ✅         | ✅             |

## Performance Metrics

| File Size | Processing Time | Memory Usage |
|-----------|----------------|--------------|
| < 1 MB    | < 100ms        | < 10 MB      |
| 1-10 MB   | < 1s           | < 50 MB      |
| 10-100 MB | < 10s          | < 200 MB     |

## Feature Checklist

- [x] JSON to CSV
- [x] CSV to JSON
- [x] XML to JSON
- [ ] Protobuf support
- [ ] Avro support
`,
    theme: defaultTheme,
    onParsed: fn(),
    onError: fn(),
  },
};

/**
 * Invalid skill name with uppercase letters (violates spec)
 */
export const InvalidNameUppercase: Story = {
  args: {
    content: invalidNameUppercase,
    theme: defaultTheme,
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skill names must be lowercase alphanumeric and hyphens only. Uppercase letters violate the Agent Skills specification.',
      },
    },
  },
};

/**
 * Invalid skill name with consecutive hyphens (violates spec)
 */
export const InvalidNameConsecutiveHyphens: Story = {
  args: {
    content: invalidNameConsecutiveHyphens,
    theme: defaultTheme,
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skill names cannot contain consecutive hyphens according to the Agent Skills specification.',
      },
    },
  },
};

/**
 * Invalid skill name starting with hyphen (violates spec)
 */
export const InvalidNameStartsWithHyphen: Story = {
  args: {
    content: invalidNameStartsWithHyphen,
    theme: defaultTheme,
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skill names cannot start with a hyphen according to the Agent Skills specification.',
      },
    },
  },
};

/**
 * Invalid skill name ending with hyphen (violates spec)
 */
export const InvalidNameEndsWithHyphen: Story = {
  args: {
    content: invalidNameEndsWithHyphen,
    theme: defaultTheme,
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skill names cannot end with a hyphen according to the Agent Skills specification.',
      },
    },
  },
};

/**
 * Invalid skill name with special characters (violates spec)
 */
export const InvalidNameSpecialChars: Story = {
  args: {
    content: invalidNameSpecialChars,
    theme: defaultTheme,
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Skill names can only contain lowercase alphanumeric characters and hyphens. Special characters like underscores and @ symbols violate the Agent Skills specification.',
      },
    },
  },
};

/**
 * Skill with explicit container width (skips ResizeObserver)
 */
export const WithContainerWidth: Story = {
  args: {
    content: basicSkillContent,
    theme: defaultTheme,
    containerWidth: 800,
    onParsed: fn(),
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'When containerWidth is provided, IndustryMarkdownSlide skips ResizeObserver and uses the explicit width for padding calculations. This can improve performance when the parent already knows the container width.',
      },
    },
  },
};

/**
 * Wrapper component that uses ResizeObserver and passes width to SkillMarkdown
 */
const SkillMarkdownWithResizeObserver: React.FC<{
  content: string;
  onParsed?: (skill: ParsedSkill) => void;
  onError?: (error: Error) => void;
}> = ({ content, onParsed, onError }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        setContainerWidth(width);
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        border: '2px dashed rgba(100, 100, 255, 0.3)',
        boxSizing: 'border-box',
      }}
    >
      {containerWidth !== undefined && (
        <div
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            padding: '4px 8px',
            background: 'rgba(100, 100, 255, 0.1)',
            border: '1px solid rgba(100, 100, 255, 0.3)',
            borderRadius: '4px',
            fontSize: '12px',
            fontFamily: 'monospace',
            color: defaultTheme.colors.text,
            zIndex: 1000,
          }}
        >
          Parent width: {containerWidth}px
        </div>
      )}
      <SkillMarkdown
        content={content}
        theme={defaultTheme}
        containerWidth={containerWidth}
        onParsed={onParsed}
        onError={onError}
      />
    </div>
  );
};

/**
 * Parent component with ResizeObserver passing width to SkillMarkdown
 */
export const WithParentResizeObserver: Story = {
  render: (args) => (
    <ThemeProvider theme={defaultTheme}>
      <div style={{ height: '100vh', width: '100%' }}>
        <SkillMarkdownWithResizeObserver
          content={args.content}
          onParsed={args.onParsed}
          onError={args.onError}
        />
      </div>
    </ThemeProvider>
  ),
  args: {
    content: basicSkillContent,
    onParsed: fn(),
    onError: fn(),
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the optimal pattern: parent component uses ResizeObserver to measure its width and passes it to SkillMarkdown via containerWidth prop. This avoids duplicate ResizeObservers (one in parent, one in IndustryMarkdownSlide). The dashed border shows the parent container, and the label shows the measured width being passed down.',
      },
    },
  },
};
