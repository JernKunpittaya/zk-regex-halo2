import React, { useState, FC } from 'react';

// should await 

type HighlightObject =  Record<string, number[]>;

type ColorObject = Record<string, string>

interface props {
  highlights: HighlightObject
  sampleText: string
  usedColors: ColorObject
}

export const HighlightedText: React.FC<props> = ({ highlights, sampleText, usedColors }) => {

  const standardOpacity = 0.5
  console.log(highlights)
  const colorSegments = Object.entries(highlights).map(([id, indices]) => ({
    id,
    segments: indices,
  }));

  return (
    <p>
      {sampleText.split('').map((char, index) => {
        const segment = colorSegments.find(({ segments }) =>
          segments.includes(index)
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