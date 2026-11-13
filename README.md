# Proyecto Beta - Comunicaciones II (Fase 2: Modelado y Simulación)

**Grupo 5** - Jesús Alberto Rojas Quintero (2234066), Juan Felipe Morales Rivero (2230412), Jorge Jose Cortes Rubio (2234091)
Universidad Industrial de Santander
**Escenario S2:** enlace digital en una banda congestionada (interferente CW de banda estrecha).

## Sistema modelado
| Parámetro | Valor |
|---|---|
| Modulación | QPSK (Gray), 2 bits/símbolo |
| Rs / SPS / fs | 32 ksym/s / 8 / 256 kS/s (fs = Rs·SPS) |
| Rb | 64 kbit/s |
| Pulso | Rectangular (como el GRC base); BW entre nulos ≈ 2·Rs = 64 kHz |
| Canal | AWGN + tono CW complejo a offset f_int (por defecto 5 kHz) |
| Receptor | Filtro acoplado (integrate & dump) + decisión dura |
| Métricas | Constelación, PSD, señal temporal, BER vs Es/N0, BER vs SIR, BER vs offset (con teoría) |

Convenciones: potencia de señal = 1; `SIR = -20·log10(A_int)`; Es/N0 definida tras el filtro acoplado.

## Estructura
```
src/commlink/      Modelo Tx-canal-Rx (Python/NumPy)
simulations/       Experimentos exp1, exp2, exp3 (generan figuras y CSV)
grc/               Archivos .grc de GNU Radio (base + modificado)
tests/             Pruebas básicas del modelo
results/figures/   Figuras para el informe IEEE
results/data/      Datos CSV de BER
docs/informe/      Informe IEEE (PDF + DOCX + script generador)
docs/GUIA_GIT.md   Guía de Git y flujo de ramas
docs/figuras/      Capturas de GRC (flowgraph, PSD, constelación)
```

## Ejecución
```bash
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
pytest -q
cd simulations
python exp1_constelacion_psd.py
python exp2_ber_vs_snr.py
python exp3_ber_vs_sir_y_offset.py
python exp4_comparacion_grc.py        # vista tipo GRC (sin filtro acoplado)
python exp5_senal_temporal.py
python fig_diagrama_bloques.py
```

## Flujo de ramas (Git)
`main` (entregas) ← `develop` ← `feature/modelo-python`, `feature/grc-s2`, `feature/informe`.
Commits pequeños con mensajes descriptivos; cada integrante debe tener commits propios.

## Entregas
- Fase 2: informe IEEE (`docs/informe/Informe_Fase2_Grupo5.pdf`) + este repositorio.

## Resultado principal
Con el tono en 5 kHz el enlace es inmune (sin ruido) mientras `A_int < 0.736` (SIR > 2.7 dB); con `A_int = 1` la BER
se estanca en ≈ 0.23 sin importar Es/N0. La simulación coincide con la expresión teórica `ber_theory_qpsk_cw`.

