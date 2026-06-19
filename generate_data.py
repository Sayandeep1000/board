import re
import json

raw_text_path = "raw_text.txt"

with open(raw_text_path, "r", encoding="utf-8") as f:
    text = f.read()

blocks = {}

# Parse blocks
current_block_id = None
current_block_name = None
current_cell_id = None
current_cell_title = None

lines = text.split("\n")

for line in lines:
    line = line.strip()
    if not line:
        continue
        
    # Block A: Freelancing / Editing
    m_block = re.match(r"^Block ([A-Z]):\s*(.+)$", line)
    if m_block:
        current_block_id = m_block.group(1)
        current_block_name = m_block.group(2)
        blocks[current_block_id] = {
            "title": current_block_name,
            "cells": {}
        }
        continue
        
    # A1: Target Tech/B2B Creators (Top-Left Sub-Grid)
    m_cell = re.match(r"^([A-Z][1-9]):\s*(.+?)(?:\s*\(.*\))?$", line)
    if m_cell:
        current_cell_id = m_cell.group(1)
        # Check if block is right
        b_id = current_cell_id[0]
        if b_id not in blocks:
            blocks[b_id] = {"title": "Unknown", "cells": {}}
        
        blocks[b_id]["cells"][current_cell_id] = {
            "id": current_cell_id,
            "title": m_cell.group(2).strip(),
            "steps": []
        }
        continue
        
    # A1.1: Compile a list...
    m_step = re.match(r"^([A-Z][1-9]\.[1-9]):\s*(.+)$", line)
    if m_step:
        step_id = m_step.group(1)
        step_text = m_step.group(2)
        cell_id = step_id.split('.')[0]
        b_id = cell_id[0]
        if b_id in blocks and cell_id in blocks[b_id]["cells"]:
            blocks[b_id]["cells"][cell_id]["steps"].append(f"{step_id}: {step_text}")
        continue

# Add colors
colors = {
    "A": "#059669", # Green
    "B": "#2563eb", # Blue
    "C": "#db2777", # Pink/Magenta
    "D": "#eab308", # Yellow
    "E": "#f59e0b", # Gold
    "F": "#0d9488", # Teal
    "G": "#b45309", # Brown
    "H": "#7e22ce", # Purple
    "I": "#1d4ed8"  # Dark Blue
}

# Fill missing Block E with the exact layout requested
blocks["E"] = {
    "title": "THE MASTER GOAL",
    "cells": {
        "E1": {"id": "E1", "title": "FREELANCING / EDITING (Block A)", "steps": ["E1.1: Core objective placeholder", "E1.2: Core objective placeholder"]},
        "E2": {"id": "E2", "title": "AGENCY (ADMACHI) (Block B)", "steps": ["E2.1: Core objective placeholder", "E2.2: Core objective placeholder"]},
        "E3": {"id": "E3", "title": "YOUTUBE (Block C)", "steps": ["E3.1: Core objective placeholder", "E3.2: Core objective placeholder"]},
        "E4": {"id": "E4", "title": "STORY & SCREENPLAYING (Block D)", "steps": ["E4.1: Core objective placeholder", "E4.2: Core objective placeholder"]},
        "E5": {"id": "E5", "title": "FILMMAKER (USC AIM)", "steps": ["E5.1: The Absolute Center", "E5.2: Admission into USC Film School"]},
        "E6": {"id": "E6", "title": "AI & SECOND BRAIN (Block F)", "steps": ["E6.1: Core objective placeholder", "E6.2: Core objective placeholder"]},
        "E7": {"id": "E7", "title": "GYM & BODY (Block G)", "steps": ["E7.1: Core objective placeholder", "E7.2: Core objective placeholder"]},
        "E8": {"id": "E8", "title": "GROOMING & ESTHETICS (Block H)", "steps": ["E8.1: Core objective placeholder", "E8.2: Core objective placeholder"]},
        "E9": {"id": "E9", "title": "DATING & COMMUNICATION (Block I)", "steps": ["E9.1: Core objective placeholder", "E9.2: Core objective placeholder"]}
    }
}

# Ensure all 9 cells exist for each block
for b_id in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']:
    if b_id not in blocks:
        blocks[b_id] = {"title": f"Block {b_id}", "cells": {}}
    for i in range(1, 10):
        cell_id = f"{b_id}{i}"
        if cell_id not in blocks[b_id]["cells"]:
            blocks[b_id]["cells"][cell_id] = {
                "id": cell_id,
                "title": f"Placeholder {cell_id}",
                "steps": [f"{cell_id}.1: Placeholder step"]
            }

output = "export const mandalaData = {\n"
for b_id in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I']:
    block = blocks[b_id]
    output += f'  "{b_id}": {{\n'
    output += f'    title: {json.dumps(block["title"])},\n'
    output += f'    color: "{colors[b_id]}",\n'
    output += '    cells: [\n'
    for i in range(1, 10):
        cell_id = f"{b_id}{i}"
        cell = block["cells"][cell_id]
        output += f'      {{\n'
        output += f'        id: "{cell["id"]}",\n'
        output += f'        title: {json.dumps(cell["title"])},\n'
        output += f'        steps: {json.dumps(cell["steps"])}\n'
        output += f'      }},\n'
    output += '    ]\n'
    output += '  },\n'
output += "};\n"

with open("data.js", "w", encoding="utf-8") as f:
    f.write(output)
print("done")
