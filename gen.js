const fs = require("fs");
const path = require("path");
const regexpTree = require("regexp-tree");
const assert = require("assert");
const lexical = require("./lexical");

function simplifyGraph(regex) {
  const ast = regexpTree.parse(`/${regex}/`);
  regexpTree.traverse(ast, {
    "*": function ({ node }) {
      if (node.type === "CharacterClass") {
        throw new Error("CharacterClass not supported");
      }
    },
  });

  const graph_json = lexical.compile(regex);
  const N = graph_json.length;
  //   console.log("og: ", graph_json);
  states = [];
  alphabets = new Set();
  start_state = "0";
  accepted_states = new Set();
  transitions = {};
  for (let i = 0; i < N; i++) {
    states.push(i.toString());
    transitions[i.toString()] = {};
  }

  //loop through all the graph
  for (let i = 0; i < N; i++) {
    if (graph_json[i]["type"] == "accept") {
      accepted_states.add(i.toString());
    }
    if (graph_json[i]["edges"] != {}) {
      const keys = Object.keys(graph_json[i]["edges"]);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        let arr_key = key.substring(1, key.length - 1).split(",");
        for (let k = 0; k < arr_key.length; k++) {
          //   if (!(i in transitions)) {
          //     transitions[i] = {};
          //   }
          let alp = arr_key[k].substring(1, arr_key[k].length - 1);
          if (!(alp in alphabets)) {
            alphabets.add(alp);
          }
          transitions[i][alp] = graph_json[i]["edges"][key].toString();
        }
      }
    }
  }
  return {
    states: states,
    alphabets: alphabets,
    start_state: start_state,
    accepted_states: accepted_states,
    transitions: transitions,
  };
  //   console.log("f states ", states);
  //   console.log("f alph ", alphabets);
  //   console.log("f acc ", accepted_states);
  //   console.log("f trans ", transitions);
}

// Define a function to check whether a string is accepted by the finite automata
function accepts(simp_graph, str) {
  let state = simp_graph["start_state"];
  for (let i = 0; i < str.length; i++) {
    const symbol = str[i];

    // console.log("state ", state);
    // console.log("sym ", symbol);
    // console.log("lala ", simp_graph["transitions"][3]["a"]);
    if (simp_graph["transitions"][state][symbol]) {
      state = simp_graph["transitions"][state][symbol];
    } else {
      return false;
    }
  }
  return simp_graph["accepted_states"].has(state);
}

// Define a function to find all substrings of a long text that are accepted by the finite automata
function findSubstrings(regex, text) {
  const substrings = [];
  const simple_graph = simplifyGraph(regex);
  console.log("simp ", simple_graph);
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j <= text.length; j++) {
      const substring = text.slice(i, j);
      if (accepts(simple_graph, substring)) {
        substrings.push(substring);
      }
    }
  }
  return substrings;
}

async function generateTableAll(regex, circuitLibPath, circuitName) {
  const ast = regexpTree.parse(`/${regex}/`);
  regexpTree.traverse(ast, {
    "*": function ({ node }) {
      if (node.type === "CharacterClass") {
        throw new Error("CharacterClass not supported");
      }
    },
  });

  const graph_json = lexical.compile(regex);
  const N = graph_json.length;
  console.log("gen: ", graph_json);
  //   return graph_json;
  //   console.log("len: ", N);

  // start output to table all chars
  const writeStream = fs.createWriteStream("table_all.txt");
  // write start state (always 0)
  writeStream.write(0 + "\n");
  accept_states = [];
  all_transitions = [];

  // loop through all the graph
  for (let i = 0; i < N; i++) {
    if (graph_json[i]["type"] == "accept") {
      accept_states.push(i);
    }
    if (graph_json[i]["edges"] != {}) {
      const keys = Object.keys(graph_json[i]["edges"]);
      for (let j = 0; j < keys.length; j++) {
        const key = keys[j];
        // console.log("key ", key);
        let arr_key = key.substring(1, key.length - 1).split(",");
        for (let k = 0; k < arr_key.length; k++) {
          //   console.log("arr ", arr_key[k].substring(1, arr_key[k].length - 1));
          all_transitions.push(
            i +
              " " +
              graph_json[i]["edges"][key] +
              " " +
              arr_key[k].substring(1, arr_key[k].length - 1)
          );
        }
      }
    }
  }
  //   console.log("acc: ", accept_states);
  // write accepted states
  accept_states.forEach((state) => {
    writeStream.write(state + " ");
  });
  // write max state value (number of nodes in DFA)
  writeStream.write("\n" + N + "\n");
  // write all transitions
  all_transitions.forEach((state) => {
    writeStream.write(state + "\n");
  });
  writeStream.end();
}
// every substring
async function generateTableSub(
  regex,
  substrings,
  circuitLibPath,
  circuitName
) {
  const ast = regexpTree.parse(`/${regex}/`);
  regexpTree.traverse(ast, {
    "*": function ({ node }) {
      if (node.type === "CharacterClass") {
        throw new Error("CharacterClass not supported");
      }
    },
  });

  const graph_json = lexical.compile(regex);
  const N = graph_json.length;
  // substrings = [{min: _, max: _, trans: [[from1, to1], [from2, to2], ...] }, {min: _, max: _, trans: [[from1, to1], [from2, to2], ...]}, ...]
  let writeStream;
  // go through each substring
  let min = 0;
  // last state of previous variable parts
  let last_state = 0;
  let max = 0;
  for (let i = 0; i < substrings.length; i++) {
    writeStream = fs.createWriteStream("table_sub_" + i + ".txt");
    min += substrings[i]["trans"][0][0] - last_state;
    max += substrings[i]["trans"][0][0] - last_state + substrings[i]["max"] - 1;
    writeStream.write(substrings[i]["max"] + "\n");
    writeStream.write(min + "\n");
    writeStream.write(max + "\n");
    // console.log("afdsa ", substrings[i]["trans"]);
    substrings[i]["trans"].forEach((tran) => {
      writeStream.write(tran[0] + " " + tran[1] + "\n");
      if (tran[1] < last_state) {
        last_state = tran[1];
      }
    });
    writeStream.end();
    // update min
    min += substrings[i]["min"] - 1;
  }
}

// Example usage

let regex = "M(1|2|3|4|5)*(a|v|d|u)*t";
// const graph = generateTableAll(regex);
// console.log("midd ", graph);
let text = "asdM12tasdfjjllMtM12234aaatadsfl;jasd;flkMadt";
console.log("show all matches");
console.log(findSubstrings(regex, text));
// console.log("trytry: ", yoo);
// generateTableSub(regex, [
//   {
//     min: 1,
//     max: 5,
//     trans: [[1, 1]],
//   },
//   { min: 2, max: 4, trans: [[2, 2]] },
// ]);
