import React, { useState } from 'react';
interface HighlightRecord {
  [name: string]: number[];
}

const SampleText = "This is a sample text for highlighting.";

export const Highlighter : React.FC<{
  sampleText: string
}> = ({sampleText}) => {
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [highlightName, setHighlightName] = useState('');
  const [allHighlights, setAllHighlights] = useState({})

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

  const color = `rgba(${Math.floor(Math.random() * 96+160)}, ${Math.floor(
    Math.random() * 96+160
  )}, ${Math.floor(Math.random() * 120
    +136)}, ${opacity})`

  const handleBeginHighlight = () => {
    setIsHighlighting(true);
  };

  const handleEndHighlight = () => {
    setIsHighlighting(false);
    // prompt user to enter name for highlight region
    const name = prompt('Enter highlight name:');
    if (name) {
      setHighlightName(name);
      // create new highlight entry in state object with name and highlighted indices
      // this assumes that you have defined a state object to store all highlights
      const condensed = highlightedIndices.length === 1 ? [highlightedIndices.sort((a, b) => a-b)[0], highlightedIndices.sort((a, b) => a-b)[0]] : [highlightedIndices.sort((a, b) => a-b)[0], highlightedIndices.sort((a, b) => a-b)[highlightedIndices.length - 1]];
      setAllHighlights((prevState) => ({ ...prevState, [name]: condensed}));
      setHighlightedIndices([]);
    }
    
  };

  // pass data from here into TextHighlights

  return (
    <div>
      <div>
        {sampleText.split('').map((char, index) => (
          <span
            key={index}
            style={{ backgroundColor: highlightedIndices.includes(index) ? color : 'transparent' }}
            onClick={() => handleHighlight(index)}
          >
            {char}
          </span>
        ))}
      </div>
      <button onClick={isHighlighting ? handleEndHighlight : handleBeginHighlight}>
        {isHighlighting ? 'End Highlight' : 'Begin New Highlight'}
      </button>
      <pre>{JSON.stringify(allHighlights, null, 2)}</pre>
    </div>
  );
};


// 1. user highlights sections of sample text
// 2. press a button to confirm these are the states they want
// 3. 