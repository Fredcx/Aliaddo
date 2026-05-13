"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Settings {
    id: string;
    profile_id: string;
    rules_text: string;
    form_fields: any[];
    form_cover_image_url: string | null;
    primary_color: string;
    template: string;
    intro_text: string;
    outro_text: string;
    structure_text: string;
    updated_at: string;
}

interface SettingsContextType {
    settings: Settings | null;
    username: string;
    isLoading: boolean;
    refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [username, setUsername] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const r = await fetch("/api/settings");
            if (r.ok) {
                const d = await r.json();
                setSettings(d.settings || null);
                setUsername(d.username || "");
            }
        } catch (error) {
            console.error("Error fetching settings in context:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, username, isLoading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}
