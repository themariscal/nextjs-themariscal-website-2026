import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isCollapsed: boolean;
  expandedSections: Record<string, boolean>;
  expandedTopics: Record<string, boolean>;
  showAdditionalCategories: boolean;
  toggleSidebar: () => void;
  setCollapsed: (collapsed: boolean) => void;
  toggleSection: (sectionTitle: string) => void;
  toggleTopic: (topicTitle: string) => void;
  setShowAdditionalCategories: (show: boolean) => void;
  setExpandedSections: (sections: Record<string, boolean>) => void;
  setExpandedTopics: (topics: Record<string, boolean>) => void;
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      expandedSections: {
        "sections.reciente": true,
        "sections.temas": true,
        "sections.recursos": true,
        "sections.comunidades": true,
        "sections.legal": true,
      },
      expandedTopics: {
        "categories.culturaInternet": true,
        "categories.juegos": true,
        "categories.preguntasRespuestas": true,
        "categories.tecnologia": true,
        "categories.culturaPop": true,
        "categories.peliculasTV": true,
      },
      showAdditionalCategories: false,
      toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
      setCollapsed: (collapsed: boolean) => set({ isCollapsed: collapsed }),
      toggleSection: (sectionTitle: string) => set((state) => ({
        expandedSections: {
          ...state.expandedSections,
          [sectionTitle]: !state.expandedSections[sectionTitle]
        }
      })),
      toggleTopic: (topicTitle: string) => set((state) => ({
        expandedTopics: {
          ...state.expandedTopics,
          [topicTitle]: !state.expandedTopics[topicTitle]
        }
      })),
      setShowAdditionalCategories: (show: boolean) => set({ showAdditionalCategories: show }),
      setExpandedSections: (sections: Record<string, boolean>) => set({ expandedSections: sections }),
      setExpandedTopics: (topics: Record<string, boolean>) => set({ expandedTopics: topics }),
    }),
    {
      name: 'sidebar-storage', // unique name for localStorage key
      partialize: (state) => ({
        expandedSections: state.expandedSections,
        expandedTopics: state.expandedTopics,
        showAdditionalCategories: state.showAdditionalCategories,
        isCollapsed: state.isCollapsed,
      }),
    }
  )
);
