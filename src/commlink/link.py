"""Enlace QPSK en banda base con AWGN e interferente CW estrecho (Escenario S2).

Parametros base (ficha de decision del Grupo 5):
    Rs = 32 ksym/s, SPS = 8, fs = Rs*SPS = 256 kS/s, pulso rectangular.
    Rb = 2*Rs = 64 kbit/s (QPSK, 2 bits/simbolo).

Convenciones:
    - Potencia media de simbolo = 1  ->  potencia de la senal util = 1.
    - Es/N0 en dB: sigma^2 (por muestra compleja) = SPS / 10^(EsN0/10).
    - SIR en dB = -20*log10(A_int) (el tono complejo tiene potencia A_int^2).
"""
import math
import numpy as np

RS = 32_000
SPS = 8
FS = RS * SPS
BITS_PER_SYM = 2
RB = RS * BITS_PER_SYM

__all__ = ["RS", "SPS", "FS", "RB", "random_bits", "qpsk_mod", "pulse_rect",
           "add_awgn", "add_cw", "matched_filter", "qpsk_demod", "simulate",
           "ber_theory_qpsk", "sir_to_amp", "cw_gain", "ber_theory_qpsk_cw"]


def random_bits(n_bits, rng):
    return rng.integers(0, 2, n_bits, dtype=np.int8)


def qpsk_mod(bits):
    """QPSK Gray: (b0,b1) -> ((1-2b0) + j(1-2b1))/sqrt(2)."""
    b = bits.reshape(-1, 2)
    return ((1 - 2 * b[:, 0]) + 1j * (1 - 2 * b[:, 1])) / np.sqrt(2)


def pulse_rect(symbols, sps=SPS):
    """Conformacion rectangular (repeticion), como el GRC base."""
    return np.repeat(symbols, sps)


def add_awgn(x, esn0_db, rng, sps=SPS):
    sigma2 = sps / 10 ** (esn0_db / 10)
    n = (rng.standard_normal(x.size) + 1j * rng.standard_normal(x.size))
    return x + n * np.sqrt(sigma2 / 2)


def sir_to_amp(sir_db):
    return 10 ** (-sir_db / 20)


def add_cw(x, a_int, f_int, fs=FS, phase=0.0):
    n = np.arange(x.size)
    return x + a_int * np.exp(1j * (2 * np.pi * f_int * n / fs + phase))


def matched_filter(x, sps=SPS):
    """Integrate-and-dump (filtro acoplado al pulso rectangular)."""
    return x.reshape(-1, sps).mean(axis=1)


def qpsk_demod(r):
    out = np.empty(r.size * 2, dtype=np.int8)
    out[0::2] = (r.real < 0)
    out[1::2] = (r.imag < 0)
    return out


def simulate(n_sym, esn0_db, a_int=0.0, f_int=5_000.0, seed=0, return_signals=False):
    """Una corrida Tx -> canal -> Rx. Devuelve BER (y senales si se pide)."""
    rng = np.random.default_rng(seed)
    bits = random_bits(2 * n_sym, rng)
    s = qpsk_mod(bits)
    tx = pulse_rect(s)
    y = add_awgn(tx, esn0_db, rng) if esn0_db is not None else tx.copy()
    if a_int > 0:
        y = add_cw(y, a_int, f_int, phase=rng.uniform(0, 2 * np.pi))
    r = matched_filter(y)
    ber = float(np.mean(qpsk_demod(r) != bits))
    if return_signals:
        return ber, dict(bits=bits, tx=tx, rx_in=y, symbols_rx=r)
    return ber


def ber_theory_qpsk(esn0_db):
    esn0 = 10 ** (np.asarray(esn0_db) / 10)
    q = lambda x: 0.5 * np.vectorize(math.erfc)(x / np.sqrt(2))
    return q(np.sqrt(esn0))


def cw_gain(f_int, fs=FS, sps=SPS):
    """Ganancia del filtro integrador (promedio de SPS muestras) sobre un tono a f_int.

    |H| = |sin(pi f N/fs)| / (N |sin(pi f/fs)|); vale 1 en f=0 y tiene nulos en f=k*Rs.
    """
    f = np.atleast_1d(np.asarray(f_int, dtype=float))
    num = np.abs(np.sin(np.pi * f * sps / fs))
    den = sps * np.abs(np.sin(np.pi * f / fs))
    out = np.where(den < 1e-12, 1.0, num / np.where(den < 1e-12, 1.0, den))
    return out if out.size > 1 else float(out[0])


def ber_theory_qpsk_cw(esn0_db, a_int, f_int, n_theta=1441):
    """BER teorica de QPSK con AWGN + tono CW tras el filtro acoplado.

    Por eje, la decision ve  a + n + A_eff*cos(theta),  con a = 1/sqrt(2),
    n ~ N(0, 1/(2 Es/N0)) y theta uniforme (la fase del tono rota entre simbolos).
    BER = E_theta[ Q((a - A_eff*cos(theta)) / sigma) ].
    """
    a = 1 / np.sqrt(2)
    a_eff = a_int * cw_gain(f_int)
    theta = np.linspace(0, 2 * np.pi, n_theta, endpoint=False)
    q = lambda x: 0.5 * np.vectorize(math.erfc)(x / np.sqrt(2))
    esn0 = 10 ** (np.atleast_1d(np.asarray(esn0_db, dtype=float)) / 10)
    out = []
    for e in esn0:
        sigma = np.sqrt(1 / (2 * e))
        out.append(float(np.mean(q((a - a_eff * np.cos(theta)) / sigma))))
    out = np.array(out)
    return out if out.size > 1 else float(out[0])
