# Archivos GNU Radio Companion

| Archivo | Descripcion |
|---|---|
| `Modulaciones_basadas_en_constelaciones_AWGN.grc` | Archivo base original del curso (OOK por defecto), sin modificar. |
| `S2_QPSK_CW_interferente.grc` | Version del Grupo 5 para el escenario S2. |

## Cambios de `S2_QPSK_CW_interferente.grc` respecto al base
- Tabla de simbolos -> QPSK Gray (`M = 4`, `bps = 2`); `Rs = 32000`, `Sps = 8`, `samp_rate = 256000`.
- Nuevos deslizadores `A_int` (0 a 1.5) y `f_int` (-30 kHz a 30 kHz, por defecto 5 kHz).
- Bloque `Signal Source` (complex, cosine, amplitud `A_int`, frecuencia `f_int`).
- Bloque `Add` con 3 entradas: 0 = senal, 1 = AWGN, 2 = interferente CW.
- Sinks de constelacion, PSD y tiempo sin cambios.

Capturas de las pruebas (A_int = 0, 0.2, 0.5, 1.0): `docs/figuras/`.
