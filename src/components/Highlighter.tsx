import React, { useState, FC } from 'react';
import { Button } from './Button';

// Highlight text on a text input and auto-highlight the rest of the text segments
// corresponding to the same DFA states.

type HighlightObject =  Record<string, number[]>;

type ColorObject = Record<string, string>

type StaticHighlightObject = [number, number][]

const SampleText = "This is a sample text for highlighting.";

interface props {
  sampleText: string
  newHighlight: HighlightObject
  setNewHighlight: React.Dispatch<React.SetStateAction<HighlightObject>>;
  newColor: ColorObject
  setNewColor: React.Dispatch<React.SetStateAction<ColorObject>>;
  staticHighlights: StaticHighlightObject
}


function unrollRanges(ranges: [number, number][]): number[] {
  const result: number[] = [];
  for (const range of ranges) {
    const [start, end] = range;
    for (let i = start; i <= end; i++) {
      result.push(i);
    }
  }
  return result;
}

export const Highlighter : React.FC<props> = ({sampleText, newHighlight, setNewHighlight, newColor, setNewColor, staticHighlights}) => {
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [highlightName, setHighlightName] = useState('');
  // const [allHighlights, setAllHighlights] = useState({})
  const [buttonClick, setButtonClick] = useState(0);
  // const [colors, setColors] = useState({})
  const [curColor, setCurColor] = useState("rgba(0, 0, 0, 1)")
  // const [testingOnly, setTestingOnly] = useState({})

  const acceptedIdx = unrollRanges(staticHighlights)
  console.log(acceptedIdx)
  const rejTextColor = 'rgba(100, 100, 100, 1)' 
  const accTextColor = 'rgba(255, 255, 255, 1)'
  const offTextColor = 'rgba(160, 160, 160, 1)' 
  const real = acceptedIdx.length > 0

  const handleHighlight = (index: number) => {
    if (isHighlighting) {
      if (highlightedIndices.includes(index)) {
        setHighlightedIndices((prevState) => prevState.filter((i) => i !== index));
      } else {
        setHighlightedIndices((prevState) => [...prevState, index]);
      }
    }
  };

  const opacity = 0.5

  const handleBeginHighlight = () => {
    setIsHighlighting(true);
    setButtonClick(buttonClick+1)
    setCurColor(`rgba(${Math.floor(Math.random() * 96+160)}, ${Math.floor(Math.random() * 96+160 )}, ${Math.floor(Math.random() * 120 +136)}, ${opacity})`)
  };

  const handleEndHighlight = () => {
    setIsHighlighting(false);
    // prompt user to enter name for highlight region
    const name = prompt('Enter highlight name:');
    if (name) {
      setHighlightName(name);
      const condensed = highlightedIndices.length === 1 ? [highlightedIndices.sort((a, b) => a-b)[0], highlightedIndices.sort((a, b) => a-b)[0]+1] : [highlightedIndices.sort((a, b) => a-b)[0], highlightedIndices.sort((a, b) => a-b)[highlightedIndices.length - 1]];
      const range = (start: number, end:number) => Array.from(Array(end - start + 1).keys()).map(x => x + start);
      // const testing = range(condensed[0], condensed[1])
      setNewHighlight({[name]: condensed});
      setNewColor({[name]: curColor});
      // setTestingOnly((prevState) => ({...prevState, [name]: testing}));
      setHighlightedIndices([]);
    }
    setButtonClick(buttonClick+1)
    
  };

  return (
    <div>
      <div>
        {sampleText.split('').map((char, index) => {
          let color = offTextColor
          if (real) {
            color = acceptedIdx.includes(index) ? accTextColor : rejTextColor
          }
          return (
            <span
            key={index}
            style={{
              backgroundColor: highlightedIndices.includes(index) ? curColor : 'transparent',
              color: color}}
            onClick={() => handleHighlight(index)}
          >
            {char}
          </span>
          )
})}
      </div>
      <Button onClick={isHighlighting ? handleEndHighlight : handleBeginHighlight}>
        {isHighlighting ? 'End Highlight' : 'Begin New Highlight'}
      </Button>
    </div>
  );
};