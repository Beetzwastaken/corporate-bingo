// Zustand Store for Engineering Meme Generator
// Manages application state with MCP integration and autonomous agents

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { MemeStore, GeneratedMeme } from '../types';
import { SVGMakerService } from './svgMaker';
import { PainAnalysisEngine } from './painAnalysis';

export const useMemeStore = create<MemeStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Current meme state
        selectedTemplate: null,
        currentTexts: {},
        painScore: 5,
        userInput: '',
        generatedMemeUrl: '',
        
        // Template library
        templates: [],
        filteredTemplates: [],
        selectedCategory: 'all',
        
        // Generated memes
        generatedMemes: [],
        
        // Analytics
        analytics: null,
        
        // Agent system
        agents: [
          {
            id: 'template-generator',
            name: 'Template Generator',
            type: 'template-generator',
            autonomyLevel: 95,
            active: true,
            successRate: 98.5
          },
          {
            id: 'pain-analyzer',
            name: 'Pain Analyzer',
            type: 'pain-analyzer',
            autonomyLevel: 90,
            active: true,
            successRate: 95.2
          },
          {
            id: 'quality-controller',
            name: 'Quality Controller',
            type: 'quality-controller',
            autonomyLevel: 98,
            active: true,
            successRate: 99.1
          },
          {
            id: 'analytics-agent',
            name: 'Analytics Agent',
            type: 'analytics',
            autonomyLevel: 100,
            active: true,
            successRate: 97.8
          },
          {
            id: 'deployment-agent',
            name: 'Deployment Agent',
            type: 'deployment',
            autonomyLevel: 95,
            active: false, // Activated only during deployment
            successRate: 96.3
          }
        ],
        activeTasks: [],

        // Actions
        setSelectedTemplate: (template) => {
          set({ selectedTemplate: template, currentTexts: {} });
          
          // Auto-populate placeholder texts
          const placeholderTexts: { [key: string]: string } = {};
          template.textAreas.forEach(area => {
            placeholderTexts[area.id] = area.placeholder;
          });
          
          set({ currentTexts: placeholderTexts });
        },

        updateText: (areaId, text) => {
          set(state => ({
            currentTexts: { ...state.currentTexts, [areaId]: text }
          }));
        },

        setPainScore: (score) => set({ painScore: score }),

        setUserInput: async (input) => {
          set({ userInput: input });
          
          const state = get();
          
          // Analyze pain automatically
          const painAnalysis = await PainAnalysisEngine.getInstance().analyzePain(input);
          set({ painScore: painAnalysis.score });
          
          // Auto-suggest template if confidence is high enough
          if (painAnalysis.confidence > 70 && painAnalysis.suggestedTemplate) {
            const suggestedTemplate = state.templates.find(t => t.id === painAnalysis.suggestedTemplate);
            if (suggestedTemplate) {
              get().setSelectedTemplate(suggestedTemplate);
            }
          }
          
          // If no existing template matches well, generate a new one
          if (painAnalysis.confidence > 80 && painAnalysis.score >= 7) {
            try {
              const svgMaker = SVGMakerService.getInstance();
              const newTemplate = await svgMaker.generateMemeTemplate(input, painAnalysis.category);
              get().addTemplate(newTemplate);
              get().setSelectedTemplate(newTemplate);
            } catch (error) {
              console.warn('Could not generate new template:', error);
            }
          }
        },

        setGeneratedMemeUrl: (url) => set({ generatedMemeUrl: url }),

        addGeneratedMeme: (meme) => {
          set(state => ({
            generatedMemes: [meme, ...state.generatedMemes.slice(0, 99)] // Keep last 100 memes
          }));
          
          // Update analytics
          get().updateAnalyticsFromMeme(meme);
        },

        filterTemplates: (category) => {
          const state = get();
          const filtered = category === 'all' 
            ? state.templates 
            : state.templates.filter(t => t.category === category);
          
          set({ 
            selectedCategory: category,
            filteredTemplates: filtered.sort((a, b) => b.popularity - a.popularity)
          });
        },

        updateAnalytics: (analytics) => set({ analytics }),

        addTemplate: (template) => {
          set(state => ({
            templates: [template, ...state.templates]
          }));
          
          // Re-filter templates
          get().filterTemplates(get().selectedCategory);
        },

        removeTemplate: (templateId) => {
          set(state => ({
            templates: state.templates.filter(t => t.id !== templateId),
            filteredTemplates: state.filteredTemplates.filter(t => t.id !== templateId)
          }));
        },

        updateAgent: (agentId, updates) => {
          set(state => ({
            agents: state.agents.map(agent =>
              agent.id === agentId ? { ...agent, ...updates } : agent
            )
          }));
        },

        addTask: (task) => {
          set(state => ({
            activeTasks: [task, ...state.activeTasks]
          }));
        },

        updateTask: (taskId, updates) => {
          set(state => ({
            activeTasks: state.activeTasks.map(task =>
              task.id === taskId ? { ...task, ...updates } : task
            )
          }));
        },

        // Helper methods (not part of interface but useful)
        updateAnalyticsFromMeme: (meme) => {
          const state = get();
          const currentAnalytics = state.analytics || {
            totalMemes: 0,
            averagePainLevel: 5,
            popularCategories: [],
            popularTemplates: [],
            painTrends: [],
            topKeywords: []
          };

          // Update total memes
          currentAnalytics.totalMemes++;

          // Update average pain level
          const totalPain = state.generatedMemes.reduce((sum, m) => sum + m.painScore, 0) + meme.painScore;
          currentAnalytics.averagePainLevel = totalPain / (state.generatedMemes.length + 1);

          // Update popular categories
          const categoryIndex = currentAnalytics.popularCategories.findIndex(c => c.category === meme.category);
          if (categoryIndex >= 0) {
            currentAnalytics.popularCategories[categoryIndex].count++;
          } else {
            currentAnalytics.popularCategories.push({ category: meme.category, count: 1 });
          }

          // Update popular templates
          const templateIndex = currentAnalytics.popularTemplates.findIndex(t => t.templateId === meme.templateId);
          if (templateIndex >= 0) {
            currentAnalytics.popularTemplates[templateIndex].usage++;
          } else {
            currentAnalytics.popularTemplates.push({ templateId: meme.templateId, usage: 1 });
          }

          // Update template popularity
          const template = state.templates.find(t => t.id === meme.templateId);
          if (template) {
            template.popularity = Math.min(100, template.popularity + 1);
          }

          // Sort arrays
          currentAnalytics.popularCategories.sort((a, b) => b.count - a.count);
          currentAnalytics.popularTemplates.sort((a, b) => b.usage - a.usage);

          set({ analytics: currentAnalytics });
        },

        // Initialize default templates
        initializeDefaultTemplates: async () => {
          const svgMaker = SVGMakerService.getInstance();
          
          const defaultPrompts = [
            { prompt: 'Drake format meme template', category: 'general' as const },
            { prompt: 'This is fine burning room template', category: 'general' as const },
            { prompt: 'Distracted boyfriend template', category: 'general' as const },
            { prompt: 'Two buttons choice template', category: 'general' as const },
            { prompt: 'Expanding brain intelligence levels', category: 'general' as const },
            { prompt: 'Surprised Pikachu reaction template', category: 'general' as const },
            { prompt: 'Woman yelling at cat template', category: 'general' as const },
            { prompt: 'Hide the pain Harold template', category: 'general' as const },
            { prompt: 'Change my mind debate template', category: 'general' as const },
            { prompt: 'Galaxy brain enlightenment template', category: 'general' as const },
            // Engineering-specific templates
            { prompt: 'Mechanical engineering gears problem', category: 'mechanical' as const },
            { prompt: 'Electrical circuit debugging nightmare', category: 'electrical' as const },
            { prompt: 'Software code review disaster', category: 'software' as const },
            { prompt: 'Civil engineering foundation issues', category: 'civil' as const },
            { prompt: 'Chemical process safety incident', category: 'chemical' as const }
          ];

          const templates = await Promise.all(
            defaultPrompts.map(({ prompt, category }) => 
              svgMaker.generateMemeTemplate(prompt, category)
            )
          );

          set({ 
            templates,
            filteredTemplates: templates
          });
        }
      }),
      {
        name: 'meme-generator-store',
        partialize: (state) => ({
          generatedMemes: state.generatedMemes,
          analytics: state.analytics,
          templates: state.templates,
          agents: state.agents
        })
      }
    ),
    { name: 'MemeStore' }
  )
);