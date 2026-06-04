#!/usr/bin/env node
import { parseArgs, styleText } from "node:util";
import { argv, exit } from "node:process";
import { readFile, writeFile } from "node:fs/promises";

// Ayuda 
const showHelp = () => {
    console.log(`
${styleText(["bold", "cyan"], "analizar.js")} — Analiza líneas, palabras y caracteres de un archivo

${styleText("yellow", "Uso:")}
  node analizar.js --file <ruta>  [--output <ruta>]
  node analizar.js -f <ruta>      [-o <ruta>]
  node analizar.js --help

${styleText("yellow", "Opciones:")}
  ${styleText("green", "-f, --file")}    Ruta del archivo de texto a analizar  ${styleText("red", "(obligatorio)")}
  ${styleText("green", "-o, --output")}  Ruta del archivo donde guardar el resumen (opcional)
  ${styleText("green", "-h, --help")}    Muestra este mensaje de ayuda

${styleText("yellow", "Ejemplos:")}
  node analizar.js --file texto.txt
  node analizar.js -f texto.txt -o resumen.txt
`);
};

// ─── Parsear argumentos ───────────────────────────────────────────────────────
const args = argv.slice(2);
const options = {
    file: { type: "string", short: "f" },
    output: { type: "string", short: "o" },
    help: { type: "boolean", short: "h" },
};

const { values } = parseArgs({ args, options, strict: false });

// Si pide ayuda o no pasa --file, mostrar ayuda y salir sin error
if (values.help || !values.file) {
    showHelp();
    exit(0);
}

// Leer archivo y analizar contenido
try {
    const contents = await readFile(values.file, { encoding: "utf-8" });

    const lines = contents.split("\n").length;
    const words = contents.trim() === "" ? 0 : contents.trim().split(/\s+/).length;
    const chars = contents.length;

    // Mostrar resultados en consola con colores
    console.log();
    console.log(styleText(["bold", "cyan"], `Análisis de: ${values.file}`));
    console.log(styleText("blue", "─".repeat(40)));
    console.log(styleText("green", "  Líneas:     ") + styleText(["bold", "white"], String(lines)));
    console.log(styleText("yellow", "  Palabras:   ") + styleText(["bold", "white"], String(words)));
    console.log(styleText("magenta", "  Caracteres: ") + styleText(["bold", "white"], String(chars)));
    console.log(styleText("blue", "─".repeat(40)));
    console.log();

    // Guardar resumen si se pasó --output 
    if (values.output) {
        const summary =
            `Análisis de archivo: ${values.file}
Fecha: ${new Date().toLocaleString("es-CR")}
──────────────────────────────────────
Líneas:     ${lines}
Palabras:   ${words}
Caracteres: ${chars}
`;

        try {
            await writeFile(values.output, summary, { encoding: "utf-8" });
            console.log(styleText(["green", "bold"], `✅ Resumen guardado en: ${values.output}`));
            console.log();
        } catch (writeErr) {
            console.error(styleText("red", `❌ Error al escribir "${values.output}": ${writeErr.message}`));
            exit(1);
        }
    }

} catch (readErr) {
    console.error(styleText("red", `❌ Error al leer "${values.file}": ${readErr.message}`));
    exit(1);
}