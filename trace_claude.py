import json
import networkx as nx
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
G = nx.readwrite.json_graph.node_link_graph(data)

cm_nodes = [n for n in G.nodes() if 'ClaudeManager' in G.nodes[n].get('label', str(n))]
print(f"Nodes found: {cm_nodes}")

for cm in cm_nodes:
    print(f"\n--- Tracing {cm} ---")
    in_edges = list(G.in_edges(cm, data=True))
    print(f"Incoming dependencies ({len(in_edges)}):")
    for u, v, d in in_edges:
        print(f"  {u} --[{d.get('relation', 'unknown')}]--> {v}")
    
    out_edges = list(G.out_edges(cm, data=True))
    print(f"Outgoing dependencies ({len(out_edges)}):")
    for u, v, d in out_edges:
        print(f"  {u} --[{d.get('relation', 'unknown')}]--> {v}")
    
    try:
        cycles = list(nx.simple_cycles(G))
        cm_cycles = [c for c in cycles if cm in c]
        print(f"\nCircular Dependencies involving {cm}: {len(cm_cycles)}")
        for c in cm_cycles:
            print(f"  Cycle: {' -> '.join(map(str, c))} -> {c[0]}")
    except Exception as e:
        print(f"Cycle detection error: {e}")

