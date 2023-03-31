import React, { useState } from 'react';

interface HighlightRecord {
  [name: string]: number[];
}
const SampleText = "This is a sample text for highlighting.";

export const Highlighter : React.FC<{}> = ({}) => {
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

  const handleBeginHighlight = () => {
    setIsHighlighting(true);
  };

  const handleEndHighlight = () => {
    setIsHighlighting(false);
    // prompt user to enter name for highlight region
    const name = prompt('Enter highlight name:');
    if (name) {
      setHighlightName(name);
      setAllHighlights((prevState) => ({ ...prevState, [name]: highlightedIndices }));
      setHighlightedIndices([]);
    }
  };

  // sample text to highlight
  const text = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';

  return (
    <div>
      <div>
        {SampleText.split('').map((char, index) => (
          <span
            key={index}
            style={{ backgroundColor: highlightedIndices.includes(index) ? 'yellow' : 'transparent' }}
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