"use client";

import { useState } from "react";
import {
    ChevronDown,
    ChevronUp,
    Menu,
} from "lucide-react";
import { SidebarSection, SidebarItem, SubItem, SidebarData } from "@/lib/types/sidebar";
import { renderIcon } from "@/lib/utils/icons";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { useTranslations } from "next-intl";
import { useSidebarStore } from "@/lib/stores/sidebar-store";

interface SidebarContentProps {
    data: SidebarData;
    isCollapsed?: boolean;
    onToggle?: () => void;
    canToggle?: boolean;
    isMobile?: boolean;
}

export function SidebarContent({
    data,
    isCollapsed = false,
    onToggle,
    canToggle = true,
    isMobile = false
}: SidebarContentProps) {
    const t = useTranslations("appSidebar");

    // Use Zustand store for state management
    const {
        expandedSections,
        expandedTopics,
        showAdditionalCategories,
        toggleSection,
        toggleTopic,
        setShowAdditionalCategories
    } = useSidebarStore();

    // Function to get all flattened items from sections
    const getFlattenedItems = () => {
        const items = [];

        // Add Popular first
        items.push({
            title: data.popular.title,
            icon: data.popular.icon,
            url: data.popular.url,
            isPopular: true
        });

        // Add items from each section with section titles
        data.sections.forEach(section => {
            // Add section title as separator
            items.push({
                title: section.title,
                icon: null,
                url: null,
                isSectionTitle: true
            });

            // Add items from this section
            section.items.forEach(item => {
                items.push({
                    ...item,
                    sectionTitle: section.title
                });
            });
        });

        return items;
    };

    const isDesktop = useMediaQuery("(min-width: 1024px)");

    return (
        <div className={`${isMobile ? 'w-full' : isCollapsed ? 'w-24' : 'w-64'} bg-background ${!isMobile ? 'border-r border-border' : ''} text-foreground h-full transition-all duration-300 flex flex-col`}>
            {/* Popular Section */}
            {isDesktop && !isMobile ? (
                <div className="p-4 border-b border-border">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
                        {!isCollapsed && (
                            <div className="flex items-center space-x-3">
                                {renderIcon(data.popular.icon)}
                                <span className="font-medium text-foreground">{t(data.popular.title)}</span>
                            </div>
                        )}
                        {canToggle && (
                            <button
                                onClick={onToggle}
                                className={`${isCollapsed ? 'mx-auto' : 'ml-auto'} p-2 rounded-md hover:bg-muted/50 transition-colors border border-border/50 hover:border-border`}
                                aria-label="Toggle sidebar"
                            >
                                <Menu className="w-5 h-5 text-muted-foreground" />
                            </button>
                        )}
                    </div>
                </div>
            ) : !isMobile ? (
                <div className="h-4" />
            ) : (
                // Mobile version - Popular section in header
                <div className="p-4 border-b border-border">
                    <div className="flex items-center space-x-3">
                        {renderIcon(data.popular.icon)}
                        <span className="font-medium text-foreground">{t(data.popular.title)}</span>
                    </div>
                </div>
            )}

            {/* Scrollable content container */}
            <div className="flex-1 overflow-y-auto">
                {/* Collapsed Categories - Only for desktop */}
                {isCollapsed && !isMobile && (
                    <div className="py-4 space-y-6">
                        {getFlattenedItems().map((item, index) => {
                            // Handle section titles
                            if ((item as any).isSectionTitle) {
                                return (
                                    <div key={index} className="flex flex-col items-center space-y-2">
                                        <div className="w-full h-px bg-border/50 mb-2"></div>
                                        <span className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider text-center">
                                            {item.title}
                                        </span>
                                    </div>
                                );
                            }

                            // Handle regular items
                            return (
                                <div key={index} className="flex flex-col items-center space-y-2">
                                    <button
                                        className={`p-2 rounded-lg transition-colors relative ${item.title === "Popular"
                                            ? "bg-muted/30 border border-border/50 hover:bg-muted/50"
                                            : "hover:bg-muted/50"
                                            }`}
                                        onClick={() => {
                                            if (item.url) {
                                                window.location.href = item.url;
                                            }
                                        }}
                                    >
                                        {renderIcon(item.icon)}
                                        {(item as any).badge && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></div>
                                        )}
                                    </button>
                                    <span className={`text-[10px] text-center leading-tight max-w-[60px] break-words ${item.title === "Popular"
                                        ? "text-foreground font-medium"
                                        : "text-muted-foreground"
                                        }`}>
                                        {item.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Sections */}
                {!isCollapsed && data.sections.map((section: SidebarSection) => {
                    // Separate main items from additional categories
                    const mainItems = section.items.slice(0, 6); // First 6 items are main categories
                    const additionalItems = section.items.slice(6); // Rest are additional categories

                    return (
                        <div key={section.title} className="border-b border-border">
                            {/* Section Header */}
                            <div
                                className="px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => toggleSection(section.title)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                        {t(section.title)}
                                    </span>
                                    {expandedSections[section.title] ? (
                                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                    ) : (
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    )}
                                </div>
                            </div>

                            {/* Section Content */}
                            {expandedSections[section.title] && (
                                <div className="pb-2">
                                    {/* Main Items */}
                                    {mainItems.map((item: SidebarItem, index: number) => {
                                        const sidebarItem = item as SidebarItem;
                                        return (
                                            <div key={index}>
                                                {/* Main Item */}
                                                <div
                                                    className={`px-4 py-2 hover:bg-muted/50 transition-colors ${sidebarItem.subitems && sidebarItem.subitems.length > 0 ? 'cursor-pointer' : ''}`}
                                                    onClick={() => {
                                                        if (sidebarItem.subitems && sidebarItem.subitems.length > 0) {
                                                            toggleTopic(sidebarItem.title);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        {renderIcon(sidebarItem.icon)}
                                                        <span className="text-sm text-foreground">{t(sidebarItem.title)}</span>
                                                        {sidebarItem.badge && (
                                                            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                                                                {sidebarItem.badge}
                                                            </span>
                                                        )}
                                                        {sidebarItem.subitems && sidebarItem.subitems.length > 0 && (
                                                            <div className="ml-auto">
                                                                {expandedTopics[sidebarItem.title] ? (
                                                                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                                                                ) : (
                                                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Subitems */}
                                                {sidebarItem.subitems && sidebarItem.subitems.length > 0 && expandedTopics[sidebarItem.title] && (
                                                    <div className="ml-8 space-y-1">
                                                        {sidebarItem.subitems.map((subitem: SubItem, subIndex: number) => (
                                                            <div key={subIndex} className="px-4 py-1.5 hover:bg-muted/50 transition-colors">
                                                                <a
                                                                    href={subitem.url}
                                                                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                                >
                                                                    {t(subitem.title)}
                                                                </a>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Additional Categories */}
                                    {showAdditionalCategories && additionalItems.map((item: SidebarItem, index: number) => (
                                        <div key={`additional-${index}`} className="px-4 py-2 hover:bg-muted/50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                {renderIcon(item.icon)}
                                                <a
                                                    href={item.url}
                                                    className="text-sm text-foreground hover:text-primary transition-colors"
                                                >
                                                    {t(item.title)}
                                                </a>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Show More/Less Button */}
                                    {section.showMore && additionalItems.length > 0 && (
                                        <div className="px-4 py-2">
                                            <button
                                                onClick={() => setShowAdditionalCategories(!showAdditionalCategories)}
                                                className="text-sm text-primary hover:text-primary/80 transition-colors"
                                            >
                                                {showAdditionalCategories ? t("actions.verMenos") : t("actions.verMas")}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer */}
            {!isCollapsed && (
                <div className="p-4 border-t border-border">
                    <div className="text-xs text-muted-foreground text-center">
                        {t("footer")}
                    </div>
                </div>
            )}
        </div>
    );
}
