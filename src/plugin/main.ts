import { Plugin } from "obsidian";
import { LabelModal } from "../view/view"; // Importamos el modal personalizado
import { ExampleSettingsTab } from "../settings/SettingsTab";
import { Settings, DEFAULT_SETTINGS } from "../view/viewData";

export default class ExamplePlugin extends Plugin {
	
	settings: Settings;

	async onload() {

		await this.loadSettings();
				
		this.app.workspace.onLayoutReady(() => {
			const pdfplus = (this.app as any).plugins.plugins["pdf-plus"];
	
			if (!pdfplus) {
				console.warn("PDF++ no está cargado");
				return;
			}
			console.log("PDF++ cargado correctamente");
	
			this.addRibbonIcon("pencil", "Abrir configuración", () => {
				new LabelModal(this.app, this, pdfplus).open();
			});

			this.addSettingTab(new ExampleSettingsTab(this.app, this));
		});
	}
	
	// Método para guardar ajustes
	async saveSettings() {
		await this.saveData(this.settings);
	}

	// Metodo para cargar los ajustes
	async loadSettings() {
		// Ignorar ajustes guardados → siempre usar los valores por defecto
		this.settings = Object.assign({}, DEFAULT_SETTINGS);
	}


	onunload() {
		console.log("Plugin descargado.");
	}
}
