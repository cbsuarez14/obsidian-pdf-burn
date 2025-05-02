import { Plugin } from "obsidian";
import { LabelModal } from "../view/view"; // Importamos el modal personalizado
import { ExampleSettingsTab, ExamplePluginSettings, DEFAULT_SETTINGS } from "../settings/SettingsTab";

export default class ExamplePlugin extends Plugin {
	
	settings: ExampleSettingsTab;

	// async onload() {

	// 	// Cargar los ajustes
	// 	await this.loadSettings();

	// 	console.log("Plugin cargado");

	// 	//const pdfplus = (this.app as any).plugins.getPlugin("pdf-plus");
	// 	const pdfplus2 = (this.app as any).plugins.plugins["pdf-plus"];
		
	// 	// Verificar si el plugin PDF++ está cargado
	// 	if (!pdfplus2) {
	// 		console.warn("PDF++ no está cargado");
	// 		//return;
	// 	}
	// 	else{
	// 		console.log("PDF++ se ha cargado correctamente");
	// 	}

	// 	// Añadir un ícono personalizado a la barra lateral
	// 	this.addRibbonIcon("pencil", "Open Label Window", () => {
	// 		// Abrir el modal personalizado
	// 		new LabelModal(this.app, this, pdfplus2).open();
	// 	});

	// 	this.addSettingTab(new ExampleSettingsTab(this.app, this));
	// }

	async onload() {

		await this.loadSettings();
		
		console.log("Plugin cargado");
		
		this.app.workspace.onLayoutReady(() => {
			const pdfplus = (this.app as any).plugins.plugins["pdf-plus"];
	
			if (!pdfplus) {
				console.warn("PDF++ no está cargado");
				return;
			}
	
			console.log("PDF++ cargado correctamente");
			console.log(pdfplus);
	
			this.addRibbonIcon("pencil", "Abrir configuración", () => {
				new LabelModal(this.app, this, pdfplus).open();
			});

			this.addSettingTab(new ExampleSettingsTab(this.app, this));
		});
	}
	

	onunload() {
		console.log("Plugin descargado.");
	}

	// Metodo para cargar los ajustes
	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	// Método para guardar ajustes
	async saveSettings() {
		await this.saveData(this.settings);
	}
}
