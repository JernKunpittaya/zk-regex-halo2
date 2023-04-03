// takes in allHighlights from Highlighter.tsx, then feeds it to gen functions
// this should just be static? updated every time someone presses end highlight
import React, { useState, FC } from 'react';

const sampleText = "This is a sample text for highlighting.";

type HighlightObject =  Record<string, [number, number][]>;

interface Props {
  highlights: HighlightObject
  sampleText: string
}

export const HighlightedText: React.FC<Props> = ({ highlights, sampleText }) => {

  const standardOpacity = 0.5
  const colorSegments = Object.entries(highlights).map(([color, indices]) => ({
    color,
    segments: indices.map(([start, end]) => ({
      start,
      end,
    })),
  }));

  const colors: Record<string, string> = {};

  Object.keys(highlights).forEach((id) => {
    colors[id] = `rgba(${Math.floor(Math.random() * 96+160)}, ${Math.floor(
      Math.random() * 96+160
    )}, ${Math.floor(Math.random() * 120
      +136)}, ${standardOpacity})`;
  });

  return (
    <p>
      {sampleText.split('').map((char, index) => {
        const segment = colorSegments.find(({ segments }) =>
          segments.some(({ start, end }) => index >= start && index < end)
        );

        if (segment) {
          // Apply the corresponding color to the character
          const { color, segments } = segment;
          return (
            <mark
            className='highlight'
            key={index} style={{ backgroundColor: colors[color], opacity: standardOpacity }}>
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