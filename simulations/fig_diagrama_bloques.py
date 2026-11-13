"""Diagrama de bloques Tx-canal-Rx para el informe."""
from common import *
from matplotlib.patches import FancyBboxPatch, Circle
fig, ax = plt.subplots(figsize=(7.2, 2.3)); ax.axis("off"); ax.set_xlim(0, 20); ax.set_ylim(0, 6.2)
def box(x, w, t, y=3.2, h=1.5):
    ax.add_patch(FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.05", fc="#e8f0fb", ec="#1f3a68", lw=1.2))
    ax.text(x + w / 2, y + h / 2, t, ha="center", va="center", fontsize=8)
def arrow(x0, y0, x1, y1): ax.annotate("", (x1, y1), (x0, y0), arrowprops=dict(arrowstyle="->", lw=1.1))
box(0.2, 2.4, "Bits\naleatorios"); box(3.3, 2.4, "Mapeo\nQPSK Gray"); box(6.4, 2.6, "Pulso rect.\n(SPS = 8)")
ax.add_patch(Circle((11.0, 3.95), 0.55, fc="white", ec="#1f3a68", lw=1.2)); ax.text(11.0, 3.95, "Σ", ha="center", va="center", fontsize=12)
box(13.0, 2.9, "Filtro acoplado\n(integrar y\nmuestrear)"); box(16.7, 3.0, "Decisión\ny BER")
for a, b in [(2.6, 3.3), (5.7, 6.4), (9.0, 10.45), (11.55, 13.0), (15.9, 16.7)]: arrow(a, 3.95, b, 3.95)
ax.text(11.0, 1.35, "AWGN\n(Es/N0)", ha="center", fontsize=8); arrow(11.0, 2.0, 11.0, 3.4)
ax.text(8.0, 1.35, "Tono CW\n(A_int, f_int)", ha="center", fontsize=8); arrow(8.8, 2.0, 10.6, 3.6)
ax.text(8.0, 5.55, "Transmisor", ha="center", fontsize=8, style="italic", color="#444"); ax.text(11.0, 5.55, "Canal", ha="center", fontsize=8, style="italic", color="#444"); ax.text(16.0, 5.55, "Receptor", ha="center", fontsize=8, style="italic", color="#444")
fig.tight_layout(pad=0.2); fig.savefig(f"{FIG}/fig_diagrama_bloques.png", dpi=220)
print("OK diagrama")
