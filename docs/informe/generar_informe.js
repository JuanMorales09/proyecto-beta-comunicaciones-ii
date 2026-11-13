// Genera el informe IEEE (2 columnas) en .docx. Uso: node generar_informe.js
const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, BorderStyle, ShadingType, SectionType, Tab, TabStopType, Footer, PageNumber,
  LevelFormat, VerticalAlign,
} = require("docx");

const ROOT = path.resolve(__dirname, "..", "..");
const FIG = (f) => path.join(ROOT, "results", "figures", f);
const GRC = (f) => path.join(ROOT, "docs", "figuras", f);
const FONT = "Times New Roman";
const COLW = 5040; // ancho de columna (DXA) = 3.5 in

// ---------- helpers de texto con mini-marcado: **negrita**, *cursiva*, _{sub}, ^{sup}
function runs(text, o = {}) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|_\{[^}]*\}|\^\{[^}]*\})/).filter((s) => s !== "");
  return parts.map((p) => {
    if (p.startsWith("**")) return new TextRun({ text: p.slice(2, -2), bold: true, font: FONT, size: o.size || 20, ...o.extra });
    if (p.startsWith("*")) return new TextRun({ text: p.slice(1, -1), italics: true, font: FONT, size: o.size || 20, ...o.extra });
    if (p.startsWith("_{")) return new TextRun({ text: p.slice(2, -1), subScript: true, font: FONT, size: o.size || 20, italics: o.italicSub, ...o.extra });
    if (p.startsWith("^{")) return new TextRun({ text: p.slice(2, -1), superScript: true, font: FONT, size: o.size || 20, ...o.extra });
    return new TextRun({ text: p, font: FONT, size: o.size || 20, ...o.extra });
  });
}
const body = (t) => new Paragraph({ children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 80, line: 228 }, indent: { firstLine: 200 } });
const bodyNI = (t) => new Paragraph({ children: runs(t), alignment: AlignmentType.JUSTIFIED, spacing: { after: 80, line: 228 } });
const h1 = (t) => new Paragraph({ children: [new TextRun({ text: t.toUpperCase(), font: FONT, size: 18, smallCaps: false })], alignment: AlignmentType.CENTER, spacing: { before: 160, after: 80 }, keepNext: true });
const h2 = (t) => new Paragraph({ children: runs(t, { size: 20, extra: { italics: true }, italicSub: true }), spacing: { before: 100, after: 60 }, keepNext: true });
const eq = (t, n) => new Paragraph({
  children: [new TextRun({ children: [new Tab()], font: FONT }), ...runs(t, { extra: { italics: false } }), new TextRun({ children: [new Tab()], font: FONT }), new TextRun({ text: `(${n})`, font: FONT, size: 20 })],
  tabStops: [{ type: TabStopType.CENTER, position: COLW / 2 }, { type: TabStopType.RIGHT, position: COLW }],
  spacing: { before: 60, after: 80 },
});
const caption = (t, kind = "fig") => new Paragraph({ children: runs(t, { size: 16 }), alignment: kind === "fig" ? AlignmentType.JUSTIFIED : AlignmentType.CENTER, spacing: { before: 40, after: 120 } });
function fig(file, widthPx, caps, alt) {
  const sz = require("child_process").execSync(`python3 -c "from PIL import Image;im=Image.open('${file}');print(im.size[0],im.size[1])"`).toString().trim().split(" ").map(Number);
  const h = Math.round((sz[1] / sz[0]) * widthPx);
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 60, after: 20 },
      children: [new ImageRun({ type: "png", data: fs.readFileSync(file), transformation: { width: widthPx, height: h }, altText: { title: alt, description: alt, name: path.basename(file) } })] }),
    caption(caps),
  ];
}
// ---------- tablas estilo IEEE (solo lineas horizontales)
const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const line = { style: BorderStyle.SINGLE, size: 6, color: "000000" };
function table(widths, header, rows) {
  const mk = (t, w, hdr, last, align) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    borders: { top: hdr ? line : none, bottom: (hdr || last) ? line : none, left: none, right: none },
    shading: { type: ShadingType.CLEAR, fill: "FFFFFF" },
    margins: { top: 20, bottom: 20, left: 50, right: 50 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ alignment: align, children: runs(t, { size: 16, extra: hdr ? { bold: true } : {} }) })],
  });
  const r = [new TableRow({ tableHeader: true, children: header.map((t, i) => mk(t, widths[i], true, false, AlignmentType.CENTER)) })];
  rows.forEach((row, ri) => r.push(new TableRow({ cantSplit: true, children: row.map((t, i) => mk(t, widths[i], false, ri === rows.length - 1, i === 0 ? AlignmentType.LEFT : AlignmentType.CENTER)) })));
  return new Table({ width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA }, columnWidths: widths, rows: r });
}
const tcap = (n, t) => [
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 100, after: 0 }, children: [new TextRun({ text: `TABLA ${n}`, font: FONT, size: 16 })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { after: 60 }, children: runs(t.toUpperCase(), { size: 16 }) }),
];
const gap = () => new Paragraph({ spacing: { after: 60 }, children: [] });

