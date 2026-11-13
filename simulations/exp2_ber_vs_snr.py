"""Exp. 2: BER vs Es/N0 con y sin interferente CW; comparado con teoria."""
from common import *
import numpy as np
from commlink import *

esn0 = np.arange(0, 21, 2)
N = 200_000
casos = {"Sin interferente (A=0)": 0.0, "A_int=0.2": 0.2, "A_int=0.5": 0.5, "A_int=1.0": 1.0}
rows = [["EsN0_dB"] + list(casos) + ["Teoria_AWGN"]]
res = {k: [simulate(N, e, a, 5_000.0, seed=int(e) + 10) for e in esn0] for k, a in casos.items()}
th = ber_theory_qpsk(esn0)
plt.figure(figsize=(7, 4.5))
for (k, v), a in zip(res.items(), casos.values()):
    ln, = plt.semilogy(esn0, np.maximum(v, 1e-7), "o", label=k + " (sim)")
    if a > 0:
        plt.semilogy(esn0, np.maximum(ber_theory_qpsk_cw(esn0, a, 5_000.0), 1e-7), "-", color=ln.get_color(), lw=1)
plt.semilogy(esn0, th, "k--", label="Teoria QPSK (AWGN)")
plt.plot([], [], "-", color="gray", lw=1, label="Teoria con CW (lineas)")
plt.ylim(1e-6, 1); plt.xlabel("Es/N0 [dB]"); plt.ylabel("BER"); plt.legend(fontsize=8)
plt.title("BER vs Es/N0 - QPSK con CW en f_int=5 kHz"); plt.tight_layout()
plt.savefig(f"{FIG}/exp2_ber_vs_snr.png")
for i, e in enumerate(esn0):
    rows.append([e] + [res[k][i] for k in casos] + [th[i]])
np.savetxt(f"{DATA}/exp2_ber_vs_snr.csv", np.array(rows[1:], float), delimiter=",",
           header=",".join(rows[0]), comments="")
print("OK exp2")
