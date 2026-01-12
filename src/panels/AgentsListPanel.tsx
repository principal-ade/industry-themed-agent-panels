import React, { useState, useMemo, useRef } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { AlertCircle, Search, X, RefreshCw, FileCode, BookOpen, Bot } from 'lucide-react';
import type { PanelComponentProps } from '../types';
import { useAgentsData, type Agent } from './agents/hooks/useAgentsData';
import { useSubagentsData, type Subagent } from './agents/hooks/useSubagentsData';
import { AgentCard } from './agents/components/AgentCard';
import { SubagentCard } from './agents/components/SubagentCard';

type AgentFilter = 'all' | 'documentation' | 'subagents';

type AgentItem =
  | { type: 'agent'; data: Agent }
  | { type: 'subagent'; data: Subagent };

/**
 * AgentsListPanel - A panel for displaying AGENTS.md documentation and Claude Code subagents
 *
 * This panel shows:
 * - AGENTS.md files (documentation for AI agents)
 * - Subagent definitions (from .claude/agents/)
 * - Search and filter functionality
 * - Click to select and emit events for detail views
 */
export const AgentsListPanel: React.FC<PanelComponentProps> = ({
  context,
  events,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [agentFilter, setAgentFilter] = useState<AgentFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load agents and subagents data
  const {
    agents,
    isLoading: agentsLoading,
    error: agentsError,
    refreshAgents,
  } = useAgentsData({ context });

  const {
    subagents,
    isLoading: subagentsLoading,
    error: subagentsError,
    refreshSubagents,
  } = useSubagentsData({ context });

  const isLoading = agentsLoading || subagentsLoading;
  const error = agentsError || subagentsError;

  // Listen for panel focus events
  usePanelFocusListener('agents-list', events, () => panelRef.current?.focus());

  // Combine agents and subagents into a unified list
  const allItems: AgentItem[] = useMemo(() => {
    const items: AgentItem[] = [];

    // Add agents (AGENTS.md files)
    agents.forEach((agent) => {
      items.push({ type: 'agent', data: agent });
    });

    // Add subagents
    subagents.forEach((subagent) => {
      items.push({ type: 'subagent', data: subagent });
    });

    return items;
  }, [agents, subagents]);

  // Filter items by search query and type
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    // Filter by type
    if (agentFilter === 'documentation') {
      filtered = filtered.filter((item) => item.type === 'agent');
    } else if (agentFilter === 'subagents') {
      filtered = filtered.filter((item) => item.type === 'subagent');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((item) => {
        if (item.type === 'agent') {
          const agent = item.data;
          // Search in name, path, content
          if (agent.name.toLowerCase().includes(query)) return true;
          if (agent.path.toLowerCase().includes(query)) return true;
          if (agent.content.toLowerCase().includes(query)) return true;
          return false;
        } else {
          const subagent = item.data;
          // Search in name, path, description, prompt
          if (subagent.name.toLowerCase().includes(query)) return true;
          if (subagent.path.toLowerCase().includes(query)) return true;
          if (subagent.frontmatter.description.toLowerCase().includes(query)) return true;
          if (subagent.prompt.toLowerCase().includes(query)) return true;
          return false;
        }
      });
    }

    return filtered;
  }, [allItems, searchQuery, agentFilter]);

  const handleItemClick = (item: AgentItem) => {
    const itemId = item.type === 'agent' ? item.data.id : item.data.id;
    setSelectedItemId(itemId);

    // Emit event for other panels
    if (events) {
      events.emit({
        type: item.type === 'agent' ? ('agent:selected' as any) : ('subagent:selected' as any),
        source: 'agents-list-panel',
        timestamp: Date.now(),
        payload: {
          id: itemId,
          type: item.type,
          data: item.data,
        },
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshAgents(), refreshSubagents()]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const agentsCount = agents.length;
  const subagentsCount = subagents.length;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        padding: 'clamp(12px, 3vw, 20px)',
        fontFamily: theme.fonts.body,
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        overflow: 'hidden',
        backgroundColor: theme.colors.background,
        color: theme.colors.text,
        outline: 'none',
      }}
    >
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2
            style={{
              margin: 0,
              fontSize: theme.fontSizes[4],
              color: theme.colors.text,
            }}
          >
            <a
              href="https://agents.md/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Agents
            </a>
          </h2>

          {!isLoading && (
            <span
              style={{
                fontSize: theme.fontSizes[1],
                color: theme.colors.textSecondary,
                background: theme.colors.backgroundSecondary,
                padding: '4px 10px',
                borderRadius: theme.radii[1],
              }}
            >
              {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', maxWidth: '400px' }}>
          {/* Search input */}
          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: '150px',
            }}
          >
            <Search
              size={16}
              color={theme.colors.textSecondary}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search agents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 32px 8px 32px',
                fontSize: theme.fontSizes[1],
                fontFamily: theme.fonts.body,
                border: `1px solid ${theme.colors.border}`,
                borderRadius: theme.radii[2],
                background: theme.colors.backgroundSecondary,
                color: theme.colors.text,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '6px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  padding: '4px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.colors.textSecondary,
                }}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            style={{
              background: theme.colors.backgroundSecondary,
              border: `1px solid ${theme.colors.border}`,
              borderRadius: theme.radii[1],
              padding: '8px',
              cursor: isRefreshing ? 'wait' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease',
            }}
            title="Refresh agents"
          >
            <RefreshCw
              size={16}
              color={theme.colors.textSecondary}
              style={{
                animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
          </button>
        </div>
      </div>

      {/* Filter Toggle */}
      <div
        style={{
          flexShrink: 0,
          display: 'flex',
          gap: '8px',
        }}
      >
        <button
          onClick={() => setAgentFilter('all')}
          style={{
            padding: '8px 16px',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            border: `1px solid ${agentFilter === 'all' ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.radii[1],
            background: agentFilter === 'all' ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
            color: agentFilter === 'all' ? theme.colors.primary : theme.colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: agentFilter === 'all' ? 600 : 400,
            transition: 'all 0.2s ease',
          }}
        >
          All ({agentsCount + subagentsCount})
        </button>
        <button
          onClick={() => setAgentFilter('documentation')}
          style={{
            padding: '8px 16px',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            border: `1px solid ${agentFilter === 'documentation' ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.radii[1],
            background: agentFilter === 'documentation' ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
            color: agentFilter === 'documentation' ? theme.colors.primary : theme.colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: agentFilter === 'documentation' ? 600 : 400,
            transition: 'all 0.2s ease',
          }}
        >
          <BookOpen size={14} />
          Docs ({agentsCount})
        </button>
        <button
          onClick={() => setAgentFilter('subagents')}
          style={{
            padding: '8px 16px',
            fontSize: theme.fontSizes[1],
            fontFamily: theme.fonts.body,
            border: `1px solid ${agentFilter === 'subagents' ? theme.colors.primary : theme.colors.border}`,
            borderRadius: theme.radii[1],
            background: agentFilter === 'subagents' ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
            color: agentFilter === 'subagents' ? theme.colors.primary : theme.colors.text,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontWeight: agentFilter === 'subagents' ? 600 : 400,
            transition: 'all 0.2s ease',
          }}
        >
          <Bot size={14} />
          Subagents ({subagentsCount})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            flexShrink: 0,
            padding: '12px',
            background: `${theme.colors.error}20`,
            border: `1px solid ${theme.colors.error}`,
            borderRadius: theme.radii[2],
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: theme.colors.error,
            fontSize: theme.fontSizes[1],
          }}
        >
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          minHeight: 0,
        }}
      >
        {isLoading ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.colors.textSecondary,
              fontSize: theme.fontSizes[2],
            }}
          >
            Loading agents...
          </div>
        ) : filteredItems.length === 0 ? (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              color: theme.colors.textSecondary,
              padding: '24px',
            }}
          >
            <FileCode size={48} color={theme.colors.border} />
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: 0, fontSize: theme.fontSizes[2] }}>
                {searchQuery ? 'No agents match your search' : 'No agents found'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1] }}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add AGENTS.md or create subagents in .claude/agents/ to get started'}
              </p>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '16px',
              padding: '4px',
            }}
          >
            {filteredItems.map((item) => {
              if (item.type === 'agent') {
                return (
                  <AgentCard
                    key={item.data.id}
                    agent={item.data}
                    onClick={() => handleItemClick(item)}
                    isSelected={selectedItemId === item.data.id}
                  />
                );
              } else {
                return (
                  <SubagentCard
                    key={item.data.id}
                    subagent={item.data}
                    onClick={() => handleItemClick(item)}
                    isSelected={selectedItemId === item.data.id}
                  />
                );
              }
            })}
          </div>
        )}
      </div>

      {/* Animation styles */}
      <style>
        {`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};
