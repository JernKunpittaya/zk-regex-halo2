import React, { useState, FC } from 'react';


// Highlight text on a text input and auto-highlight the rest of the text segments
// corresponding to the same DFA states.

// Exports allHighlights 

type HighlightObject =  Record<string, number[]>;

type ColorObject = Record<string, string>

const SampleText = "This is a sample text for highlighting.";

interface props {
  sampleText: string
  userHighlights: HighlightObject
  setUserHighlights: React.Dispatch<React.SetStateAction<HighlightObject>>;
  userColors: ColorObject
  setUserColors: React.Dispatch<React.SetStateAction<ColorObject>>;
}

export const Highlighter : React.FC<props> = ({sampleText, userHighlights, setUserHighlights, userColors, setUserColors}) => {
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([]);
  const [highlightName, setHighlightName] = useState('');
  // const [allHighlights, setAllHighlights] = useState({})
  const [buttonClick, setButtonClick] = useState(0);
  // const [colors, setColors] = useState({})
  const [curColor, setCurColor] = useState("rgba(0, 0, 0, 1)")
  // const [testingOnly, setTestingOnly] = useState({})

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
      const range = (start: number, end:number) => Array.from(Array(end - start + 1).keys()).map(x => x + start);
      const testing = range(condensed[0], condensed[1])
      setUserHighlights((prevState) => ({ ...prevState, [name]: condensed}));

      setUserColors((prevState) => ({ ...prevState, [name]: curColor}));
      // setTestingOnly((prevState) => ({...prevState, [name]: testing}));
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

      {/* Highlighted Text Below: maybe the two files should still be separated? */}

      {/* <HighlightedText highlights={allHighlights} sampleText={sampleText} usedColors={colors}/> */}
      {/* <HighlightedText highlights={testingOnly} sampleText={sampleText} usedColors={colors}/> */}
      <pre>{JSON.stringify(userHighlights, null, 2)}</pre>
      {/* <pre>{JSON.stringify(testingOnly, null, 2)}</pre> */}
    </div>
  );
};



/// MUST pass in

// type HighlightObject =  Record<string, number[]>;

// type ColorObject = Record<string, string>

// interface Props {
//   highlights: HighlightObject
//   sampleText: string
//   usedColors: ColorObject
// }

// const HighlightedText: React.FC<Props> = ({ highlights, sampleText, usedColors }) => {

//   const standardOpacity = 0.5
//   console.log(highlights)
//   const colorSegments = Object.entries(highlights).map(([id, indices]) => ({
//     id,
//     segments: indices,
//   }));

//   return (
//     <p>
//       {sampleText.split('').map((char, index) => {
//         const segment = colorSegments.find(({ segments }) =>
//           segments.includes(index)
//         );

//         if (segment) {
//           // Apply the corresponding color to the character
//           const { id, segments } = segment;
//           return (
//             <mark
//             className='highlight'
//             key={index} style={{ backgroundColor: usedColors[id], opacity: standardOpacity }}>
//               {char}
//             </mark>
//           );
//         } else {

//           return char;
//         }
//       })}
//     </p>
//   );


// 1. user highlights sections of sample text
// 2. press a button to confirm these are the states they want
// 3. 