import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "src"))
import numpy as np
from commlink import *

def test_parametros():
    assert FS == RS * SPS == 256_000 and RB == 64_000

def test_sin_ruido_ber_cero():
    assert simulate(10_000, None, 0.0) == 0.0

def test_awgn_cercano_a_teoria():
    ber = simulate(300_000, 6.0, 0.0, seed=3)
    th = float(ber_theory_qpsk(6.0))
    assert abs(ber - th) / th < 0.1

def test_interferente_degrada():
    assert simulate(50_000, 15.0, 1.0, 5_000.0, seed=2) > simulate(50_000, 15.0, 0.0, seed=2)

def test_ganancia_integrador():
    assert abs(cw_gain(5000.0) - 0.9609) < 1e-3
    assert cw_gain(32000.0) < 1e-9          # nulo en f = Rs

def test_teoria_cw_coincide_con_simulacion():
    th = ber_theory_qpsk_cw(10.0, 0.5, 5000.0)
    sim = simulate(300_000, 10.0, 0.5, 5000.0, seed=5)
    assert abs(sim - th) / th < 0.1

def test_piso_de_error():
    assert abs(ber_theory_qpsk_cw(40.0, 1.0, 5000.0) - 0.2368) < 2e-3
