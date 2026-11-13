"""Exp. 5: senal en el tiempo (parte real) con y sin tono CW."""
from common import *
import numpy as np
from commlink import *
fig, ax = plt.subplots(2, 1, figsize=(6.4, 3.8), sharex=True)
for a_, (name, a) in zip(ax, [("A_int = 0", 0.0), ("A_int = 0.5", 0.5)]):
    _, sig = simulate(40, 25.0, a, 5_000.0, seed=3, return_signals=True)
    n = np.arange(12 * SPS)
    a_.plot(n / FS * 1e3, sig["rx_in"][:n.size].real, lw=1)
    a_.plot(n / FS * 1e3, sig["tx"][:n.size].real, "k--", lw=.8, alpha=.6)
    a_.set_ylabel("Re{y[n]}"); a_.set_title(name, fontsize=9, loc="left")
ax[-1].set_xlabel("Tiempo [ms]")
fig.tight_layout(); fig.savefig(f"{FIG}/exp5_senal_temporal.png")
print("OK exp5")
