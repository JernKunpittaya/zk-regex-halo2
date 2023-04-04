// @ts-ignore
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAsync, useMount, useUpdateEffect } from "react-use";
// @ts-ignore
// @ts-ignore
import _, { add } from "lodash";
// @ts-ignore

import styled, { CSSProperties } from "styled-components";
import { Highlighter } from "./components/Highlighter";
import { HighlightedText } from "./components/HighlightedText";
import { Button } from "./components/Button";

// takes in a regex to be represented into a DFA

// 1. user inputs value 
// 2. user presses button, gen.js is run to get resulting dfa 
// 3. dfa renders from results of gen.js and is displayed on page
// 4. user clicks through states of dfa to get desired states we want to extract 
// 5. user clicks a button to run gen .js to extract text to highlight from input header/body 

type HighlightObject =  Record<string, number[]>;
type ColorObject = Record<string, string>


export const MainPage: React.FC<{}> = (props) => {

  const text = "Some sample text to be highlighted."
  const [userHighlights, setUserHighlights] = useState<HighlightObject>({});
  const [userColors, setUserColors] = useState<ColorObject>({});

  useUpdateEffect(() => {

  }, [userHighlights]);

  useUpdateEffect(()=>  {

  }, [userColors])

  

    return (
        <Container>
          {/* <RegexInput> */}
          {/* <TextInput> => passes down to highlighter */}
            <Highlighter
            sampleText={text}
            userHighlights={userHighlights}
            setUserHighlights={setUserHighlights}
            userColors={userColors}
            setUserColors={setUserColors}/> {/* returns highlightedText */}
          {/* <Button> press this to pass down */}

          <HighlightedText highlights={userHighlights} sampleText={text} usedColors={userColors}/>
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