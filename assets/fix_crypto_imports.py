#!/usr/bin/env python3
"""
fix_crypto_imports.py - Crypto Import Compatibility Shim
Fixes mega.py compatibility with pycryptodome by creating import aliases.

The mega.py library expects 'Crypto' but pycryptodome uses 'Cryptodome'.
This script creates the necessary compatibility layer.
"""
import sys

# Create Crypto → Cryptodome alias
# This allows old libraries like mega.py to work with pycryptodome
try:
    import Cryptodome
    sys.modules['Crypto'] = Cryptodome
    sys.modules['Crypto.Cipher'] = Cryptodome.Cipher
    sys.modules['Crypto.PublicKey'] = Cryptodome.PublicKey
    sys.modules['Crypto.Protocol'] = Cryptodome.Protocol
    sys.modules['Crypto.Random'] = Cryptodome.Random
    sys.modules['Crypto.Hash'] = Cryptodome.Hash
    sys.modules['Crypto.Util'] = Cryptodome.Util
    print("✅ Crypto import compatibility layer activated")
except ImportError as e:
    print(f"⚠️ Could not activate Crypto compatibility: {e}")
    print("   Ensure pycryptodome is installed: pip install pycryptodome")