// =================== CONTENIDO ===================
const authors = [
  { n: "Jesús Alberto Rojas Quintero", c: "2234066", e: "jesus2234066@correo.uis.edu.co" },
  { n: "Juan Felipe Morales Rivero", c: "2230412", e: "juan2230412@correo.uis.edu.co" },
  { n: "Jorge Jose Cortes Rubio", c: "2234091", e: "jorge2234091@correo.uis.edu.co" },
];
const noB = { top: none, bottom: none, left: none, right: none };
const aLine = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: t, font: FONT, size: o.size || 17, italics: o.i !== false, bold: !!o.b })] });
const authorTable = new Table({
  width: { size: 10440, type: WidthType.DXA }, columnWidths: [3480, 3480, 3480],
  rows: [new TableRow({ children: authors.map((a) => new TableCell({
    width: { size: 3480, type: WidthType.DXA }, borders: noB, margins: { top: 0, bottom: 0, left: 60, right: 60 },
    children: [
      aLine(a.n, { size: 21, i: false }), aLine(`Cód. ${a.c}`, { size: 17, i: false }),
      aLine("Escuela de Ingenierías Eléctrica, Electrónica y Telecomunicaciones"),
      aLine("Universidad Industrial de Santander"), aLine("Bucaramanga, Colombia"), aLine(a.e),
    ] })) })],
});
const title = [
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 }, children: [new TextRun({ text: "Diseño y simulación de un enlace QPSK en presencia de interferencia de banda estrecha: modelado en Python y GNU Radio", font: FONT, size: 40 })] }),
  authorTable,
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 200 }, children: [new TextRun({ text: "Grupo 5 — Comunicaciones II, Proyecto Beta (Fase 2: Modelado y Simulación)", font: FONT, size: 18, italics: true })] }),
];

