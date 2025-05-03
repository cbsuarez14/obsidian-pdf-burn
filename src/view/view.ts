import { TFile } from "obsidian";
import { Modal, App, Setting, Notice } from "obsidian";
import { PDFSelectorModal } from "./PDFSelectorModal"; // Adjust the path as necessary
import { MarkdownSelectorModal } from "./MarkdownSelectorModal"; 
import { filterCOLOR, copyFORMATS, displayFORMATS } from "./viewData"; // Importa las opciones de filtro de color y tipo de copiado

export class LabelModal extends Modal {

	plugin: any
	pdfplus: any;
	selectedPDF: string;
	newPDFName: string; // por defecto "testing"
	tagValue: string;
	markdownFile: string;

	constructor(app: App, plugin: any, pdfplus: any) {
		super(app);
		this.plugin = plugin;
		this.pdfplus = pdfplus;
	}

	onOpen() {
		
		const { contentEl } = this;

		// Titulo de la pestaña
		contentEl.createEl("div", {
			cls: "modal-title",
			text: "Configuración de filtros"
		})

		
		new Setting(contentEl)
			.setName("Seleccione un PDF")
			.setDesc("Seleccione un archivo PDF para empezar!")
			.addButton((btn) =>
				btn
					.setButtonText("Abrir selector de PDFs")
					.setCta()
					.onClick(() => {
						// Abrir el selector de archivos
						new PDFSelectorModal(this.app, this.plugin, (pdfPath) => {
							this.selectedPDF = pdfPath;
							new Notice(`Archivo PDF seleccionado: ${this.selectedPDF}`);
						}).open();
					})
			);

		
		new Setting(contentEl)
			.setName("Seleccione un archivo Markdown")
			.setDesc("Seleccione un archivo markdown para empezar!")
			.addButton((btn) =>
				btn
					.setButtonText("Abrir selector de Markdowns")
					.setCta()
					.onClick(() => {
						// Abrir el selector de archivos
						new MarkdownSelectorModal(this.app, this.plugin, (markdownfile) => {
							this.markdownFile = markdownfile.trim();
							new Notice(`Archivo Markdown seleccionado desde view.ts: ${this.markdownFile}`);
						}).open();
					})
			);


		// Filtro por color del comentario
		new Setting(contentEl)
			.setName("Filtro por color de la anotación")
			.setDesc("Seleccione un color por el que quiere filtrar las anotaciones.")
			.addDropdown((dropdown) => {
				filterCOLOR.forEach((color) => dropdown.addOption(color, color));

				dropdown
					.setValue(this.plugin.settings.filterColor)
					.onChange((value) => {
						this.plugin.settings.filterColor = value;
						this.plugin.saveData(this.plugin.settings);
					});
				
			});
			

		// Filtro por tipo de copiado
		new Setting(contentEl)
			.setName("Filtro por tipo de copiado")
			.setDesc("Seleccione un tipo de copiado por el que se desea filtrar las anotaciones.")
			.addDropdown((dropdown) => {
				copyFORMATS.forEach((format) => dropdown.addOption(format, format));

				dropdown
					.setValue(this.plugin.settings.copyFormat)
					.onChange((value) => {
						this.plugin.settings.copyFormat = value;
						this.plugin.saveData(this.plugin.settings);
					});
			});
		
		// Filtro por el formato de visualización de la anotación
		new Setting(contentEl)
			.setName("Filtro por formato de visualización de la anotación")
			.setDesc("Seleccione un formato de visualización por el que se desea filtrar las anotaciones.")
			.addDropdown((dropdown) => {
				displayFORMATS.forEach((format) => dropdown.addOption(format, format));

				dropdown
					.setValue(this.plugin.settings.displayFormat)
					.onChange((value) => {
						this.plugin.settings.displayFormat = value;
						//this.plugin.saveData(this.plugin.settings);
					});
			});		



		// Filtro por tag de la anotación
		new Setting(contentEl)
			.setName("Filtro por tag de la anotación")
			.setDesc("Introduce un tag por el que se desea filtrar las anotaciones.")
			.addText((text) =>
				text
					.setPlaceholder("#tag")
					.onChange((value) => {
						this.tagValue = value;
					})
			);

		// Nombre del nuevo PDF
		new Setting(contentEl)
			.setName("Introduce el nombre del nuevo PDF")
			.setDesc("Introduce el nombre del nuevo PDF que se generará al copiar el PDF seleccionado.\nSi no se indica ningún nombre tendrá el nombre 'testing.pdf'")
			.addText((text) =>
				text
					.setPlaceholder("Nuevo PDF")
					.onChange((value) => {
						this.newPDFName = value;
					})
			);


		contentEl.createEl("p", { text: "Opciones adicionales" });
	
		
		// Opción para exportar las anotaciones encontradas a un archivo JSON
		new Setting(contentEl)
			.setName("Exportar a JSON")
			.setDesc("Exporta las anotaciones encontradas a un archivo JSON.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.exportToJSON)
					.onChange((value) => {
						this.plugin.settings.exportToJSON = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
		
		// Opción para mapear el rectángulo de selección
		new Setting(contentEl)
			.setName("Mapear rectángulo de selección")
			.setDesc("Mapea el rectángulo de selección en el PDF.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.mapRectangles)
					.onChange((value) => {
						this.plugin.settings.mapRectangles = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);
			

		// Opción para mostrar el rectángulo de selección en el PDF
		new Setting(contentEl)
			.setName("Escribir el rectángulo de selección en el PDF")
			.setDesc("Muestra las anotaciones en el PDF mediante rectángulos.")
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.writeToPDF)
					.onChange((value) => {
						this.plugin.settings.writeToPDF = value;
						this.plugin.saveData(this.plugin.settings);
					})
			);

			
		// Botón para aplicar los filtros
		new Setting(contentEl)
			.addButton((btn) =>
				btn
					.setButtonText("Aplicar filtros")
					.setCta()
					.onClick(async () => {
						// Comprobamos que haya un archivo PDF seleccionado
						this.applyFilters();
					})
			);
		
	}


	

	/**	
	 * Encuentra todas las anotaciones PDF++ en un archivo PDF
	*/ 
	// async findPDFAnnotations(pdfPath: string, color?: string, tag?:string, markdownFile?: string): Promise<string[]> {

	// 	// Obtener todos los archivos Markdown de la Vault
	// 	const files = this.app.vault.getMarkdownFiles();

	// 	// Variable para almacenar las anotaciones encontradas
	// 	const annotations: string[] = [];

	// 	// Obtener solo el nombre del archivo PDF (sin la ruta)
	// 	const pdfName = pdfPath.split("/").pop(); // Extrae el nombre del archivo
	// 	console.log(`Buscando anotaciones para: ${pdfName}`); // Depuración
	
	// 	for (const file of files) {
	// 		// Si se especifica un archivo Markdown, saltar si no coincide con el archivo actual
	// 		if(markdownFile && file.basename !== markdownFile) continue;

	// 		// Leer el contenido del archivo
	// 		const content = await this.app.vault.read(file);
	
	// 		console.log(`Leyendo archivo: ${file.path}`); // Depuración
	
	// 		// Expresión regular para buscar anotaciones PDF++ en caso de que haya color o no
	// 		const matches = color 
	// 			? content.match(new RegExp(`\\[!PDF\\|${color}\\]\\s*\\[\\[${pdfName}#.*?\\]\\]`, "gi"))
	// 			: content.match(new RegExp(`\\[!PDF\\|.*?\\]\\s*\\[\\[${pdfName}#.*?\\]\\]`, "g"));
	
	// 		if (matches) {
	// 			matches.forEach((match) => {
	// 				// Si se especifica un tag, verificar que el contenido de la nota lo contenga
	// 				if (tag && !content.includes(tag)) {
	// 					return; // Saltar si el tag no está presente
	// 				}
	
	// 				annotations.push(match); // Agregar anotación si cumple con los filtros
	// 			});
	// 		}
	// 	}
	
	// 	console.log(`Anotaciones encontradas:`, annotations); // Depuración
	// 	return annotations;
	// }
	

	/**
	 * Encuentra todas las anotaciones PDF++ en un archivo PDF, aplicando filtros opcionales.
	 */
	async findPDFAnnotations(pdfPath: string, color?: string, tag?: string, markdownFile?: string, displayFormat?: string, linkFormat?: string): Promise<{ raw: string; context: string }[]> {

		// Obtener todos los archivos Markdown de la Vault
		const files = this.app.vault.getMarkdownFiles();

		// Variable para almacenar las anotaciones encontradas
		const annotations: { raw: string; context: string }[] = [];


		// Obtener solo el nombre del archivo PDF (sin la ruta)
		const pdfName = pdfPath.split("/").pop(); // Extrae el nombre del archivo
		console.log(`Buscando anotaciones para: ${pdfName}`);

		for (const file of files) {
			// Si se especifica un archivo Markdown, saltar si no coincide con el archivo actual
			if (markdownFile && file.basename !== markdownFile) continue;

			// Leer el contenido del archivo
			const content = await this.app.vault.read(file);
			console.log(`Leyendo archivo: ${file.path}`);

			// Expresión regular para capturar anotaciones PDF++ con texto después del "|"
			const regexPattern = `\\[!PDF\\|.*?\\]\\s*\\[\\[${pdfName}#.*?(?:\\|(.*?))?\\]\\]`; // captura solo Callout & Quote in callout
			const regexPattern2 = `(?:\\[!PDF\\|.*?\\])?\\s*\\[\\[${pdfName}#.*?(?:\\|(.*?))?\\]\\]`;
			const regexPattern3 = `(?:\\)?\\s*\\[\\[${pdfName}#.*?(?:\\|(.*?))?\\]\\]`;

			const matches = content.matchAll(new RegExp(regexPattern2, "gi"));	

			for (const match of matches) {
				
				const annotation = match[1]? match[1].trim() : ""; // Extrae el texto después del '|' si existe match[1], si no "".
		
				const detectedDisplayFormat = this.detectDisplayFormat(annotation); // Detectar DisplayFormat
				const detectedLinkFormat = this.detectLinkFormat(match[0], content); // Detectar LinkFormat
				
				//console.log("Detectedlinkformat: ", detectedLinkFormat )
				//console.log(`Anotación detectada: ${match} \n Formato detectado: ${detectedDisplayFormat} || ${detectedLinkFormat}`);
			
				const context = await this.getBacklinkContext(file.path, match[0]); // Obtener el contexto de la anotación
				//console.log("🧩 Contexto de la anotación:", context);

				// Aplicar filtro de display format (si está seleccionado)
				if (displayFormat && displayFormat !== detectedDisplayFormat) {
					continue; // Saltar si el formato no coincide
				}

				// if(linkFormat && linkFormat !== detectedLinkFormat) {
				// 	continue; // Saltar si el formato de link no coincide
				// }
				
				// Si se especifica un tag, verificar que el contenido de la nota lo contenga
				if (tag && !context.includes(tag)) {
					//console.log(`⛔ Anotación descartada por no contener el tag '${tag}'`)
					continue; // Saltar si el tag no está presente
				}
			
				// Si se especifica un color, verificar que coincida con la anotación
				if (color && !match[0].includes(`|${color}]`)) {
					continue; // Saltar si el color no coincide
				}
			
				annotations.push({ raw: match[0], context }); // Agregar anotación si cumple con los filtros
			}
			
		}

		console.log(`Anotaciones encontradas:`, annotations);
		return annotations;
}


	/**
	 * Funcion que exporta las anotaciones encontradas a un archivo JSON
	 */
	// async exportToJSON(pdfPath: string, annotations: string[]) {
	// 	const fs = require("fs");
	// 	const path = require("path");
	
	// 	const folderPath = pdfPath.substring(0, pdfPath.lastIndexOf("/"));
	// 	const pdfName = pdfPath.split("/").pop()?.replace(".pdf", "");
	
	// 	if (!pdfName) {
	// 		new Notice("Error al obtener el nombre del PDF.");
	// 		return;
	// 	}
	
	// 	// Definir la ruta del archivo JSON
	// 	const jsonFilePath = path.join((this.app.vault.adapter as any).basePath, folderPath, `${pdfName}_annotations.json`);
	
	// 	const processedAnnotations = annotations.map((annotation) => {
	// 		const colorMatch = annotation.match(/\[!PDF\|(\w+)\]/);
	// 		const linkMatch = annotation.match(/\[\[(.*?\.pdf#page=\d+.*?)\|/);
	// 		const pageMatch = annotation.match(/#page=(\d+)/);
	// 		const selection = this.getSelectionCoordinates(annotation);
	// 		const textMatch = annotation.match(/\[\[(?:.*?#page=\d+.*?)\|(.*?)\]\]/);
	// 		const contextMatch = annotation.match(/(> .*)/);
			
	// 		return {
	// 			color: colorMatch ? colorMatch[1] : "unknown",
	// 			page: pageMatch ? parseInt(pageMatch[1], 10) : null,
	// 			text: textMatch ? textMatch[1] : "",
	// 			selecion: selection ? selection : null,
	// 			link: linkMatch ? linkMatch[1] : "",
	// 			context: contextMatch ? contextMatch[1] : annotation,
	// 			source: pdfPath // La ruta del PDF como referencia
	// 		};
	// 	});
	
	// 	const jsonData = JSON.stringify(processedAnnotations, null, 4);
	
	// 	try {
	// 		fs.writeFileSync(jsonFilePath, jsonData);
	// 		new Notice(`JSON exportado con éxito: ${jsonFilePath}`);
	// 	} catch (error) {
	// 		console.error("Error al exportar a JSON:", error);
	// 		new Notice("Error al exportar a JSON.");
	// 	}
	// }


	async exportParsedAnnotationsToJSON(pdfPath: string, parsedAnnotations: any[]) {
		const fs = require("fs");
		const path = require("path");
	
		const folderPath = pdfPath.substring(0, pdfPath.lastIndexOf("/"));
		const pdfName = pdfPath.split("/").pop()?.replace(".pdf", "");
	
		if (!pdfName) {
			new Notice("Error al obtener el nombre del PDF.");
			return;
		}
	
		// Definir la ruta del archivo JSON
		const jsonFilePath = path.join((this.app.vault.adapter as any).basePath, folderPath, `${pdfName}_annotations.json`);
	
		// Crear el JSON directamente desde los parsedAnnotations
		const jsonData = JSON.stringify(parsedAnnotations, null, 4);
	
		try {
			fs.writeFileSync(jsonFilePath, jsonData);
			new Notice(`JSON exportado con éxito: ${jsonFilePath}`);
		} catch (error) {
			console.error("Error al exportar a JSON:", error);
			new Notice("Error al exportar a JSON.");
		}
	}
	
	
	

	/**
	 * Muestra las anotaciones encontradas en el modal
	 */
	showAnnotations(contentEl: HTMLElement, annotations: string[]) {
		
		// Limpia anotaciones previas
		const existingContainer = contentEl.querySelector(".annotations-container");
		if (existingContainer) {
			existingContainer.remove();
		}

		// Crear un contenedor para las anotaciones
		const annotationsContainer = contentEl.createEl("div", { cls: "annotations-container" });

		if (annotations.length > 0) {
			annotationsContainer.createEl("h4", { text: "Se han encontrado" + ` ${annotations.length} ` + "anotaciones:" });
			annotations.forEach((annotation) => {
				annotationsContainer.createEl("p", { text: annotation });
			});
		} else {
			annotationsContainer.createEl("p", { text: "No se han encontrado anotaciones para los filtros seleccionados." });
		}

		contentEl.appendChild(annotationsContainer);
	}

	
	/**
	 * Método para aplicar los filtros
	 */
	async applyFilters() {
		
		const color = this.plugin.settings.filterColor;
		const exportToJSON = this.plugin.settings.exportToJSON;
		const mapRectangles = this.plugin.settings.mapRectangles;
		const displayFormat = this.plugin.settings.displayFormat;
		const writetopdf = this.plugin.settings.writeToPDF;
		const newPDF = this.newPDFName || "testing";
	
		if (!this.selectedPDF) {
			new Notice("Seleccione un archivo PDF antes de aplicar los filtros.");
			return;
		}
		
		console.log("\n\n");
		console.log("🟡 EMPIEZA UNA NUEVA BÚSQUEDA \n");
		console.log(`Aplicando filtros para ${this.selectedPDF}\n\n Exportar JSON: ${exportToJSON ? "Sí" : "No"}\n Mapear rectángulo: ${mapRectangles ? "Sí" : "No"}\n Escribir en PDF: ${writetopdf ? "Sí" : "No"}\n\n`);
	
		const startTime = performance.now(); // Iniciar medición de tiempo
	
		// Mensaje en la interfaz indicando que se está generando el JSON
		const statusMessage = this.contentEl.createEl("p", { text: "Generando JSON...", cls: "json-status" });
	

		const annotations = await this.findPDFAnnotations(this.selectedPDF, color, this.tagValue, this.markdownFile, displayFormat);
		const parsedAnnotations = this.parseAnnotations(annotations);
		this.showAnnotations(this.contentEl, annotations.map(a => a.raw));

		


		if (mapRectangles) {
			parsedAnnotations.forEach(ann => ann.source = this.selectedPDF);
			const enriched = await this.computeAnnotationRects(parsedAnnotations);
			console.log("✅ Rectángulos de selección:", enriched);
		}
		
		if (exportToJSON) {
			await this.exportParsedAnnotationsToJSON(this.selectedPDF, parsedAnnotations);
			const endTime = performance.now();
			const elapsedTime = (endTime - startTime).toFixed(2);
			statusMessage.textContent = `JSON generado en ${elapsedTime} ms`;
			console.log(`JSON exportado en ${elapsedTime} ms`);
		} else {
			statusMessage.remove();
		}

		if (writetopdf) {
            // Arreglo temporal para que me funcione. No uso sub carpetas. El resultado
            // aparece en el raiz del vault (o si el usuario especifica una carpeta, en esa carpeta)
            //

			// const originalFolderPath = this.selectedPDF.substring(0, this.selectedPDF.lastIndexOf("/"));
			// const newFilePath = `${originalFolderPath}/${newPDF}.pdf`;
            const newFilePath = `${newPDF}.pdf`;

			await this.copyPDF(this.selectedPDF, newFilePath);
			console.log("\n▶️ PINTANDO ANOTACIONES EN EL NUEVO PDF\n\n");
			await this.addAnnotationsToPdf(newFilePath, parsedAnnotations);
			//console.log("✅ Pintado completado");
		}

	}
	

	/**
	 * Método que, dado un PDF, genera una copia de ese PDF
	 */
	async copyPDF(pdfPath: string, newFilePath: string) {
		const originalFile = this.app.vault.getAbstractFileByPath(pdfPath);
		if (!(originalFile instanceof TFile)) {
			new Notice("No se encontró el archivo PDF original.");
			return;
		}
	
		try {
			// Leer el contenido binario del archivo original
			const content = await this.app.vault.readBinary(originalFile);
	
			// Verificar si ya existe un archivo en la nueva ruta
			const existing = this.app.vault.getAbstractFileByPath(newFilePath);

			if (existing instanceof TFile) {
				// Sobrescribir el archivo existente
				await this.app.vault.modifyBinary(existing, content);
				new Notice(`Archivo existente sobrescrito: ${newFilePath}`);
			} else {
				// Crear el nuevo archivo
				await this.app.vault.createBinary(newFilePath, content);
				new Notice(`Copia creada correctamente: ${newFilePath}`);
			}

			new Notice(`Copia creada correctamente: ${newFilePath}`);
		} catch (err) {
			console.error("Error al copiar el PDF:", err);
			new Notice("Error al copiar el PDF.");
		}
	}

	/**
	 * Función que extrae el contexto completo de una anotación.
	 *
	 * Dado un texto de anotación (ej. [[archivo.pdf#page=...|...]]), busca la línea
	 * donde aparece y devuelve el bloque completo, incluyendo cualquier contenido
	 * posterior que pertenezca a un quote o callout (líneas que comienzan con '>').
	 * 
	 */
	private async getBacklinkContext(sourcePath: string, matchText: string): Promise<string> {
		const file = this.app.vault.getAbstractFileByPath(sourcePath);

		if (!(file instanceof TFile)) 
			return "";
	
		const content = await this.app.vault.read(file);
		const lines = content.split("\n");
	
		const lineIndex = lines.findIndex((line) => line.includes(matchText));

		if (lineIndex === -1) 
			return "";
	
		const contextLines = [lines[lineIndex]];
		let i = lineIndex + 1;
	
		// Extiende hacia abajo si las siguientes líneas comienzan con ">"
		while (i < lines.length && lines[i].trim().startsWith(">")) {
			contextLines.push(lines[i]);
			i++;
		}
	
		return contextLines.join("\n");
	}
	
	
	/**
	 * Metodo para detectar el formato de visualización de la anotación en función del contenido de la misma
	 */
	detectDisplayFormat(annotation: string): string {

		const trimmedAnnotation = annotation.trim();

		if(trimmedAnnotation.match(/^.+, p\.\d+$/))
			return "Title & Page";
		else if(trimmedAnnotation.match(/^p\.\d+$/))
			return "Page";
		else if(trimmedAnnotation.match(/^[\p{Extended_Pictographic}\s]+$/u)) // Reconoce todos los Emoji
			return "Emoji";
		else if(trimmedAnnotation === "")
			return "None";
		else
			return "Text";
	}

	detectLinkFormat(annotation: string, content: string): string {

		if(annotation.startsWith("[[") && annotation.endsWith("]]")) {
			return "Link";
		}

		if(annotation.startsWith("![[") && annotation.endsWith("]]")) {
			return "Embed";
		}

		if(annotation.startsWith("([[") && annotation.endsWith("]])")) {
			return "Quote";
		}

		// Verificar si la anotación es un Callout o Quote in Callout
		const annotationIndex = content.indexOf(annotation);
		if (annotationIndex !== -1) {
			const nextLine = content.substring(annotationIndex + annotation.length).trim().split("\n")[0];
			
			if (nextLine.startsWith(">")) {
				return "Quote in callout";  // Tiene comentario después
			}
			return "Callout";  // No tiene comentario después
		}
	
		return "Unknown"; // Si no encaja con ningún formato
	}


	private parseAnnotations(rawAnnotations : { raw: string, context: string}[]): any[] {
		const parsed: any[] = [];
	
		for (const { raw: annotation, context } of rawAnnotations) {
			try {
				const linkRegex = /\[\[([^\]]+?)\]\]/;
				const match = annotation.match(linkRegex);
	
				if (!match) {
					console.warn("❌ No se pudo extraer el link de la anotación:", annotation);
					continue;
				}
	
				const linkContent = match[1]; // Ej: Referencia sobre TFGs.pdf#page=1&selection=7,3,7,39&color=red|Referencia...
				const [linkPart] = linkContent.split("|"); // quitar texto después de la barra
				const [pdfAndParams] = linkPart.split("#");
	
				const pdfname = pdfAndParams.trim();
	
				const pageMatch = linkContent.match(/page=(\d+)/);
				const selectionMatch = linkContent.match(/selection=(\d+,\d+,\d+,\d+)/);
				const rectMatch = linkContent.match(/rect=(\d+,\d+,\d+,\d+)/);
				const colorMatch = linkContent.match(/color=([a-zA-Z]+)/);
				const color = colorMatch ? colorMatch[1] : "yellow"; // Valor por defecto
				// const tags = (linkContent.match(/#[a-zA-Z0-9]+/g) || []).filter(
				// 	(tag) => tag !== "#page"
				// );

				if (!pdfname || !pageMatch) {
					console.warn("❌ Anotación incompleta al parsear:", annotation);
					continue;
				}
				
				const page = parseInt(pageMatch[1], 10);
				if (isNaN(page)) {
					console.warn("❌ Página no válida:", pageMatch[1], "en anotación:", annotation);
					continue;
				}
				
				let coordsSelection: number[] = []; // Valor por defecto
				let coordsRectangles: number[] = []; // Valor por defecto

				if(selectionMatch) {
					const selection = selectionMatch[1].split(",").map(Number);
					if (selection.length !== 4 || selection.some(isNaN)) {
						console.warn("❌ Coordenadas de selección inválidas:", selectionMatch[1], "en anotación:", annotation);
						continue;
					}
					coordsSelection = selection;
				}

				if(rectMatch) {
					const rectangles = rectMatch[1].split(",").map(Number);
					if (rectangles.length !== 4 || rectangles.some(isNaN)) {
						console.warn("❌ Coordenadas de rectángulo inválidas:", rectMatch[1], "en anotación:", annotation);
						continue;
					}
					coordsRectangles = rectangles;
				}

				// Extraer tags del contexto (excepto #page)
				const tags = (context.match(/#[a-zA-Z0-9-_]+/g) || []).filter(tag => tag !== "#page");

				// const rect = rectMatch[1].split(",").map(Number);
				// if (selection.length !== 4 || selection.some(isNaN)) {
				// 	console.warn("❌ Coordenadas de rect inválidas:", rectMatch[1], "en anotación:", annotation);
				// 	continue;
				// }
				
	
				parsed.push({
					original: annotation,
					context: context,
					link: linkContent,
					pdfname,
					page,
					color,
					
					tags,
					coordsSelection,
					coordsRectangles
				});
			} catch (error) {
				console.error("❌ Error al parsear anotación:", annotation, error);
			}
		}
	
		console.log("🟢 Anotaciones parseadas correctamente:", parsed);
		return parsed;
	}
	

    /**
     * Calculates the PDF bounding box [minX, minY, maxX, maxY] for a text item,
     * applying its transformation matrix.
     * Assumes item coordinates (width, height) and transform follow pdf.js conventions.
     * IMPORTANT: Assumes PDF coordinate system (Y increases upwards).
     *
     * @param {object} item - The textContentItem.
     * @param {number[]} item.transform - The 6-element PDF transform matrix [a, b, c, d, e, f].
     * @param {number} item.width - The width of the item in its text space.
     * @param {number} item.height - The height of the item in its text space.
     * @returns {number[]} The calculated bounding box [minX, minY, maxX, maxY] in PDF page coordinates.
     */
    private calculateItemPdfBoundingBox(item: any): number [] {
        const [a, b, c, d, e, f] = item.transform;
        const width = item.width;
        // Height might be negative in some PDF contexts, use absolute for calculation extent
        const height = Math.abs(item.height); 

        // Calculate coordinates of corners in page space by applying the transform matrix
        // Origin (bottom-left in text space) -> (e, f) in page space
        const x0 = e;
        const y0 = f;

        // Top-right corner in text space (width, height)
        // Apply transform: x' = a*x + c*y + e, y' = b*x + d*y + f
        const x1 = a * width + c * height + e;
        const y1 = b * width + d * height + f;

        // Bottom-right corner (width, 0)
        const x2 = a * width + c * 0 + e;
        const y2 = b * width + d * 0 + f;

        // Top-left corner (0, height)
        const x3 = a * 0 + c * height + e;
        const y3 = b * 0 + d * height + f;

        // Determine min/max coordinates for the bounding box in PDF page space
        const minX = Math.min(x0, x1, x2, x3);
        const minY = Math.min(y0, y1, y2, y3);
        const maxX = Math.max(x0, x1, x2, x3);
        const maxY = Math.max(y0, y1, y2, y3);

        return [minX, minY, maxX, maxY];
    }

    /**
     * Normalizes a textContentItem from pdf.js to ensure its `chars` array
     * exists and has the same length as its `str` property.
     * It handles two main cases:
     * 1. Missing/empty `chars`: Creates artificial char entries using calculated geometry.
     * 2. `str` longer than `chars` (e.g., ligatures): Expands `chars` using proportional
     *    mapping heuristic, reusing geometry from the original `chars`.
     *
     * Returns a new, normalized item object, leaving the original unchanged.
     *
     * @param {object} item - The original textContentItem object.
     * @param {string} item.str - The text string.
     * @param {Array<object>?} item.chars - Optional array of character info objects.
     * @param {number[]} item.transform - PDF transform matrix.
     * @param {number} item.width - Item width.
     * @param {number} item.height - Item height.
     * @returns {object} A new, normalized textContentItem object.
     */
    private normalizeTextContentItem(item: any):object {
        // Create a shallow copy to avoid modifying the original object
        const newItem = { ...item };

        const N = newItem.str?.length || 0; // Length of the string content

        // --- Case 1: `chars` array is missing or empty ---
        if (!newItem.chars || newItem.chars.length === 0) {
            if (N > 0 && newItem.width > 0) { // Only create if there's text and width
                // Calculate a single bounding box for the entire item
                const artificialRect = this.calculateItemPdfBoundingBox(newItem);
                newItem.chars = [];
                for (let i = 0; i < N; i++) {
                    const charStr = newItem.str[i];
                    newItem.chars.push({
                        c: charStr,
                        u: charStr, // Use the char itself as unicode approximation
                        r: artificialRect // Use the same bounding box for all chars in this item
                    });
                }
            } else {
                // If no string or no width, ensure chars is an empty array
                newItem.chars = [];
            }
        }
        // --- Case 2: `str` is longer than `chars` (e.g., ligatures) ---
        else if (N > newItem.chars.length) {
            const M = newItem.chars.length;
            const originalChars = newItem.chars; // Reference original chars for geometry
            const paddedChars = [];

            for (let i = 0; i < N; i++) {
                const charStr = newItem.str[i];
                // Calculate the proportional index in the original chars array
                let j = Math.floor(i * M / N);
                // Ensure the index stays within bounds
                j = Math.min(j, M - 1);

                // Get the geometry from the corresponding original char
                // Ensure originalChars[j] and its 'r' property exist
                const geometry = originalChars[j]?.r || [0, 0, 0, 0]; // Fallback geometry

                paddedChars.push({
                    c: charStr,
                    u: charStr, // Approximation
                    r: geometry
                });
            }
            newItem.chars = paddedChars; // Replace with the padded array
        }
        // --- Case 3: `str` is shorter than `chars` (N < M) ---
        // This case is less common. We currently do *not* modify the item here,
        // preserving the original `chars` but potentially leaving a length mismatch.
        // Truncating `chars` might lose geometric info. Handling depends on specific needs.

        // --- Case 0: Lengths already match (N === M) ---
        // No changes needed in this case.

        // Ensure newItem.chars exists, even if all checks failed (shouldn't happen often)
        if (!newItem.chars) {
            newItem.chars = [];
        }

        return newItem;
    }




	/**
	 * Calcula las coordenadas de cada anotación usando PDF++.
	 * Esta función reemplaza a addPDFRectangles, sin usar metadataCache ni fake chars.
	 * 
	 * @param annotations - Array de anotaciones con campos: selection (x1,y1,x2,y2), page, pdfname
	 * @param pdfplus - Instancia activa del plugin PDF++
	 * @returns Las mismas anotaciones, con un nuevo campo `rectangles` por cada una
	 */
	private async computeAnnotationRects(annotations: any[]): Promise<any[]> {
		const result = [];
	
		//console.log("🟡 Anotaciones recibidas para calcular rectángulos:", annotations);
	
		const byPdfAndPage = new Map<string, Map<number, any[]>>();
	
		for (const annotation of annotations) {
			const { pdfname, page, coordsSelection } = annotation;
			//console.log("pdfname:", pdfname, "page:", page, "selection:", selection);

			// Saltar si ya tiene rectángulos definidos (ej. anotaciones con "rect=")
			if (annotation.coordsRectangles && annotation.coordsRectangles.length > 0) {
				console.log("⏩ Anotación ya tiene rectángulo, se omite del cálculo:", annotation);
				result.push(annotation); // Añadirla directamente al resultado
				continue;
			}
			
			if (!pdfname || page === undefined || !coordsSelection || coordsSelection.length !== 4) {
				console.warn("❌ Anotación incompleta:", annotation);
				continue;
			}
	
			const pdfPath = annotation.source; // Usamos la ruta completa del PDF con extensión
	
			if (!byPdfAndPage.has(pdfPath)) byPdfAndPage.set(pdfPath, new Map());
			const pageMap = byPdfAndPage.get(pdfPath)!;
			if (!pageMap.has(page)) pageMap.set(page, []);
			pageMap.get(page)!.push(annotation);
		}
	
		console.log("🟡 Agrupando anotaciones por PDF y página:", byPdfAndPage);
	
		for (const [pdf, pages] of byPdfAndPage.entries()) {
			console.log(`📄 Procesando PDF: ${pdf}`);

			const file = this.app.vault.getFiles().find(f => f.path === pdf);
			//console.log(`📂 Obteniendo archivo:`, file);
	
			if (!file) {
				console.warn(`❌ Archivo PDF no encontrado en la Vault: ${pdf}`);
				continue;
			}
	
			const pdfDoc = await this.pdfplus.lib.loadPDFDocument(file);
	
			for (const [pageNumber, annotationsOnPage] of pages.entries()) {
				console.log(`📄 Página ${pageNumber} del PDF ${pdf}`);
	
				const page = await pdfDoc.getPage(pageNumber);
				const textContent = await page.getTextContent({ includeChars: true });
				const maxIndex = textContent.items.length - 1;

				for (const annotation of annotationsOnPage) {

					try {
						console.log("🔍 Procesando anotación:", annotation);
	
						const [x1, y1, x2, y2] = annotation.coordsSelection;
						console.log("📍 Coordenadas de selección:", { x1, y1, x2, y2 });
	
						// Validación adicional: evitar rangos fuera de los items disponibles
						if (x1 > maxIndex || x2 > maxIndex) {
							console.warn(`⚠️ Coordenadas fuera de rango:`, annotation.context, { x1, x2, maxIndex });
							continue; // Saltar esta anotación
						}

						// Verificar que realmente existen items en las posiciones x1 y x2
						const item1 = textContent.items[x1];
						const item2 = textContent.items[x2];
						
						// Validar que ambos items existen y tienen transformaciones de texto
						if (!item1 || !item2 || !item1.transform || !item2.transform) {
							console.warn(`⚠️ Items no válidos en indices x1: ${x1} o x2: ${x2}. Anotación omitida:`, annotation.context);
							continue;
						}
                        const normalizedItems = textContent.items.map((item: any) => this.normalizeTextContentItem(item));
						const rects = this.pdfplus.lib.highlight.geometry.computeMergedHighlightRects(
							{ textContentItems: normalizedItems, textDivs: [], div: null },
							x1, y1, x2, y2
						);
						
						if (!rects || !rects.length) {
							console.warn("⚠️ No se devolvieron rectángulos válidos para:", annotation.context);
							continue;
						}
						console.log("✅ Rectángulos calculados:", rects);
	
						annotation.coordsSelection = rects.map((r: { rect: number [] }) => r.rect);
						result.push(annotation);
					} catch (e) {
						console.error("❌ Error al calcular rectángulos para la anotación:", annotation, e);
					}
				}
			}
		}
	
		console.log("🟢 Resultado final de anotaciones con rectángulos:", result);
		return result;
	}
	

	/**
	 * Añade el resaltado a una pagina de un PDF
	 */
	async addHighlightToPDFPage(page: any, annotation: any): Promise<string> {
		
		const pdflib = this.pdfplus.lib;
		//console.log("🔍 pdflib disponible:", this.pdfplus.lib);

		const { r, g, b } = this.pdfplus.domManager.getRgb(annotation.color);
		//console.log("🎨 Color RGB:", { r, g, b });

		const geometry = this.pdfplus.lib.highlight.geometry;
		const subtype = "Highlight";
		const contents = annotation.context;

		let title = this.pdfplus.settings.author;
		let timestamp = new Date().toISOString(); // o null si prefieres no incluirlo
		
		if (annotation.title) {
			title = `${this.pdfplus.settings.author} - ${annotation.title}`;
			timestamp = ""; // como en tu lógica original
		}

		// Detectar que tipo de coordenadas hay que utilizar
		let coords: number[][] = [];

		if (annotation.coordsSelection && annotation.coordsSelection.length > 0) { 
			console.log("🟨 Usando coordenadas de selección:", annotation.coordsSelection);
			if (Array.isArray(annotation.coordsSelection[0])) {
				coords = annotation.coordsSelection; // Es un array de arrays
			} else {
				coords = [annotation.coordsSelection]; // Solo un rect
			}
		} else if (annotation.coordsRectangles && annotation.coordsRectangles.length > 0) {
			console.log("🟦 Usando coordenadas de rectángulo:", annotation.coordsRectangles);
			coords = [annotation.coordsRectangles]; // Siempre lo tratamos como array de arrays
		} else {
			console.warn("❌ Coordenadas inválidas para la anotación:", annotation);
			return "";
		}
		

		
		const ref = this.pdfplus.lib.highlight.writeFile.pdflib.addAnnotation(page, {
			Subtype: subtype,
			Rect: geometry.mergeRectangles(coords),
			QuadPoints: geometry.rectsToQuadPoints(coords),
			Contents: contents ?? '',  // ← ya no usamos fromText
			M: timestamp,
			T: title,
			CA: subtype === 'Highlight' ? this.pdfplus.settings.writeHighlightToFileOpacity : 1.0,
			Border: subtype === 'Highlight' ? [0, 0, 0] : undefined,
			C: [r / 255, g / 255, b / 255],
		});
		
		const annotationID = this.pdfplus.lib.utils.formatAnnotationID(
			ref.objectNumber,
			ref.generationNumber
		);
		return annotationID;
		
	}

	/**
	 * Integra en view.ts la lógica de addAnnotationsToPdf de utils.js,
	 * pintando los highlights en el PDF y guardándolo de nuevo.
	 */
	private async addAnnotationsToPdf(pdfPath: string, annotations: any[]) {
		console.log("▶️ addAnnotationsToPdf iniciado para:", pdfPath, annotations);
	
		// 1) Obtener el archivo PDF como TFile
		const file = this.app.vault.getFiles().find(f => f.path === pdfPath);
		if (!(file instanceof TFile)) {
			console.error(`❌ No se encontró el archivo PDF: ${pdfPath}`);
			new Notice("Error: no pude localizar el PDF para guardar anotaciones.");
			return;
		  }
		console.log("📄 Archivo PDF obtenido:", file);
	
		// 2) Cargar el documento con PDF-Lib para modificarlo
		const pdfDoc = await this.pdfplus.lib.loadPdfLibDocument(file);
		//console.log("📦 Documento PDF-Lib cargado");
	
		// 3) Agrupar anotaciones por número de página
		const annByPage = annotations.reduce((map, ann) => {
		const pageNum = ann.page;
		if (!map.has(pageNum)) map.set(pageNum, []);
		map.get(pageNum)!.push(ann);
		return map;
		}, new Map<number, any[]>());
		//console.log("🗂️ Anotaciones agrupadas por página:", annByPage);
	
		// 4) Recorrer cada página y añadir los highlights
		for (const [pageNum, anns] of annByPage.entries()) {
		console.log(`📑 Procesando página ${pageNum}, ${anns.length} anotaciones`);
		const page = await pdfDoc.getPage(pageNum - 1);
		for (const ann of anns) {
			console.log("✏️ Añadiendo highlight:", ann);
			await this.addHighlightToPDFPage(page, ann);
		}
		}
	
		// 5) Guardar los cambios en el Vault
		const modifiedBytes = await pdfDoc.save();
		await this.app.vault.modifyBinary(file, modifiedBytes);
		console.log("✅ PDF guardado con anotaciones en:", pdfPath);
	}

	// async readSource(sourcePath: string) {
	// 	const sourceFile = this.app.vault.getAbstractFileByPath(sourcePath);
	// 	const contents = await this.app.vault.cachedRead(sourceFile);
	// 	return contents.split("\n");
	// }

	// // Función que, dado un backlink y la fuente en la que aparece, extrae
	// // el párrafo completo donde aparece el enlace, o incluso las líneas
	// // siguientes si se trata del formato callout
	// getBacklinkContext(sourcePath: string, linkInfo: string) {
	// 	const startLine = linkInfo.position.start.line;
	// 	const endLine = linkInfo.position.end.line;
	// 	const lines = await readSource(sourcePath);
	// 	const context = lines.slice(startLine, endLine+1)
	// 	// Si la primera línea del contexto, eliminados los espacios iniciales,
	// 	// comienza por "> " hay que extraer todo el bloque ">"
	// 	if (context[0].trim().startsWith(">")) {
	// 		let i = startLine+1;
	// 		// En este caso hay que expandir el contexto con todas las líneas que
	// 		// le sigan y comiencen por ">" y tengan la misma indentación
	// 		while (i < lines.length && lines[i].startsWith('>')) {
	// 			context.push(lines[i]);
	// 			i++;
	// 		}
	// 	}
	// 	return context.join("\n");
	// }
  


	onClose() {
		const { contentEl } = this;
		contentEl.empty(); // Limpia el contenido al cerrar el modal
	}
}
