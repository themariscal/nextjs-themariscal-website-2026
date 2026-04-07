
export interface SubItem {
    title: string;
    url: string;
}
  
export interface SidebarItem {
    title: string;
    icon: string; 
    url?: string;
    badge?: string;
    isExpanded?: boolean;
    subitems?: SubItem[];
}

export interface SidebarSection {
    title: string;
    icon: string | null; 
    items: SidebarItem[];
    showMore?: boolean;
}

export interface SidebarData {
    popular: {
        title: string;
        icon: string; 
        url: string;
    };
    sections: SidebarSection[];
}

export interface AppSidebarProps {
    data: SidebarData;
    isCollapsed?: boolean;
    onToggle?: () => void;
    canToggle?: boolean;
  }