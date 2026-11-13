"""Exp. 3: BER vs SIR (Es/N0 fijo) y BER vs offset del interferente."""
from common import *
import numpy as np
from commlink import *

N = 200_000
ESN0 = 15.0
sir = np.arange(-10, 31, 2)
ber_sir = [simulate(N, ESN0, sir_to_amp(s), 5_000.0, seed=int(s) + 50) for s in sir]
plt.figure(figsize=(7, 4.2))
plt.semilogy(sir, np.maximum(ber_sir, 1e-7), "o", label="Simulacion")
sir_f = np.linspace(-10, 30, 161)
plt.semilogy(sir_f, np.maximum([ber_theory_qpsk_cw(ESN0, sir_to_amp(x), 5_000.0) for x in sir_f], 1e-7), "-", lw=1, label="Teoria con CW")
plt.axhline(float(ber_theory_qpsk(ESN0)), color="k", ls="--", label="Solo AWGN (teoria)")
plt.ylim(1e-6, 1); plt.xlabel("SIR [dB]"); plt.ylabel("BER"); plt.legend()
plt.title(f"BER vs SIR (Es/N0={ESN0:.0f} dB, f_int=5 kHz)"); plt.tight_layout()
plt.savefig(f"{FIG}/exp3_ber_vs_sir.png")
np.savetxt(f"{DATA}/exp3_ber_vs_sir.csv", np.c_[sir, ber_sir], delimiter=",", header="SIR_dB,BER", comments="")

# Offset: A_int=0.5 -> SIR = 6 dB. Se barre f_int de 0 a 2*Rs (nulos del filtro integrador en k*Rs).
f_int = np.linspace(0, 2 * RS, 41)
ber_f = [simulate(N, ESN0, 0.5, f, seed=100 + i) for i, f in enumerate(f_int)]
plt.figure(figsize=(7, 4.2))
ff = np.linspace(0, 2 * RS, 401)
plt.semilogy(ff / 1e3, np.maximum([ber_theory_qpsk_cw(ESN0, 0.5, f) for f in ff], 1e-7), "-", lw=1, label="Teoria")
plt.semilogy(f_int / 1e3, np.maximum(ber_f, 1e-7), "o", label="Simulacion"); plt.legend()
plt.ylim(1e-6, 1); plt.xlabel("Offset del interferente f_int [kHz]"); plt.ylabel("BER")
plt.title("BER vs posicion del interferente (A_int=0.5, SIR=6 dB)"); plt.tight_layout()
plt.savefig(f"{FIG}/exp3_ber_vs_offset.png")
np.savetxt(f"{DATA}/exp3_ber_vs_offset.csv", np.c_[f_int, ber_f], delimiter=",", header="f_int_Hz,BER", comments="")
print("OK exp3")
