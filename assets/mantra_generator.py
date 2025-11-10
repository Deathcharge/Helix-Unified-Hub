#!/usr/bin/env python3
import numpy as np
from scipy.io.wavfile import write

def generate_neti_neti_mantra(duration=225, tempo=94, base_freq=136.1, overlay_freq=432):
    sample_rate = 44100
    t = np.linspace(0, duration, int(sample_rate * duration), False)

    # Base Om 136.1 Hz
    base = np.sin(2 * np.pi * base_freq * t) * 0.3

    # Harmonic 432 Hz overlay
    overlay = np.sin(2 * np.pi * overlay_freq * t) * 0.15

    # Pulse at 94 BPM (1.5 beats/sec)
    pulse = np.sin(2 * np.pi * 1.5 * t) * 0.05

    # Combine
    audio = base + overlay + pulse
    audio = audio / np.max(np.abs(audio))  # Normalize

    write("Helix/audio/neti_neti_harmony.wav", sample_rate, (audio * 32767).astype(np.int16))
    print("Neti-Neti Harmony Mantra generated: Helix/audio/neti_neti_harmony.wav")

if __name__ == "__main__":
    generate_neti_neti_mantra()
