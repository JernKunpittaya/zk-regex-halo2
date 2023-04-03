function getRanges(array: number[]): [number, number][] {
    array.sort((a, b) => a-b)

    const final: [number, number][] = [[array[0], array[0]]];


    for (let i = 1; i < array.length; i++) {
      const cur = array[i];

      const [start, end] = final[final.length-1];

      if (cur === end + 1 ) {
        final[final.length - 1][1] = cur;
      } else {
        final.push([cur, cur])
      }
    }
    return final
  };

function parseHighlights(highlights: Record<string, number[]>) : Record<string, [number, number][]> {
    const final: Record<string, [number, number][]> = {};
    for (const id in highlights) {
    if (Object.prototype.hasOwnProperty.call(highlights, id)) {
        final[id] = getRanges(highlights[id]);
    }
    }
    return final;
};


const highlights = {
    'test1': [13, 15, 14, 12, 10],
    'test2': [1],
    'test3': [20, 21, 32, 33, 34, 35]
}

console.log(parseHighlights(highlights));