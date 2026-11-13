"""Exp. 4: replica en Python de las capturas del GRC (sin filtro acoplado).

En el GRC, el Constellation Sink recibe directamente la salida del canal
(8 muestras por simbolo, sin filtro acoplado). Aqui se reproduce esa vista.
noise_amp = 0.10 en GRC -> sigma^2 = 0.01 por muestra compleja -> Es/N0 = SPS/sigma^2 = 29 dB.
"""
from common import *
import numpy as np
from commlink import *

NOISE_AMP = 0.10
ESN0 = 10 * np.log10(SPS / NOISE_AMP**2)
NIV = [("Referencia", 0.0), ("Suave", 0.2), ("Medio", 0.5), ("Fuerte", 1.0)]

fig, ax = plt.subplots(2, 2, figsize=(6.4, 6.6)); ax = ax.ravel()
for i, (name, a) in enumerate(NIV):
    _, sig = simulate(600, ESN0, a, 5_000.0, seed=7, return_signals=True)
    y = sig["rx_in"][:2048]
    ax[i].plot(y.real, y.imag, ".", ms=2.5)
    ax[i].set_title(f"{name} (A_int={a})", fontsize=10); ax[i].set_aspect("equal")
    ax[i].set_xlim(-2.2, 2.2); ax[i].set_ylim(-2.2, 2.2)
fig.tight_layout(); fig.savefig(f"{FIG}/exp4_constelacion_tipo_grc.png")
print(f"OK exp4  (Es/N0 equivalente = {ESN0:.1f} dB)")
