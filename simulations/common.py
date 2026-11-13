import os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "src"))
FIG = os.path.join(ROOT, "results", "figures")
DATA = os.path.join(ROOT, "results", "data")
os.makedirs(FIG, exist_ok=True); os.makedirs(DATA, exist_ok=True)
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
plt.rcParams.update({"figure.dpi": 130, "axes.grid": True, "grid.alpha": .3})