const main = [];
main.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 80, line: 228 }, children: [
  new TextRun({ text: "Resumen—", font: FONT, size: 18, bold: true, italics: true }),
  ...runs("Se presenta la Fase 2 del Proyecto Beta de Comunicaciones II: el modelado y la simulación de un enlace digital que debe coexistir con una emisión de banda estrecha ubicada dentro de su banda útil (escenario S2). En banda base se modela un sistema QPSK con R_{s} = 32 ksym/s, SPS = 8 y f_{s} = 256 kS/s (R_{b} = 64 kbit/s), con un canal AWGN y un tono CW de amplitud A_{int} y frecuencia f_{int}. El sistema se implementa en Python y en GNU Radio Companion, y se analizan la constelación, la PSD y la BER frente a E_{s}/N_{0}, a la relación señal-interferencia (SIR) y a la posición del interferente, contrastando los resultados con una expresión analítica. Con el tono a 5 kHz, en ausencia de ruido el enlace es inmune mientras A_{int} < 0,736 (SIR > 2,7 dB); con A_{int} = 1 la BER se estanca en ≈ 0,23 sin importar la E_{s}/N_{0}, y con A_{int} = 0,5 se requieren 7,5 dB adicionales para alcanzar BER = 10^{-3}. La simulación coincide con la teoría y con las observaciones del flowgraph de GNU Radio.", { size: 18 }),
] }));
main.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 100, line: 228 }, children: [
  new TextRun({ text: "Términos de índice—", font: FONT, size: 18, bold: true, italics: true }),
  new TextRun({ text: "QPSK, interferencia de banda estrecha, AWGN, densidad espectral de potencia (PSD), tasa de error de bit (BER), GNU Radio, radio definida por software.", font: FONT, size: 18, italics: true }),
] }));

// I. Introducción
main.push(h1("I. Introducción"));
main.push(body("En instalaciones reales como almacenes, laboratorios o plantas industriales conviven numerosos dispositivos inalámbricos. En ese entorno no controlado, un enlace de datos no solo enfrenta ruido térmico, sino también emisiones estrechas que concentran su energía en una frecuencia específica dentro o cerca de la banda útil. Este fenómeno es cualitativamente distinto del ruido blanco: es determinístico, no gaussiano y, como se muestra más adelante, no se compensa simplemente aumentando la relación señal-ruido."));
main.push(body("El objetivo de la Fase 2 del proyecto es diseñar, modelar y simular un sistema de comunicación digital completo (transmisor, canal y receptor) para el escenario S2, “enlace digital en una banda congestionada”, y caracterizar el efecto de la interferencia mediante constelación, PSD y BER. Las contribuciones son: (i) un modelo Tx–canal–Rx en banda base en Python; (ii) un flowgraph de GNU Radio Companion (GRC) derivado del archivo base del curso; (iii) una expresión semianalítica de la BER con interferente CW, validada por simulación Monte Carlo; y (iv) una comparación entre ambas herramientas. El resto del documento sigue el orden: escenario y decisiones de diseño (II), modelo (III), metodología (IV), resultados (V), comparación (VI) y conclusiones (VII)."));

