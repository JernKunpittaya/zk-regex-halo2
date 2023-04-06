import React, { useState, useEffect, FC } from 'react';
import { RecursivePartial, NodeOptions, EdgeOptions, DagreReact } from "dagre-reactjs";

type DagreGraphObject = {
    "nodes": RecursivePartial<NodeOptions>[],
    "edges": RecursivePartial<EdgeOptions>[]
  }

interface props {
    DagreGraph: DagreGraphObject
}
export const DFAVis : React.FC<props> = ({ DagreGraph }) => {
    const allPieces = DagreGraph
    if (DagreGraph.nodes.length > 0 ) {
        return (
        <svg id="schedule" width={1000} height={1000}>
            <DagreReact
              nodes={allPieces.nodes}
              edges={allPieces.edges}
            />
        </svg>
        ) } else {
            return (
                <div></div>
            )
        }
}