"""
BCS502 - Computer Networks
Module: Bellman-Ford Shortest-Path Routing Algorithm

Implements the Bellman-Ford dynamic programming routing algorithm for weighted directed graphs.
Features:
1. Distance initialization: dist[v] = infinity, dist[source] = 0, pred[v] = None.
2. Iterative edge relaxation: |V| - 1 iterations over all directed edges (u, v, w).
3. Detailed execution history tracking for visualization in the routing dashboard.
4. Negative-cycle detection: Extra relaxation pass to detect reachable negative cycles.
5. Path reconstruction from predecessor pointers.
6. Unreachable destination detection and fallback handling.
7. Support for arbitrary edge weights, including demonstration negative weights.
"""

from typing import Dict, List, Tuple, Any, Optional, Set
import copy
import math


class BellmanFordRouter:
    """
    Bellman-Ford shortest path routing engine on a weighted directed graph G = (V, E).
    """

    def __init__(self, nodes: List[str], edges: List[Dict[str, Any]]):
        """
        nodes: List of node IDs [e.g. 'ATM_DEL1', 'Zone_1', 'RST_North', ...]
        edges: List of dicts: [{'source': u, 'destination': v, 'weight': float}, ...]
        """
        self.nodes: List[str] = sorted(list(set(nodes)))
        self.edges: List[Dict[str, Any]] = edges

    def run(self, source: str, destination: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes Bellman-Ford algorithm starting from `source`.
        If `destination` is provided, reconstructs the specific shortest path to that destination.
        Returns a comprehensive dictionary with execution trace, tables, and paths.
        """
        if source not in self.nodes:
            return {
                "success": False,
                "error": f"Source node '{source}' does not exist in graph nodes.",
                "has_negative_cycle": False
            }

        num_vertices = len(self.nodes)
        
        # Step 1: Distance and predecessor initialization
        distances: Dict[str, float] = {node: float("inf") for node in self.nodes}
        predecessors: Dict[str, Optional[str]] = {node: None for node in self.nodes}
        distances[source] = 0.0

        initial_distances = copy.deepcopy(distances)
        
        # Iteration logs for UI visualization
        iterations_log: List[Dict[str, Any]] = []

        # Step 2: Relax edges |V| - 1 times
        for iteration in range(1, num_vertices):
            updates_in_this_pass = []
            distances_before = copy.deepcopy(distances)
            any_update = False

            # Relax each directed edge (u, v, w)
            for edge in self.edges:
                u = edge["source"]
                v = edge["destination"]
                weight = float(edge["weight"])

                # Only relax if source u is reachable
                if distances[u] != float("inf"):
                    potential_dist = distances[u] + weight
                    # Rounding to 4 decimal places to prevent floating point inaccuracies
                    if potential_dist < distances[v] - 1e-9:
                        old_dist = distances[v]
                        distances[v] = potential_dist
                        predecessors[v] = u
                        any_update = True
                        updates_in_this_pass.append({
                            "edge": f"{u} -> {v}",
                            "source": u,
                            "destination": v,
                            "weight": weight,
                            "old_distance": "INF" if math.isinf(old_dist) else round(old_dist, 2),
                            "new_distance": round(potential_dist, 2),
                            "new_predecessor": u
                        })

            iterations_log.append({
                "iteration": iteration,
                "distances": {k: ("INF" if math.isinf(v) else round(v, 2)) for k, v in distances.items()},
                "updates": updates_in_this_pass,
                "converged_early": not any_update
            })

            # Early convergence optimization
            if not any_update:
                break

        # Step 3: Negative cycle detection (Pass |V|)
        has_negative_cycle = False
        negative_cycle_nodes: List[str] = []
        cycle_edge = None

        for edge in self.edges:
            u = edge["source"]
            v = edge["destination"]
            weight = float(edge["weight"])

            if distances[u] != float("inf") and (distances[u] + weight < distances[v] - 1e-9):
                has_negative_cycle = True
                cycle_edge = {"source": u, "destination": v, "weight": weight}
                # Trace back the cycle
                visited = {}
                curr = v
                for _ in range(num_vertices):
                    if curr in predecessors and predecessors[curr] is not None:
                        curr = predecessors[curr]
                    else:
                        break

                cycle_start = curr
                cycle = [cycle_start]
                curr = predecessors.get(cycle_start)
                while curr and curr != cycle_start and curr not in cycle:
                    cycle.append(curr)
                    curr = predecessors.get(curr)
                if curr == cycle_start:
                    cycle.append(cycle_start)
                negative_cycle_nodes = cycle[::-1]
                break

        if has_negative_cycle:
            return {
                "success": False,
                "error": "Negative-weight cycle detected! Routing graph contains a reachable negative cycle.",
                "has_negative_cycle": True,
                "negative_cycle_edge": cycle_edge,
                "negative_cycle_path": negative_cycle_nodes,
                "initial_distances": {k: ("INF" if math.isinf(v) else round(v, 2)) for k, v in initial_distances.items()},
                "iterations": iterations_log,
                "source": source
            }

        # Step 4: Reconstruct shortest path if destination requested
        result_path = []
        path_edges = []
        total_cost = None
        is_reachable = True

        if destination:
            if destination not in self.nodes:
                return {
                    "success": False,
                    "error": f"Destination '{destination}' does not exist in network nodes.",
                    "has_negative_cycle": False
                }

            if distances[destination] == float("inf"):
                is_reachable = False
                total_cost = float("inf")
            else:
                curr = destination
                result_path = [curr]
                while curr != source and predecessors.get(curr) is not None:
                    curr = predecessors[curr]
                    result_path.append(curr)

                result_path.reverse()
                if result_path[0] != source:
                    # Not reachable from source
                    is_reachable = False
                    result_path = []
                    total_cost = float("inf")
                else:
                    total_cost = round(distances[destination], 2)
                    # Extract edge details
                    for i in range(len(result_path) - 1):
                        u = result_path[i]
                        v = result_path[i + 1]
                        # Find weight from edges
                        w = next((e["weight"] for e in self.edges if e["source"] == u and e["destination"] == v), 0.0)
                        path_edges.append({
                            "source": u,
                            "destination": v,
                            "weight": round(float(w), 2)
                        })

        formatted_final_distances = {
            k: ("INF" if math.isinf(v) else round(v, 2)) for k, v in distances.items()
        }

        return {
            "success": True,
            "has_negative_cycle": False,
            "source": source,
            "destination": destination,
            "is_reachable": is_reachable,
            "total_cost": total_cost,
            "shortest_path": result_path,
            "path_edges": path_edges,
            "formatted_route": " -> ".join(result_path) if result_path else "Unreachable",
            "initial_distances": {k: ("INF" if math.isinf(v) else round(v, 2)) for k, v in initial_distances.items()},
            "iterations": iterations_log,
            "total_iterations": len(iterations_log),
            "final_distances": formatted_final_distances,
            "predecessors": predecessors
        }