// II. Escenario
main.push(h1("II. Escenario y decisiones de diseño"));
main.push(h2("A. Escenario S2 y problema técnico"));
main.push(body("Una emisión estrecha, representada por una portadora continua (CW), aparece dentro de la banda de la señal deseada. La simulación se hace en banda base: la señal útil queda centrada en 0 Hz y el interferente se ubica a un offset controlado f_{int}. El fenómeno físico dominante es la coexistencia con energía concentrada en una frecuencia; en el GRC esto se representa con una fuente coseno complejo sumada a la señal, y no con la amplitud del ruido."));
main.push(h2("B. Arquitectura seleccionada"));
main.push(body("Se eligió QPSK porque transmite 2 bits por símbolo, duplicando R_{b} respecto a BPSK con la misma R_{s} y el mismo ancho de banda. El compromiso es una menor distancia de decisión por eje (1/√2 frente a 1 en BPSK de igual potencia), es decir, menos margen frente a una interferencia determinística. Se conserva la conformación rectangular del GRC base; su ancho de banda entre primeros nulos es ≈ 2R_{s} = 64 kHz (con un filtro RRC de β = 0,35 sería ≈ (1 + β)R_{s} = 43,2 kHz). Los parámetros se resumen en la Tabla I; se verifica que f_{s} = R_{s}·SPS."));
main.push(body("La tasa de bits es R_{b} = R_{s}·log_{2}M = 64 kbit/s. Con pulso rectangular, la eficiencia espectral referida al ancho de banda entre nulos es η = R_{b}/(2R_{s}) = 1 bit/s/Hz; con un RRC de β = 0,35 sería R_{b}/[(1 + β)R_{s}] ≈ 1,48 bit/s/Hz. BPSK con la misma R_{s} entregaría solo 32 kbit/s, pero con ≈ 3 dB más de margen de decisión frente a un tono de igual amplitud. El tono en f_{int} = 5 kHz queda a f_{int}/R_{s} ≈ 0,16 del centro, dentro del lóbulo principal de la señal."));
main.push(...tcap("I", "Parámetros base del sistema"));
main.push(table([1500, 3540], ["Parámetro", "Valor"], [
  ["Modulación", "QPSK Gray, 2 bits/símbolo"],
  ["R_{s} / SPS / f_{s}", "32 ksym/s / 8 / 256 kS/s"],
  ["R_{b}", "64 kbit/s"],
  ["Pulso", "Rectangular (BW nulos ≈ 64 kHz)"],
  ["Interferente", "Tono CW, f_{int} = 5 kHz, A_{int} variable"],
  ["Ruido", "AWGN fijo y bajo"],
  ["Receptor", "Filtro acoplado + decisión dura"],
]));
main.push(gap());
main.push(body("La variable principal del experimento es A_{int}, con una referencia sin tono y tres niveles (suave, medio y fuerte), manteniendo constantes R_{s}, el muestreo y el AWGN. La hipótesis previa (H1) es que al aumentar A_{int} aparecerá un componente espectral dominante y la representación de los símbolos se degradará."));
main.push(...fig(FIG("fig_diagrama_bloques.png"), 330, "Fig. 1. Diagrama de bloques del sistema modelado (Tx–canal–Rx en banda base).", "Diagrama de bloques del sistema"));

// III. Modelo
main.push(h1("III. Modelo del sistema"));
main.push(h2("A. Transmisor"));
main.push(body("Cada par de bits (b_{2k}, b_{2k+1}) se mapea a un símbolo QPSK Gray con potencia media unitaria (E_{s} = 1, E_{b} = 1/2):"));
main.push(eq("s[k] = [(1 − 2b_{2k}) + j(1 − 2b_{2k+1})] / √2,", 1));
main.push(bodyNI("y la conformación rectangular repite cada símbolo N = SPS veces: x[n] = s[⌊n/N⌋]."));
main.push(h2("B. Canal"));
main.push(bodyNI("La señal recibida es la suma de AWGN y un tono CW complejo:"));
main.push(eq("y[n] = x[n] + w[n] + A_{int}·exp[j(2π f_{int} n/f_{s} + φ)],", 2));
main.push(bodyNI("donde w[n] es ruido gaussiano complejo de varianza σ² = N/(E_{s}/N_{0}). Como la potencia útil es 1 y la del tono es A_{int}², la relación señal-interferencia es"));
main.push(eq("SIR = −20·log_{10}(A_{int}) dB.", 3));
main.push(h2("C. Receptor"));
main.push(bodyNI("El filtro acoplado al pulso rectangular promedia las N muestras de cada símbolo, y la decisión es por signo en cada eje. Tras el promedio, el tono queda atenuado por la respuesta del integrador:"));
main.push(eq("r[k] = s[k] + n[k] + A_{int}·G(f_{int})·exp(jθ_{k}),", 4));
main.push(eq("G(f) = |sin(π f N/f_{s})| / (N·|sin(π f/f_{s})|),", 5));
main.push(bodyNI("con θ_{k} = θ_{0} + 2π f_{int} k/R_{s}. Para f_{int} = 5 kHz resulta G = 0,961, y G se anula en múltiplos de R_{s}: la posición del interferente dentro de la banda determina cuánto daño produce. La fase del tono avanza 56,25° por símbolo, de modo que recorre el círculo de forma casi uniforme."));
main.push(h2("D. BER teórica con interferente CW"));
main.push(body("Por eje, la decisión ve a + n + A_{eff}cos θ, con a = 1/√2, A_{eff} = A_{int}·G y n con desviación σ_{c} = 1/√(2E_{s}/N_{0}). Promediando sobre θ uniforme:"));
main.push(eq("P_{b} = E_{θ}[ Q((a − A_{eff}·cos θ) / σ_{c}) ].", 6));
main.push(bodyNI("Sin AWGN el enlace no comete errores si A_{eff} < a, es decir, A_{int} < a/G = 0,736 (SIR > 2,66 dB). Si A_{eff} > a aparece un piso de error independiente del ruido:"));
main.push(eq("P_{b,piso} = (1/π)·arccos(a / A_{eff}).", 7));
main.push(bodyNI("Para A_{int} = 1 (A_{eff} = 0,961) el piso es 0,237."));

