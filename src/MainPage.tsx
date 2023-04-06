// @ts-ignore
import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { useAsync, useMount, useUpdateEffect } from "react-use";
// @ts-ignore
// @ts-ignore
import _, { add, update } from "lodash";
// @ts-ignore


import styled, { CSSProperties } from "styled-components";
import { Highlighter } from "./components/Highlighter";
import { HighlightedText } from "./components/HighlightedText";
import { Button } from "./components/Button";
import { match } from "assert";
import { generate } from "regexp-tree";
import { RegexInput } from "./components/RegexInput";
// import { RecursivePartial, NodeOptions, EdgeOptions, DagreReact } from "dagre-reactjs";
import { DFAConstructor } from "./components/MinDFA";
import { RecursivePartial, NodeOptions, EdgeOptions, DagreReact } from "dagre-reactjs";


const {
  simplifyGraph,
  findSubstrings,
  matchDFAfromSub,
  matchSubfromDFA
} = require("./gen") ;

// takes in a regex to be represented into a DFA

// 1. user inputs value 
// 2. user presses button, gen.js is run to get resulting dfa 
// 3. dfa renders from results of gen.js and is displayed on page
// 4. user clicks through states of dfa to get desired states we want to extract 
// 5. user clicks a button to run gen .js to extract text to highlight from input header/body 

type HighlightObject =  Record<string, number[]>;
type ColorObject = Record<string, string>
type UserHighlightObject = Record<string, [number[]]>
type StaticHighlightObject = [number, number][]
type DFAStateObject = Record<string, Set<string>>
type DFAHighlightObject = Record<string, DFAStateObject>
type DFAGraphObject = {
  "accepted_states": Set<string>,
  "alphabets": Set<string>,
  "or_sets": Set<string>,
  "start_state": string,
  "states": string[],
  "transitions": Record<string, Record<string, string>>
}
type DagreGraphObject = {
  "nodes": RecursivePartial<NodeOptions>[],
  "edges": RecursivePartial<EdgeOptions>[]
}


