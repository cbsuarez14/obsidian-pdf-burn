import { App, Modal, Notice, Setting } from "obsidian";

export class PostFilterOptionsModal extends Modal {
	plugin: any;
	onContinue: () => void;

	constructor(app: App, plugin: any, onContinue: () => void) {
		super(app);
		this.plugin = plugin;
		this.onContinue = onContinue;
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();
		contentEl.createEl("h2", { text: "Opciones tras aplicar filtros" });

		// Campo para nombre del nuevo PDF (habilitado solo si "Escribir en PDF" está activado)
		let pdfNameInput: HTMLInputElement;


		// Opción para exportar a JSON
		new Setting(contentEl)
			.setName("Exportar a JSON")
			.setDesc("Exporta las anotaciones encontradas a un archivo JSON.")
			.addToggle((toggle) =>
				toggle
					.setValue(false)
					.onChange((value) => {
						this.plugin.settings.exportToJSON = value;
						this.plugin.saveSettings();
					})
			);

		// Opción para mapear rectángulo
		// new Setting(contentEl)
		// 	.setName("Mapear rectángulo de selección")
		// 	.setDesc("Mapea el rectángulo de selección en el PDF.")
		// 	.addToggle((toggle) =>
		// 		toggle
		// 			.setValue(false)
		// 			.onChange((value) => {
		// 				this.plugin.settings.mapRectangles = value;
		// 				this.plugin.saveSettings();
		// 			})
		// 	);

		// Opción para escribir en el PDF (controla habilitación del nombre)
		new Setting(contentEl)
			.setName("Escribir en el PDF")
			.setDesc("Muestra las anotaciones en el PDF mediante rectángulos.")
			.addToggle((toggle) =>
				toggle
					.setValue(false)
					.onChange((value) => {
						this.plugin.settings.writeToPDF = value;
						this.plugin.saveSettings();
						// Activar o desactivar campo de nombre
						pdfNameInput.disabled = !value;
					})
			);
		
		new Setting(contentEl)
			.setName("Nombre del nuevo PDF")
			.setDesc("Nombre del archivo PDF que se generará")
			.addText((text) => {
				text
					.setPlaceholder("testing.pdf")
					.setValue("")
					.setDisabled(true) // ← empieza desactivado
					.onChange((value) => {
						this.plugin.settings.newPDFName = value;
						this.plugin.saveSettings();
					});
				pdfNameInput = text.inputEl;
			});

		new Setting(contentEl)
			.setName("Nombre del archivo JSON")
			.setDesc("Nombre del archivo JSON que se generará")
			.addText((text) => {
				text
					.setPlaceholder("PDF_annotations.json")
					.setValue("")
					.setDisabled(true) // ← empieza desactivado
					.onChange((value) => {
						this.plugin.settings.JSONnewPath = value;
						this.plugin.saveSettings();
					});
				
			});


		// Botón continuar
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Aplicar estas opciones")
					.setCta()
					.onClick(() => {
						const name = this.plugin.settings.newPDFName;
						if(!this.isValidFilename(name)) {
							new Notice("❌ Nombre de PDF inválido. Evita usar caracteres como \\ / : * ? \" < > |");
							return;
						}
						this.close();
						this.onContinue();
					})
			);
	}

	onClose() {
		this.contentEl.empty();
	}

	isValidFilename(name: string): boolean {
		// Windows-invalid characters: \ / : * ? " < > |
		const invalidPattern = /[\\\/:*?"<>|]/;
		return !invalidPattern.test(name.trim()) && name.trim().length > 0;
	}

}
