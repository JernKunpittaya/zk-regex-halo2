// @ts-ignore
import React, { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { useAsync, useMount, useUpdateEffect } from "react-use";
// @ts-ignore
// @ts-ignore
import _, { add } from "lodash";
// @ts-ignore

import styled, { CSSProperties } from "styled-components";
import { Highlighter } from "./components/Highlighter";
import { HighlightedText } from "./components/HighlightedText";
import { Button } from "./components/Button";
import { match } from "assert";
import { generate } from "regexp-tree";
import { RegexInput } from "./components/RegexInput";

const {
  simplifyGraph,
  findSubstrings,
  matchDFAfromSub,
  matchSubfromDFA
} = require('./gen') ;

// takes in a regex to be represented into a DFA

// 1. user inputs value 
// 2. user presses button, gen.js is run to get resulting dfa 
// 3. dfa renders from results of gen.js and is displayed on page
// 4. user clicks through states of dfa to get desired states we want to extract 
// 5. user clicks a button to run gen .js to extract text to highlight from input header/body 

type HighlightObject =  Record<string, number[]>;
type ColorObject = Record<string, string>
type UserHighlightObject = Record<string, [number[]]>
type DFAGraphObject = Record<string, [Set<number>[]]>


export const MainPage: React.FC<{}> = (props) => {
  const text = "accttsdM1aatasdfu]kktjjllM1233vdt[tM155aaatad]sfl;jasd;flkM15adt"
  const testRegex = "M(1|2|3|4|5)*(a|v|d|u)*t"

  const [userHighlights, setUserHighlights] = useState<UserHighlightObject>({});
  const [userColors, setUserColors] = useState<ColorObject>({});
  const [newHighlight, setNewHighlight] = useState<HighlightObject>({});
  const [newColor, setNewColor] = useState<ColorObject>({});
  const [DFAStates, setDFAStates] = useState({});
  const [regex, setRegex] = useState<string>("");
  const [displayMessage, setDisplayMessage] = useState<string>("Convert to DFA!");
  const [rawDFA, setRawDFA] = useState<DFAGraphObject>({})
  const [convertActive, setConvertActive] = useState<Boolean>(false);

  // const prevUserHighlights = usePrevious(userHighlights);

  // =================== Compile Functions =================== //

  function generateSegments(regex: string, idxPair: number[]) {
    console.log("idxPair, ", idxPair)
    const graph = simplifyGraph(regex)
    const [substr, idxs] = findSubstrings(graph, text)
    const states = matchDFAfromSub(graph, idxs, idxPair, text)

    const final = matchSubfromDFA(graph, text, idxs, states)
    return [states, final]
  }


  // ================== DFA functions =================== //

  function handleGenerateDFA() {
    const graph = simplifyGraph(regex)
    setRawDFA(graph)
  }

  function handleUpdateDFA() {
    return
  }

  useEffect (() => {
    if (convertActive) {
      handleGenerateDFA()
      console.log('DFA ', rawDFA) // rawDFA is always behind???? we need some argument to pass this in at a timely manner
      setConvertActive(false)
    } 
  }, [convertActive]);


  // =============== Text Highlight functions ================ //

  function handleUpdateHighlight(newData: HighlightObject) {
    const key = Object.keys(newData)[0]
    const raw = newData[key]
    const processedSegments: Record<string, [number[]]> = {}
    processedSegments[key] = generateSegments(testRegex, raw)[1]

    setUserHighlights((prevState) => {
      const updatedState = {...prevState, ...processedSegments};
      return updatedState
    });
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
            setNewColor={setNewColor}/> {/* returns highlightedText */}

          <HighlightedText
          userHighlights={userHighlights}
          sampleText={text}
          userColors={userColors}/>

          {/* <MinDFA> */}
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