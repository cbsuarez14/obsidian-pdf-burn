import
{
    App,
    Setting,
    PluginSettingTab
} from "obsidian";

// Interfaz para definir los ajustes del plugin
export interface ExamplePluginSettings {
    optionEnabled: boolean;
    customMessage: string;
}

// Configuración por defecto
export const DEFAULT_SETTINGS: ExamplePluginSettings = {
    optionEnabled: false,
    customMessage: "Hello, Obsidian!",
};

export class ExampleSettingsTab extends PluginSettingTab
{
    plugin: any;

    constructor(app: App, plugin: any) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void
    {

        // Creamos el elemento container
        const {containerEl} = this;
        containerEl.empty();

        // Titulo del panel de ajustes
        containerEl.createEl("h1", { text: "Welcome to ExamplePlugin!"})
        containerEl.createEl("p", { text: "Created by Carlos Bravo Suárez."})

    }
}