// IV. Metodología
main.push(h1("IV. Metodología de simulación"));
main.push(h2("A. Implementación en Python"));
main.push(body("El modelo (NumPy, SciPy y Matplotlib [5], [6]) implementa la cadena de la Fig. 1. Cada punto de BER usa 200 000 símbolos (400 000 bits) con semilla fija, y la PSD se estima con el método de Welch (ventanas de 2048 muestras). Cuatro experimentos generan los resultados: constelación y PSD, BER vs E_{s}/N_{0}, BER vs SIR y vs offset, y una réplica de la vista del GRC sin filtro acoplado."));
main.push(h2("B. Flowgraph en GNU Radio"));
main.push(body("A partir del archivo base del curso con AWGN [7] se cambió la tabla de símbolos a QPSK y se agregó una fuente Signal Source (coseno complejo, amplitud A_{int}, frecuencia f_{int}) y un tercer puerto al bloque Add (Fig. 2). A_{int} y f_{int} son deslizadores en tiempo de ejecución. La cadena es Random Source → Pack K Bits → Packed to Unpacked (2 bits) → Chunks to Symbols → Interpolating FIR (8 coeficientes unitarios) → Throttle → Add, con sumideros de constelación, PSD y tiempo. Con noise_amp = 0,10 (σ² = 0,01 por muestra, según la convención de GNU Radio) la E_{s}/N_{0} equivalente es N/σ² ≈ 29 dB."));
main.push(...fig(GRC("grc_flowgraph.png"), 330, "Fig. 2. Flowgraph de GNU Radio Companion del escenario S2 (QPSK + AWGN + tono CW).", "Flowgraph de GNU Radio"));
main.push(h2("C. Plan de pruebas"));
main.push(body("Se ejecutan cuatro niveles de A_{int} con f_{int} = 5 kHz (Tabla II), cambiando una sola variable principal."));
main.push(...tcap("II", "Niveles de prueba"));
main.push(table([1440, 1000, 1200, 1400], ["Nivel", "A_{int}", "SIR (dB)", "A_{eff} = A_{int}·G"], [
  ["Referencia", "0", "∞", "0"],
  ["Suave", "0,2", "14,0", "0,19"],
  ["Medio", "0,5", "6,0", "0,48"],
  ["Fuerte", "1,0", "0", "0,96"],
]));
main.push(gap());

