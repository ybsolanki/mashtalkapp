
import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DeviceNode } from '../types';

interface MeshVisualizerProps {
  nodes: DeviceNode[];
}

const MeshVisualizer: React.FC<MeshVisualizerProps> = ({ nodes }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Simulation nodes with dynamic positions if not provided
    const displayNodes = nodes.map(d => ({
      ...d,
      x: d.id === 'me' ? width / 2 : Math.random() * width,
      y: d.id === 'me' ? height / 2 : Math.random() * height
    }));

    // Links based on distance (simulation of connectivity)
    const links: any[] = [];
    displayNodes.forEach((node, i) => {
      displayNodes.forEach((other, j) => {
        if (i < j) {
          const dx = (node.x || 0) - (other.x || 0);
          const dy = (node.y || 0) - (other.y || 0);
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 250) {
            links.push({ source: node.id, target: other.id, distance });
          }
        }
      });
    });

    const simulation = d3.forceSimulation(displayNodes as any)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(150))
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2));

    const link = svg.append("g")
      .attr("stroke", "#334155")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", 2);

    const node = svg.append("g")
      .selectAll("g")
      .data(displayNodes)
      .join("g")
      .call(d3.drag<any, any>()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", (d: any) => d.id === 'me' ? 12 : 8)
      .attr("fill", (d: any) => {
        if (d.id === 'me') return "#3b82f6";
        if (d.status === 'relay') return "#10b981";
        return "#64748b";
      })
      .attr("stroke", "#f8fafc")
      .attr("stroke-width", 2);

    node.append("text")
      .text((d: any) => d.name)
      .attr("x", 15)
      .attr("y", 5)
      .attr("fill", "#94a3b8")
      .style("font-size", "12px")
      .style("font-weight", "500");

    simulation.on("tick", () => {
      link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      node.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => simulation.stop();
  }, [nodes]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-slate-900/50 rounded-2xl border border-slate-700/50">
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded border border-blue-500/30 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div> Local Node
        </span>
        <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded border border-emerald-500/30 flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Relay
        </span>
      </div>
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
};

export default MeshVisualizer;
