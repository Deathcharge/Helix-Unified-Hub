import json, sys

def load_helix_codex(path="helix_master_sync_v13_2.json"):
    with open(path, "r", encoding="utf-8") as f:
        codex = json.load(f)
    print("Helix Codex v13.2 Loaded — Ω-state online")
    return codex

if __name__ == "__main__":
    codex = load_helix_codex()
    print(json.dumps(codex["meta"], indent=2))