// V. Resultados
main.push(h1("V. Resultados y discusión"));
main.push(h2("A. Observaciones en GNU Radio"));
main.push(body("La Fig. 3 muestra la constelación recibida. Sin interferente (a) aparecen cuatro nubes compactas, cuya dispersión es el AWGN. Al agregar el tono, cada punto se abre en un anillo cuyo radio es ≈ A_{int}: el tono rota en fase y dibuja una circunferencia alrededor de cada símbolo. Con A_{int} = 0,5 (c) los anillos se acercan a los ejes de decisión y con A_{int} = 1,0 (d) los cruzan y se mezclan, de modo que los símbolos dejan de ser separables."));
main.push(...fig(GRC("grc_const_compuesta.png"), 330, "Fig. 3. Constelación en GNU Radio para (a) A_{int} = 0, (b) 0,2, (c) 0,5 y (d) 1,0 (f_{int} = 5 kHz).", "Constelaciones en GNU Radio"));
main.push(body("En la PSD (Fig. 4) el tono se ve como un pico en 5 kHz solo cuando es fuerte (≈ 15 dB sobre la densidad local de la señal para A_{int} = 1,0); con niveles suave y medio queda casi enmascarado, porque el espectro de la señal rectangular tiene su máximo en 0 Hz y el interferente cae justo dentro de esa densidad. Esto confirma la hipótesis H1 y muestra que la constelación es un indicador más sensible que la PSD para una interferencia dentro de banda."));
main.push(...fig(GRC("grc_psd_compuesta.png"), 330, "Fig. 4. PSD en GNU Radio para (a) A_{int} = 0 y (b) A_{int} = 1,0; el pico en 5 kHz solo es evidente en el caso fuerte.", "PSD en GNU Radio"));
main.push(h2("B. Réplica en Python"));
main.push(body("La Fig. 5 reproduce en Python la vista del GRC (sin filtro acoplado, E_{s}/N_{0} ≈ 29 dB) y presenta el mismo comportamiento: nubes compactas, anillos de radio ≈ A_{int} y mezcla de símbolos con A_{int} = 1. Con el filtro acoplado del receptor (Fig. 6) el ruido se reduce y los anillos tienen radio A_{eff} = A_{int}·G ≈ 0,96·A_{int}; con A_{int} = 1,0 la BER medida es 0,24, mientras que con 0,2 y 0,5 es nula en esa corrida (10 000 bits, E_{s}/N_{0} = 20 dB), pues los anillos todavía no cruzan los ejes de decisión."));
main.push(...fig(FIG("exp4_constelacion_tipo_grc.png"), 300, "Fig. 5. Constelación en Python sin filtro acoplado (equivalente a la del GRC).", "Constelación en Python sin filtro acoplado"));
main.push(...fig(FIG("exp1_constelaciones.png"), 300, "Fig. 6. Constelación en Python tras el filtro acoplado (E_{s}/N_{0} = 20 dB, f_{int} = 5 kHz).", "Constelación en Python con filtro acoplado"));
main.push(body("La PSD de Python (Fig. 7) muestra igualmente el pico en 5 kHz sobre la densidad de la señal. En el dominio del tiempo (Fig. 8) el tono aparece como una ondulación lenta de período 200 µs (6,4 símbolos) montada sobre los niveles ±1/√2 de la señal rectangular; con A_{int} = 0,5 la excursión desplaza los niveles hacia el umbral de decisión, lo que explica la degradación observada."));
main.push(...fig(FIG("exp1_psd.png"), 320, "Fig. 7. PSD de la señal recibida en Python (E_{s}/N_{0} = 20 dB, f_{int} = 5 kHz).", "PSD en Python"));
main.push(...fig(FIG("exp5_senal_temporal.png"), 320, "Fig. 8. Parte real de la señal recibida (azul) frente a la transmitida (negro, discontinuo) con A_{int} = 0 y 0,5.", "Señal temporal"));
main.push(h2("C. BER frente a E_{s}/N_{0}"));
main.push(body("Sin interferente, la simulación coincide con la BER teórica de QPSK, Q(√(E_{s}/N_{0})), lo que valida el modelo (Fig. 9). Con el tono, las curvas simuladas siguen la expresión (6) dentro del error de Monte Carlo. Con A_{int} = 0,2 la curva se desplaza ≈ 1,4 dB; con 0,5 se degrada mucho y con 1,0 se estanca en ≈ 0,23, cerca del piso teórico de 0,237 de (7), sin mejorar aunque disminuya el ruido (Tabla III)."));
main.push(...fig(FIG("exp2_ber_vs_snr.png"), 330, "Fig. 9. BER vs E_{s}/N_{0} para QPSK con tono CW en 5 kHz: simulación (puntos) y teoría (líneas).", "BER vs E_{s}/N_{0}"));
main.push(...tcap("III", "E_{s}/N_{0} requerida (teoría)"));
main.push(table([1300, 1060, 1060, 1620], ["Caso", "BER 10^{-3}", "BER 10^{-4}", "Penalización a 10^{-3}"], [
  ["Solo AWGN", "9,8 dB", "11,5 dB", "—"],
  ["A_{int} = 0,2", "11,2 dB", "13,1 dB", "1,4 dB"],
  ["A_{int} = 0,5", "17,3 dB", "19,6 dB", "7,5 dB"],
  ["A_{int} = 1,0", "no alcanza", "no alcanza", "piso 0,237"],
]));
main.push(gap());
main.push(h2("D. BER frente a SIR y a la posición del interferente"));
main.push(body("Con E_{s}/N_{0} = 15 dB, la BER cae por debajo de 10^{-3} para SIR ≈ 8 dB y el enlace recupera el comportamiento de solo AWGN para SIR mayores de ≈ 15 dB (Fig. 10). La Fig. 11 fija A_{int} = 0,5 (SIR = 6 dB) y barre f_{int}: la BER disminuye al alejarse del centro de la banda y cae a cero en f_{int} = R_{s}, donde G = 0, siguiendo la curva teórica. Las pequeñas desviaciones en offsets como 0 o R_{s}/2 se deben a que allí la fase del tono no recorre el círculo uniformemente, contrario al supuesto de (6)."));
main.push(...fig(FIG("exp3_ber_vs_sir.png"), 320, "Fig. 10. BER vs SIR con E_{s}/N_{0} = 15 dB y f_{int} = 5 kHz.", "BER vs SIR"));
main.push(...fig(FIG("exp3_ber_vs_offset.png"), 320, "Fig. 11. BER vs posición del interferente (A_{int} = 0,5, SIR = 6 dB).", "BER vs offset"));

