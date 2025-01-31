"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import ReactFlow, {
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  type Connection,
  type Edge,
  ControlButton,
} from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import { CustomNode } from "./node";
import type { GrammarNode } from "./type";
import { CaseSensitive } from "lucide-react";

// Dagre graph configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

/**
 * Compute layout for nodes and edges using Dagre.
 */
const getLayoutedElements = (nodes: GrammarNode[], edges: Edge[]) => {
  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 50,
    ranksep: 50,
    edgesep: 50,
  });

  // Add nodes and edges to the graph
  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight })
  );
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  // Compute layout
  dagre.layout(dagreGraph);

  return {
    nodes: nodes.map((node) => {
      const nodeWithPosition = dagreGraph.node(node.id);
      return {
        ...node,
        position: {
          x: nodeWithPosition.x - nodeWidth / 2,
          y: nodeWithPosition.y - nodeHeight / 2,
        },
      };
    }),
    edges,
  };
};

// Define node types for React Flow
const nodeTypes = {
  sentence: CustomNode,
  nounPhrase: CustomNode,
  verbPhrase: CustomNode,
  noun: CustomNode,
  verb: CustomNode,
  prepPhrase: CustomNode,
  preposition: CustomNode,
  determiner: CustomNode,
  word: CustomNode,
};

interface SyntaxTreeProps {
  initialNodes: GrammarNode[];
  initialEdges: Edge[];
}

export default function GrammerSyntaxTree({
  initialNodes,
  initialEdges,
}: SyntaxTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [collapsed, setCollapsed] = useState(false);
  const isLayoutApplied = useRef(false);

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  useLayoutEffect(() => {
    if (!isLayoutApplied.current) {
      const { nodes: layoutedNodes, edges: layoutedEdges } =
        getLayoutedElements(nodes as Exclude<GrammarNode[], undefined>, edges);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
      isLayoutApplied.current = true;
    }
  }, [nodes, edges, setNodes, setEdges]);

  // useEffect(() => {
  //   if (collapsed) {
  //     setNodes((prevNodes) =>
  //       prevNodes.map((node) => ({
  //         ...node,
  //         hideFullForm: true,
  //       }))
  //     );
  //   } else {
  //     setNodes((prevNodes) =>
  //       prevNodes.map((node) => ({
  //         ...node,
  //         hideFullForm: false,
  //       }))
  //     );
  //   }
  //   isLayoutApplied.current = true;
  // }, [collapsed, setEdges, setNodes]);

  return (
    <ReactFlow
      fitView
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      minZoom={0.5}
      maxZoom={1.5}
      attributionPosition="bottom-left"
    >
      <Controls
        position="top-right"
        showInteractive={false}
      >
        {/* <ControlButton onClick={() => setCollapsed((prev) => !prev)}>
          <CaseSensitive />
        </ControlButton> */}
      </Controls>
      <Background gap={12} size={1} />
    </ReactFlow>
  );
}
