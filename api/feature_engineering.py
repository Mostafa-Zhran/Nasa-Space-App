
import numpy as np

def add_aggregates(Z):
    Z = np.asarray(Z, dtype=float)
    agg = np.column_stack([
        Z.sum(axis=1),
        Z.std(axis=1),
        Z.max(axis=1),
        Z.min(axis=1)
    ])
    return np.hstack([Z, agg])