main.push(h2("E. Implicaciones de diseño"));
main.push(body("Los resultados sugieren tres criterios para este tipo de enlace: (i) dimensionar el margen de SIR, no solo la E_{s}/N_{0}, pues por debajo de ≈ 2,7 dB hay piso de error y entre 3 y 8 dB la penalización es de varios decibelios; (ii) considerar la ubicación del interferente, ya que el daño es menor lejos del centro de la banda y nulo en múltiplos de R_{s}; y (iii) evaluar contramedidas como un filtro notch en f_{int}, que eliminaría el tono a costa de recortar parte del espectro útil, o un modo más robusto (BPSK) si se acepta menor R_{b}. Estas opciones no se simularon en esta fase."));

// VI. Comparación
main.push(h1("VI. Comparación entre Python y GNU Radio"));
main.push(body("Ambas herramientas coinciden en lo cualitativo (Tabla IV): el tono genera anillos en la constelación y un pico a f_{int} en la PSD. Difieren en que el flowgraph base no incluye filtro acoplado ni medición de BER, por lo que sus nubes son más dispersas que las del receptor de Python. Python aporta lo cuantitativo (BER, comparación con la teoría y barridos reproducibles); GNU Radio aporta la evidencia visual interactiva en tiempo real, y es la base natural para la fase de implementación con SDR."));
main.push(...tcap("IV", "Comparación de herramientas"));
main.push(table([1500, 1770, 1770], ["Aspecto", "Python", "GNU Radio"], [
  ["Filtro acoplado", "Sí", "No (base)"],
  ["Medición de BER", "Sí, con teoría", "No"],
  ["Ajuste interactivo", "Por script", "Deslizadores"],
  ["Nivel de ruido", "E_{s}/N_{0} explícita", "noise_amp"],
  ["Visualización", "Figuras estáticas", "Tiempo real"],
  ["Reproducibilidad", "Semilla fija", "Manual"],
]));
main.push(gap());

