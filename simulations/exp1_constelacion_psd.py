"""Exp. 1: constelacion y PSD para A_int = 0 (referencia), suave, medio, fuerte."""
from common import *
import numpy as np
from scipy.signal import welch
from commlink import *

ESN0 = 20.0            # AWGN constante y bajo
F_INT = 5_000.0        # offset del CW dentro de la banda util
NIVELES = {"Referencia (0)": 0.0, "Suave (0.2)": 0.2, "Medio (0.5)": 0.5, "Fuerte (1.0)": 1.0}

fig, ax = plt.subplots(2, 2, figsize=(6.4, 6.6)); ax = ax.ravel()
fig2, ax2 = plt.subplots(figsize=(7, 4))
for i, (name, a) in enumerate(NIVELES.items()):
    ber, sig = simulate(5000, ESN0, a, F_INT, seed=1, return_signals=True)
    r = sig["symbols_rx"]
    ax[i].plot(r.real, r.imag, ".", ms=2, alpha=.5)
    ax[i].set_title(f"{name}  BER={ber:.2g}", fontsize=10); ax[i].set_aspect("equal")
    ax[i].set_xlim(-2, 2); ax[i].set_ylim(-2, 2)
    f, p = welch(sig["rx_in"], fs=FS, nperseg=2048, return_onesided=False)
    idx = np.argsort(f)
    ax2.plot(f[idx] / 1e3, 10 * np.log10(p[idx]), label=name)
fig.tight_layout(); fig.savefig(f"{FIG}/exp1_constelaciones.png")
ax2.set_xlabel("Frecuencia [kHz]"); ax2.set_ylabel("PSD [dB/Hz]")
ax2.set_title("PSD de la senal recibida (banda base)"); ax2.legend(fontsize=8)
fig2.tight_layout(); fig2.savefig(f"{FIG}/exp1_psd.png")
print("OK exp1")
