import React, { useState, useEffect, useRef } from 'react';
import type { PanelComponentProps } from '../types';
import { useSkillsData } from './skills/hooks/useSkillsData';
import type { Skill } from './skills/hooks/useSkillsData';
import { SkillMarkdown } from 'themed-markdown';
import type { ParsedSkill } from '@principal-ade/markdown-utils';
import { useTheme } from '@principal-ade/industry-theme';
import { usePanelFocusListener } from '@principal-ade/panel-layouts';
import { Code, BookOpen, Package } from 'lucide-react';
import './SkillDetailPanel.css';

export interface SkillDetailPanelProps extends PanelComponentProps {}

export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  context,
  events,
  actions,
}) => {
  const { theme } = useTheme();
  const { skills, isLoading, error } = useSkillsData({ context });
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Listen for panel focus events
  usePanelFocusListener(
    'skill-detail',
    events,
    () => panelRef.current?.focus()
  );

  // Listen for skill selection events
  useEffect(() => {
    const unsubscribe = events.on('skill:selected', (event) => {
      const payload = event.payload as { skillId?: string } | undefined;
      const skillId = payload?.skillId;
      if (skillId) {
        setSelectedSkillId(skillId);
      }
    });

    return unsubscribe;
  }, [events]);

  // Update selected skill when skills load or selection changes
  useEffect(() => {
    if (selectedSkillId && skills.length > 0) {
      const foundSkill = skills.find((s) => s.id === selectedSkillId);
      setSkill(foundSkill || null);
    }
  }, [selectedSkillId, skills]);

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '2rem',
          backgroundColor: theme.colors.background,
          color: theme.colors.error,
          fontFamily: theme.fonts.body,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          Error loading skills: {error}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          backgroundColor: theme.colors.background,
          color: theme.colors.text,
          fontFamily: theme.fonts.body,
        }}
      >
        Loading skills...
      </div>
    );
  }

  if (!skill) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '2rem',
          backgroundColor: theme.colors.background,
          color: theme.colors.textSecondary,
          fontFamily: theme.fonts.body,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
        <h2
          style={{
            color: theme.colors.text,
            fontSize: theme.fontSizes[4],
            fontFamily: theme.fonts.heading,
            fontWeight: theme.fontWeights.heading,
            marginBottom: '0.5rem',
          }}
        >
          No Skill Selected
        </h2>
        <p>Select a skill from the list to view its details</p>
      </div>
    );
  }

  const handleParsed = (parsedSkill: ParsedSkill) => {
    console.log('Skill parsed:', parsedSkill.metadata.name);
  };

  const handleError = (error: Error) => {
    console.error('Error parsing skill:', error);
  };

  const hasStructure = skill.hasScripts || skill.hasReferences || skill.hasAssets;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      style={{
        height: '100%',
        backgroundColor: theme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        outline: 'none',
      }}
    >
      {skill.content ? (
        <>
          {hasStructure && (
            <div
              style={{
                padding: '1rem',
                borderBottom: `1px solid ${theme.colors.border}`,
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                backgroundColor: theme.colors.backgroundSecondary,
              }}
            >
              <div
                style={{
                  fontSize: theme.fontSizes[1],
                  color: theme.colors.textSecondary,
                  fontFamily: theme.fonts.body,
                  marginRight: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                Available:
              </div>
              {skill.hasScripts && (
                <div
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.background,
                    fontSize: theme.fontSizes[0],
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  title={skill.scriptFiles?.join(', ')}
                >
                  <Code size={14} />
                  <span>Scripts ({skill.scriptFiles?.length || 0})</span>
                </div>
              )}
              {skill.hasReferences && (
                <div
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: theme.colors.secondary,
                    color: theme.colors.background,
                    fontSize: theme.fontSizes[0],
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  title={skill.referenceFiles?.join(', ')}
                >
                  <BookOpen size={14} />
                  <span>References ({skill.referenceFiles?.length || 0})</span>
                </div>
              )}
              {skill.hasAssets && (
                <div
                  style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '12px',
                    backgroundColor: theme.colors.accent,
                    color: theme.colors.background,
                    fontSize: theme.fontSizes[0],
                    fontFamily: theme.fonts.body,
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                  title={skill.assetFiles?.join(', ')}
                >
                  <Package size={14} />
                  <span>Assets ({skill.assetFiles?.length || 0})</span>
                </div>
              )}
            </div>
          )}
          <div style={{ flex: 1, overflow: 'auto' }}>
            <SkillMarkdown
              content={skill.content}
              theme={theme}
              onParsed={handleParsed}
              onError={handleError}
              showRawOnError={true}
            />
          </div>
        </>
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.body,
          }}
        >
          <p>No content available for this skill</p>
        </div>
      )}
    </div>
  );
};
