import React, { useState, FC } from 'react';
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
  const [buttonClick, setButtonClick] = useState(0);
  const [colors, setColors] = useState({})
  const [curColor, setCurColor] = useState("rgba(0, 0, 0, 1)")

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
      const condensed = highlightedIndices.length === 1 ? [highlightedIndices.sort((a, b) => a-b)[0], highlightedIndices.sort((a, b) => a-b)[0]] : [highlightedIndices.sort((a, b) => a-b)[0], highlightedIndices.sort((a, b) => a-b)[highlightedIndices.length - 1]];
      setAllHighlights((prevState) => ({ ...prevState, [name]: condensed}));
      setColors((prevState) => ({ ...prevState, [name]: curColor}));
      setHighlightedIndices([]);
    }
    setButtonClick(buttonClick+1)

    
  };

  return (
    <div>
      <div>
        {sampleText.split('').map((char, index) => (
          <span
            key={index}
            style={{ backgroundColor: highlightedIndices.includes(index) ? curColor : 'transparent' }}
            onClick={() => handleHighlight(index)}
          >
            {char}
          </span>
        ))}
      </div>
      <button onClick={isHighlighting ? handleEndHighlight : handleBeginHighlight}>
        {isHighlighting ? 'End Highlight' : 'Begin New Highlight'}
      </button>

      <HighlightedText highlights={allHighlights} sampleText={sampleText} usedColors={colors}/>
      <pre>{JSON.stringify(allHighlights, null, 2)}</pre>
    </div>
  );
};


type HighlightObject =  Record<string, [number, number][]>;

type ColorObject = Record<string, string>

interface Props {
  highlights: HighlightObject
  sampleText: string
  usedColors: ColorObject
}

const HighlightedText: React.FC<Props> = ({ highlights, sampleText, usedColors }) => {

  const standardOpacity = 0.5
  console.log(highlights)
  const colorSegments = Object.entries(highlights).map(([id, indices]) => ({
    id,
    segments: indices.map(([start, end]) => ({
      start,
      end,
    })),
  }));

  return (
    <p>
      {sampleText.split('').map((char, index) => {
        const segment = colorSegments.find(({ segments }) =>
          segments.some(({ start, end }) => index >= start && index < end+1)
        );

        if (segment) {
          // Apply the corresponding color to the character
          const { id, segments } = segment;
          return (
            <mark
            className='highlight'
            key={index} style={{ backgroundColor: usedColors[id], opacity: standardOpacity }}>
              {char}
            </mark>
          );
        } else {

          return char;
        }
      })}
    </p>
  );
}