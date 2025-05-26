import
{
    App,
    Setting,
    PluginSettingTab
} from "obsidian";

import { Settings } from "../view/viewData";

// Interfaz para definir los ajustes del plugin
// export interface ExamplePluginSettings {
//     optionEnabled: boolean;
//     customMessage: string;
//     opacity: number
// }

// // Configuración por defecto
// export const DEFAULT_SETTINGS: ExamplePluginSettings = {
//     optionEnabled: false,
//     customMessage: "Hello, Obsidian!",
//     opacity: 1.0
// };

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
        containerEl.createEl("h1", { text: "Welcome to PDFburn!"})
        containerEl.createEl("p", { text: "Created by Carlos Bravo Suárez."})

        new Setting(this.containerEl)
            .setName("Opacidad del resaltado")
            .setDesc("Entre 0 (transparente) y 1 (opaco)")
            .addSlider(slider =>
                slider
                    .setLimits(0, 1, 0.05)
                    .setValue(this.plugin.settings.opacity)
                    .setDynamicTooltip()
                    .onChange(async (value) => {
                        this.plugin.settings.opacity = value;
                        await this.plugin.saveSettings();
                    })
        );

        // Nombre del autor
        new Setting(this.containerEl)
            .setName("Autor")
            .setDesc("Introduce el nombre del autor")
            .addText(text => text
                .setValue(this.plugin.settings.author)
                .onChange(async (value) => {
                    this.plugin.settings.author = value;
                    await this.plugin.saveSettings();
                })
        );

        new Setting(this.containerEl)
            .setName("Ruta del nuevo PDF")
            .setDesc("Ruta donde se guardará el nuevo PDF generado.\nIMPORTANTE: no utilizar '/' inicial.")
            .addText(text => text
                .setValue(this.plugin.settings.PDFnewPath)
                .onChange(async (value) => {
                    this.plugin.settings.PDFnewPath = value.trim();
                    await this.plugin.saveSettings();
                })
        );

        new Setting(this.containerEl)
            .setName("Ruta del archivo JSON")
            .setDesc("Ruta donde se guardará el archivo JSON generado.\nIMPORTANTE: no utilizar '/' inicial.")
            .addText(text => text
                .setValue(this.plugin.settings.JSONnewPath)
                .onChange(async (value) => {
                    this.plugin.settings.PDFnewPath = value.trim();
                    await this.plugin.saveSettings();
                })
        );



    }
}