export const MainPage: React.FC<{}> = (props) => {
  const text = "accttsdM1aatasdfu]kktjjllM1233vdt[tM155aaatad]sfl;jasd;flkM15adt"
  const testRegex = "M(1|2|3|4|5)*(a|v|d|u)*t"
  const [convertActive, setConvertActive] = useState<Boolean>(false);

  /// ************ HIGHLIGHT STATES *********** /// 

  const [userHighlights, setUserHighlights] = useState<UserHighlightObject>({});
  const [staticHighlights, setStaticHighlights] = useState<StaticHighlightObject>([])
  const [userColors, setUserColors] = useState<ColorObject>({});
  const [newHighlight, setNewHighlight] = useState<HighlightObject>({});
  const [newColor, setNewColor] = useState<ColorObject>({});

  /// ************ REGEX STATES *********** /// 

  const [regex, setRegex] = useState<string>("");
  const [displayMessage, setDisplayMessage] = useState<string>("Convert to DFA!");

  /// ************ DFA STATES *********** /// 
  const [rawDFA, setRawDFA] = useState<DFAGraphObject>({
    "accepted_states": new Set<string>(),
    "alphabets": new Set<string>(),
    "or_sets": new Set<string>(),
    "start_state": "",
    "states": [],
    "transitions": {}
  })
  const [renderDFA, setRenderDFA] = useState<boolean>(false)
  const [DFAActiveState, setDFAActiveState] = useState<DFAHighlightObject>({});
  const [AllDFAHighlights, setAllDFAHighlights] = useState<DFAHighlightObject>({}); //this one is accumulating, not refreshing
  const [dagreGraph, setDagreGraph] = useState<DagreGraphObject>({nodes: [], edges: []})

  // const prevUserHighlights = usePrevious(userHighlights);

  // =================== Compile Functions =================== //

  function generateSegments(regex: string) {
    // Generate accepted substrings and a function used to 
    // match segments and states given an index pair.

    // console.log("idxPair, ", idxPair)
    const graph = simplifyGraph(regex)
    const [substr, idxs] = findSubstrings(graph, text)

    function matchSegments(idxPair: number[]) {
      const states:DFAStateObject = matchDFAfromSub(graph, idxs, idxPair, text)
      const final = matchSubfromDFA(graph, text, idxs, states)
      return [states, final]
    }
    return [ idxs, matchSegments ]
  }


  // ================== DFA functions =================== //

  // function DFAToDagre(mindfa: DFAGraphObject) {
  //   // Turn a DFA into a Dagre-react-compatible Node object
  //   // and edge object.

  //   // DFA : {
  //   // accepted states: set
  //   // alphabets: set
  //   // or_sets: set
  //   // start_state: number --> turn to number
  //   // states: array
  //   // transitions: Record<number, Record<string, number>>
  //   // }

  //   const nodes = {string: }[]
  //   const edges = []


  //   return [nodes, edges]
  // }

  function handleGenerateDFA() {
    // Generate graph parameters
    const graph = simplifyGraph(regex)
    setRawDFA(graph)
  }

  function handleUpdateDFA() {
    // 
    return
  }

  useEffect (() => {
    // Generates DFA and renders accepted segments
    if (convertActive) {
      handleGenerateDFA()
      console.log('DFA ', rawDFA) // rawDFA is always behind???? we need some argument to pass this in at a timely manner
      handleUpdateStaticHighlight()
      setConvertActive(false)
    }
  }, [convertActive]);


  // =============== Text Highlight functions ================ //

  // once a regex is entered, immediately update userHighlights under name accepted--
  // we can have this be a static highlight maybe? i.e. we store it in a 
  // putting in a new regex should clear all highlights ==> this is not hard to do!
  // pass in more arguments through

  function handleUpdateStaticHighlight() {
    // Displaying accepted segments in input text after Regex.
    const indices = generateSegments(regex)[0]
    console.log("reached")
    setStaticHighlights(indices)
  }

  function handleUpdateHighlight(newData: HighlightObject) {
    // updates highlight on text input and also DFA
    const key = Object.keys(newData)[0]
    const raw = newData[key]
    const processedStates: Record<string, DFAStateObject> = {}
    const processedSegments: Record<string, [number[]]> = {}
    processedSegments[key] = generateSegments(regex)[1](raw)[1]
    processedStates[key] = generateSegments(regex)[1](raw)[0]

    setUserHighlights((prevState) => {
      const updatedState = {...prevState, ...processedSegments};
      return updatedState
    });

    setAllDFAHighlights((prevState) => {
      const updatedState = {...prevState, ...processedStates};
      return updatedState
    })

    setDFAActiveState(processedStates); //note that there's actually no history of the active states.

    setRenderDFA(true)
  };

  function handleUpdateColor(newData: ColorObject) {
    setUserColors((prevState) => {
      const updatedState = {...prevState, ...newData};
      return updatedState
    });
  };

  useUpdateEffect(() => {
    handleUpdateHighlight(newHighlight)
  }, [newHighlight]);

  useUpdateEffect(()=>  {
    handleUpdateColor(newColor)
  }, [newColor])

  // =================== Rendering ==================== //

    return (
        <Container>
          <RegexInput
          label="Enter your regex here:"
          value={regex}
          onChange={(e) => {
            console.log(regex)
            setRegex(e.currentTarget.value);
          }}
          />
          <Button
          disabled={displayMessage != "Convert to DFA!" || regex.length === 0}
          onClick={async () => {
            console.log("yes")
            setConvertActive(true)
            setDisplayMessage("Generating DFA...")
            await handleGenerateDFA()
            setDisplayMessage("Convert to DFA!")
            console.log("rawDFA: ", rawDFA)
            console.log("render state: ", renderDFA)
          }}
          >
            {displayMessage}
          </Button>

          {/* <TextInput> => passes down to highlighter */}
            <Highlighter
            sampleText={text}
            newHighlight={{}}
            setNewHighlight={setNewHighlight}
            newColor={{}}
            setNewColor={setNewColor}
            staticHighlights={staticHighlights}
            /> {/* returns highlightedText */}

          <HighlightedText
          userHighlights={userHighlights}
          sampleText={text}
          userColors={userColors}
          staticHighlights={staticHighlights}/>


          <DFAConstructor
          minDFA={rawDFA}
          userColor={newColor}
          activeStates={DFAActiveState}
          render={renderDFA}
          />

        </Container>
    );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  & .title {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  & .main {
    & .signaturePane {
      flex: 1;
      display: flex;
      flex-direction: column;
      & > :first-child {
        height: calc(30vh + 24px);
      }
    }
  }

  & .bottom {
    display: flex;
    flex-direction: column;
    align-items: center;
    & p {
      text-align: center;
    }
    & .labeledTextAreaContainer {
      align-self: center;
      max-width: 50vw;
      width: 500px;
    }
  }
`;