// VII. Conclusiones
main.push(h1("VII. Conclusiones"));
main.push(body("Se diseñó y simuló un enlace QPSK en banda base para el escenario S2, implementado en Python y en GNU Radio. La simulación sin interferente coincide con la teoría de QPSK, y con tono CW coincide con la expresión semianalítica (6) deducida a partir de la respuesta del integrador."));
main.push(body("Un interferente determinístico se comporta de forma distinta al AWGN: existe un umbral (A_{int} < 0,736, SIR > 2,7 dB para f_{int} = 5 kHz) bajo el cual el enlace es inmune sin ruido, y por encima de él aparece un piso de error que no se reduce aumentando la E_{s}/N_{0}. Con A_{int} = 0,5 se necesitan 7,5 dB adicionales para BER = 10^{-3}."));
main.push(body("La constelación resultó más sensible que la PSD para detectar la interferencia dentro de banda, y la posición del interferente importa: el daño es máximo cerca del centro y nulo en múltiplos de R_{s} para este receptor. Como limitaciones, se usó pulso rectangular, sin sincronización ni desvanecimiento. Como trabajo futuro se plantea un filtro RRC (β = 0,35), técnicas de mitigación (filtro notch o adaptativo) y la validación con hardware SDR en la fase siguiente."));
main.push(body("El código, el flowgraph, los datos y las figuras están en el repositorio del proyecto: github.com/Jean2434gamer/proyecto-beta-comunicaciones-ii."));

// Referencias
main.push(h1("Referencias"));
const refs = [
  "J. G. Proakis y M. Salehi, *Digital Communications*, 5.ª ed. Nueva York, NY, EE. UU.: McGraw-Hill, 2008.",
  "S. Haykin, *Communication Systems*, 4.ª ed. Nueva York, NY, EE. UU.: Wiley, 2001.",
  "B. Sklar, *Digital Communications: Fundamentals and Applications*, 2.ª ed. Upper Saddle River, NJ, EE. UU.: Prentice Hall, 2001.",
  "GNU Radio Project, “GNU Radio manual and C++ API reference,” [En línea]. Disponible: https://www.gnuradio.org",
  "C. R. Harris *et al.*, “Array programming with NumPy,” *Nature*, vol. 585, pp. 357–362, 2020.",
  "P. Virtanen *et al.*, “SciPy 1.0: Fundamental algorithms for scientific computing in Python,” *Nat. Methods*, vol. 17, pp. 261–272, 2020.",
  "Universidad Industrial de Santander, “Guía #2 Fase 2. Diseño del sistema Tx–Canal–Rx en GNU Radio” y archivos .grc de modelado y simulación, Comunicaciones II, 2026.",
];
refs.forEach((r, i) => main.push(new Paragraph({
  children: [new TextRun({ text: `[${i + 1}]\t`, font: FONT, size: 16 }), ...runs(r, { size: 16 })],
  alignment: AlignmentType.JUSTIFIED, spacing: { after: 40 }, indent: { left: 360, hanging: 360 }, tabStops: [{ type: TabStopType.LEFT, position: 360 }],
})));

const page = { size: { width: 12240, height: 15840 }, margin: { top: 1000, bottom: 1000, left: 900, right: 900 } };
const footer = () => new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 16 })] })] });

const doc = new Document({
  creator: "Grupo 5", title: "Informe Fase 2 - Proyecto Beta Comunicaciones II",
  styles: { default: { document: { run: { font: FONT, size: 20 } } } },
  sections: [
    { properties: { page }, footers: { default: footer() }, children: title },
    { properties: { page, type: SectionType.CONTINUOUS, column: { count: 2, space: 360 } }, footers: { default: footer() }, children: main },
  ],
});
Packer.toBuffer(doc).then((b) => { const out = path.join(__dirname, "Informe_Fase2_Grupo5.docx"); fs.writeFileSync(out, b); console.log("OK", out); });
