import React, { useState, useMemo, useRef } from 'react';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { AlertCircle, Search, X, RefreshCw, FileCode } from 'lucide-react';
import type { PanelComponentProps } from '../types';
import { useSkillsData, type Skill } from './skills/hooks/useSkillsData';
import { SkillCard } from './skills/components/SkillCard';

type SkillFilter = 'all' | 'project' | 'global';

export interface SkillsListPanelProps extends PanelComponentProps {
  /**
   * When true, the panel operates in browse mode (e.g., browsing GitHub repos):
   * - Changes "Project" filter label to "Git Repo"
   */
  browseMode?: boolean;
}

/**
 * SkillsListPanel - A panel for displaying Agent Skills from SKILL.md files
 *
 * This panel shows:
 * - List/grid of available skills from the file tree
 * - Search functionality to filter skills
 * - Skill metadata (name, description, capabilities)
 * - Click to select and emit events for detail views
 */
export const SkillsListPanel: React.FC<SkillsListPanelProps> = ({
  context,
  events,
  browseMode = false,
}) => {
  const { theme } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState<SkillFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load skills data
  const { skills, isLoading, error, refreshSkills } = useSkillsData({ context });

  // Listen for panel focus events
  usePanelFocusListener('skills-list', events, () => panelRef.current?.focus());

  // Check if there's a repository loaded (to determine if filters should be shown)
  const hasRepository = useMemo(() => {
    const fileTreeSlice = context.getSlice<any>('fileTree');
    return !!fileTreeSlice?.data;
  }, [context]);

  // Filter skills by search query and source type
  const filteredSkills = useMemo(() => {
    let filtered = skills;

    // Filter by source type
    if (skillFilter === 'project') {
      filtered = filtered.filter(
        (skill) =>
          skill.source === 'project-universal' ||
          skill.source === 'project-claude' ||
          skill.source === 'project-other'
      );
    } else if (skillFilter === 'global') {
      filtered = filtered.filter(
        (skill) => skill.source === 'global-universal' || skill.source === 'global-claude'
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((skill) => {
        // Search in name
        if (skill.name.toLowerCase().includes(query)) return true;
        // Search in description
        if (skill.description?.toLowerCase().includes(query)) return true;
        // Search in capabilities
        if (skill.capabilities?.some((cap) => cap.toLowerCase().includes(query)))
          return true;
        // Search in path
        if (skill.path.toLowerCase().includes(query)) return true;
        return false;
      });
    }

    return filtered;
  }, [skills, searchQuery, skillFilter]);

  const handleSkillClick = (skill: Skill) => {
    setSelectedSkillId(skill.id);
    // Emit skill:selected event for other panels
    if (events) {
      events.emit({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: 'skill:selected' as any,
        source: 'skills-list-panel',
        timestamp: Date.now(),
        payload: { skillId: skill.id, skill },
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSkills();
    } finally {
      setIsRefreshing(false);
    }
  };

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
              href="https://agentskills.io/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'inherit',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              Agent Skills
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
              {filteredSkills.length} {filteredSkills.length === 1 ? 'skill' : 'skills'}
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
              placeholder="Search skills..."
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
            title="Refresh skills"
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

      {/* Filter Toggle - Only show when repository is loaded */}
      {hasRepository && (
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            gap: '8px',
          }}
        >
          <button
            onClick={() => setSkillFilter('all')}
            style={{
              padding: '8px 16px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              border: `1px solid ${skillFilter === 'all' ? theme.colors.primary : theme.colors.border}`,
              borderRadius: theme.radii[1],
              background: skillFilter === 'all' ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
              color: skillFilter === 'all' ? theme.colors.primary : theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: skillFilter === 'all' ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            All Skills
          </button>
          <button
            onClick={() => setSkillFilter('project')}
            style={{
              padding: '8px 16px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              border: `1px solid ${skillFilter === 'project' ? theme.colors.primary : theme.colors.border}`,
              borderRadius: theme.radii[1],
              background: skillFilter === 'project' ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
              color: skillFilter === 'project' ? theme.colors.primary : theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: skillFilter === 'project' ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {browseMode ? 'Git Repo' : 'Project'}
          </button>
          <button
            onClick={() => setSkillFilter('global')}
            style={{
              padding: '8px 16px',
              fontSize: theme.fontSizes[1],
              fontFamily: theme.fonts.body,
              border: `1px solid ${skillFilter === 'global' ? theme.colors.primary : theme.colors.border}`,
              borderRadius: theme.radii[1],
              background: skillFilter === 'global' ? `${theme.colors.primary}15` : theme.colors.backgroundSecondary,
              color: skillFilter === 'global' ? theme.colors.primary : theme.colors.text,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: skillFilter === 'global' ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            Global
          </button>
        </div>
      )}

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
            Loading skills...
          </div>
        ) : filteredSkills.length === 0 ? (
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
                {searchQuery ? 'No skills match your search' : 'No skills found'}
              </p>
              <p style={{ margin: '8px 0 0 0', fontSize: theme.fontSizes[1] }}>
                {searchQuery
                  ? 'Try a different search term'
                  : 'Add SKILL.md files to your repository to get started'}
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
            {filteredSkills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onClick={handleSkillClick}
                isSelected={selectedSkillId === skill.id}
              />
            ))}
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
