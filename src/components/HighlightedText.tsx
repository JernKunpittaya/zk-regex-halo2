import React, { useState, FC } from 'react';

// Passes in the final highlighted indices from extracted 
// states and makes them pretty!! ... as pretty as this CSS will be, at least.

type UserHighlightObject =  Record<string, [number[]]>;

type ColorObject = Record<string, string>

type StaticHighlightObject = [number, number][]

interface props {
  userHighlights: UserHighlightObject
  sampleText: string
  userColors: ColorObject
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

export const HighlightedText: React.FC<props> = ({ userHighlights, sampleText, userColors, staticHighlights }) => {
  const standardOpacity = 0.5
  console.log(staticHighlights)
  const colorSegments = Object.entries(userHighlights).map(([id, indices]) => ({
    id,
    segments: indices.flat(),
  }));
  const acceptedIdx = unrollRanges(staticHighlights)
  console.log(acceptedIdx)
  const rejTextColor = 'rgba(100, 100, 100, 1)' 
  const accTextColor = 'rgba(255, 255, 255, 1)'
  const offTextColor = 'rgba(160, 160, 160, 1)' 
  const real = acceptedIdx.length > 0

  return (
    <div>
    <p>
      {sampleText.split('').map((char, index) => {
        const segment = colorSegments.find(({ segments }) =>
          segments.includes(index));
        let color = offTextColor
        if (real) {
          color = acceptedIdx.includes(index) ? accTextColor : rejTextColor
        }

        if (segment) {
          // Apply the corresponding color to the character
          const { id, segments } = segment;
          return (
            <mark
            className='highlight'
            key={index} style={{
              backgroundColor: userColors[id],
              color: color,
              opacity: standardOpacity }}>
              {char}
            </mark>
          );
        } else {

          return  (
            <span
            key={index}
            style={{color: color}}>
              {char}
            </span>
          );
        }
      })}
      </p>
      <pre>{JSON.stringify(userHighlights, null, 2)}</pre>
  </div>
    
  );
}