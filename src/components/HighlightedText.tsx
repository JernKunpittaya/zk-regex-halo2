import React, { useState, FC } from 'react';

// should await 

type UserHighlightObject =  Record<string, [number[]]>;

type ColorObject = Record<string, string>

interface props {
  userHighlights: UserHighlightObject
  sampleText: string
  userColors: ColorObject
}

export const HighlightedText: React.FC<props> = ({ userHighlights, sampleText, userColors }) => {

  const standardOpacity = 0.5
  console.log(userHighlights)
  const colorSegments = Object.entries(userHighlights).map(([id, indices]) => ({
    id,
    segments: indices.flat(),
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
            key={index} style={{ backgroundColor: userColors[id], opacity: standardOpacity }}>
              {char}
            </mark>
          );
        } else {

          return char;
        }
      })}
      <pre>{JSON.stringify(userHighlights, null, 2)}</pre>
    </p>
    
  );
}