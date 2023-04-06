import React, { useState, useEffect, FC } from 'react';
import { RecursivePartial, NodeOptions, EdgeOptions, DagreReact } from "dagre-reactjs";

// Takes in a raw DFA input to render in Dagre
// Only highlights one state at a time!

type NodeObject = RecursivePartial<NodeOptions>
type EdgeObject = RecursivePartial<EdgeOptions>
type DFAGraphObject = {
    "accepted_states": Set<string>,
    "alphabets": Set<string>,
    "or_sets": Set<string>,
    "start_state": string,
    "states": string[],
    "transitions": Record<string, Record<string, string>>
  }

// type ColorObject = Record<string, string>
type DFAStateObject = Record<string, Set<string>> // how active edges are represented
type DFAHighlightObject = Record<string, DFAStateObject> // name: active state
type ColorObject = Record<string, string>
type DagreGraphObject = {
  "nodes": RecursivePartial<NodeOptions>[],
  "edges": RecursivePartial<EdgeOptions>[]
}


interface props {
    minDFA: DFAGraphObject
    userColor: ColorObject // ONE COLOR AT A TIME
    activeStates: DFAHighlightObject // make all nodes and edges listed here same color-- show JUST ONE
    render: boolean
    passBackGraph: React.Dispatch<React.SetStateAction<DagreGraphObject>>
}

export const DFAConstructor: React.FC<props> = ({ minDFA, userColor, activeStates, render, passBackGraph }) => {
  if (render) {
    console.log("============ RENDERED =============")
    console.log(minDFA,"/n", userColor,"/n", activeStates)
    const [activeNodes, setActiveNodes] = useState<string[]>([]) // maybe just make this a list
    const [activeEdges, setActiveEdges] = useState<DFAStateObject>({})
    const colorExtract = Object.values(userColor)[0]

    useEffect(() => {
      const trnst = Object.values(activeStates)[0]
      let activeNodeSet = new Set(Object.keys(trnst))
  
      for (let key in trnst) {
        activeNodeSet = new Set(Array.from(activeNodeSet).concat(Array.from(trnst[key])))
      }
  
      setActiveNodes(Array.from(activeNodeSet));
    }, [activeStates])

    console.log(activeNodes)

    const allNodes = minDFA.states.map((idx) => {
      console.log("idx, ", idx)
      const accept = minDFA["accepted_states"].has(idx)
      const start = minDFA.start_state === idx

      const nodeHolder = {
        id: idx,
        label: start ? "Start" : idx,
        shape: "circle",
        styles: {
          shape: {
            styles: { fill: activeNodes.includes(idx) ? colorExtract : "rgba(255, 255, 255, 1)", stroke: accept ? "rgba(0, 0, 255, 0.6)" : "rgba(0, 0, 0, 1)" }
          },
          node: {
            padding: {
              top: 20,
              bottom: 20,
              left: 20,
              right: 20
            }
          }
        }
      }
      return nodeHolder
    })

    const allEdges = Object.keys(minDFA.transitions).map((start) => {
      const sinks = minDFA['transitions'][start]
      const edges = Object.keys(sinks).map((lx) => {
        const end = sinks[lx]
        const isTransition = Object.keys(activeEdges).includes(start)  ? ( activeEdges[start].has(end) ? true : false ) : false

        const edgeHolder = {
          from: start,
          to: end,
          points: [],
          // pathType: "d3curve",
          label: lx,
          styles: {
            edge: {
              styles: {
                strokeWidth: "4px",
                fill: "rgba(255, 255, 255, 1)",
                stroke: isTransition ? colorExtract : "rgba(0, 0, 0, 1)"
              }
            },
            marker: {
              styles: {
                strokeWidth: "2px",
                fill: isTransition ? colorExtract : "rgba(0, 0, 0, 1)",
                stroke: isTransition ? colorExtract : "rgba(0, 0, 0, 1)"
              }
            }
          }
        }
        return edgeHolder
      })
      return edges
    }).flat()

    console.log("nodes: ", allNodes)
    console.log("edges: ", allEdges)

    const test1 = {
      nodes: [
      {
        id: "0",
        label: "Project Start",
        shape: "circle",
        styles: {
          shape: {
            styles: { fill: "#fff", stroke: "#000" }
          },
          node: {
            padding: {
              top: 20,
              bottom: 20,
              left: 20,
              right: 20
            }
          }
        }
      },
      {
        id: "2",
        label: "Project End",
        styles: {
          shape: {
            styles: { fill: "#fff", stroke: "#000" }
          },
          node: {
            padding: {
              top: 20,
              bottom: 20,
              left: 20,
              right: 20
            }
          }
        }
      },
      {
        id: "3",
        label: "A",
        styles: {
          shape: {
            styles: { fill: "#fff", stroke: "#000" }
          },
          node: {
            padding: {
              top: 20,
              bottom: 20,
              left: 20,
              right: 20
            }
          }
        }
      },
      {
        id: "4",
        label: "B",
        styles: {
          shape: {
            styles: { fill: "#fff", stroke: "#fff" }
          },
          node: {
            padding: {
              top: 20,
              bottom: 20,
              left: 20,
              right: 20
            }
          }
        }
      }
    ],
    edges: [
      {
        from: "0",
        to: "3"
      },
      {
        from: "0",
        to: "4"
      },
      {
        from: "3",
        to: "2"
      },
      {
        from: "4",
        to: "2"
      }
    ]
  };

  const allPieces = {
    nodes: allNodes,
    edges: allEdges
  }

  passBackGraph(allPieces)
  console.log(allPieces)

    return (
      <div> {"Graph rendered below:"} </div>
    )} else {
      return(
    <div> {"Submit a highlight to render DFA."} </div>
  )}

};

export {}
