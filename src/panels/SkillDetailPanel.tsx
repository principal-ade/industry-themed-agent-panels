import React, { useState, useEffect } from 'react';
import type { PanelComponentProps } from '../types';
import { useSkillsData } from './skills/hooks/useSkillsData';
import type { Skill } from './skills/hooks/useSkillsData';
import { SkillMarkdown, defaultTheme } from 'themed-markdown';
import type { ParsedSkill } from '@principal-ade/markdown-utils';
import './SkillDetailPanel.css';

export interface SkillDetailPanelProps extends PanelComponentProps {}

export const SkillDetailPanel: React.FC<SkillDetailPanelProps> = ({
  context,
  events,
  actions,
}) => {
  const { skills, isLoading, error } = useSkillsData({ context });
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skill, setSkill] = useState<Skill | null>(null);

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
          backgroundColor: defaultTheme.colors.background,
          color: defaultTheme.colors.error,
          fontFamily: defaultTheme.fonts.body,
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
          backgroundColor: defaultTheme.colors.background,
          color: defaultTheme.colors.text,
          fontFamily: defaultTheme.fonts.body,
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
          backgroundColor: defaultTheme.colors.background,
          color: defaultTheme.colors.textSecondary,
          fontFamily: defaultTheme.fonts.body,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
        <h2
          style={{
            color: defaultTheme.colors.text,
            fontSize: defaultTheme.fontSizes[4],
            fontFamily: defaultTheme.fonts.heading,
            fontWeight: defaultTheme.fontWeights.heading,
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

  return (
    <div
      style={{
        height: '100%',
        backgroundColor: defaultTheme.colors.background,
      }}
    >
      {skill.content ? (
        <SkillMarkdown
          content={skill.content}
          theme={defaultTheme}
          onParsed={handleParsed}
          onError={handleError}
          showRawOnError={true}
        />
      ) : (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: defaultTheme.colors.textSecondary,
            fontFamily: defaultTheme.fonts.body,
          }}
        >
          <p>No content available for this skill</p>
        </div>
      )}
    </div>
  );
};
