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
  const indexes = [];
  const simple_graph = simplifyGraph(regex);
  console.log("simp ", simple_graph);
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j <= text.length; j++) {
      const substring = text.slice(i, j);
      if (accepts(simple_graph, substring)) {
        substrings.push(substring);
        indexes.push([i, j]);
      }
    }
  }
  // indexes is not inclusive at the end
  return [substrings, indexes];
}
// match from DFA to text
function matchSubfromDFA(states, indexes, simp_graph, text) {
  //states is {1:{"2"},3:{"3","4"},4:{"6"}}
  // indexes is like [ [ 3, 7 ], [ 15, 17 ], [ 17, 27 ], [ 41, 45 ] ]
  let reveal_all = [];
  let reveal_index;
  for (let i = 0; i < indexes.length; i++) {
    let state = simp_graph["start_state"];
    reveal_index = [];
    for (let j = indexes[i][0]; j < indexes[i][1]; j++) {
      const symbol = text[j];
      if (simp_graph["transitions"][state][symbol]) {
        next_state = simp_graph["transitions"][state][symbol];
        if (states[state] && states[state].has(next_state)) {
          reveal_index.push(j);
        }
        state = next_state;
      } else {
        break;
      }
    }
    console.log("rev ", reveal_index);
    reveal_all.push(reveal_index);
  }
  // return the reveal position of substring extraction.
  return reveal_all;
}
// match from text to DFA. Flow can be one substring --> state --> to all substrings
// rn support only continuous substring.
function matchSubstring(sub_index, indexes) {
  // sub_index = (i, j) non inclusive
  // indexes = sth like [ [ 3, 7 ], [ 15, 17 ], [ 17, 27 ], [ 41, 45 ] ]
}

let regex = "M(1|2|3|4|5)*(a|v|d|u)*t";
let text = "asdM12tasdfjjllMtM12234aaatadsfl;jasd;flkMadt";
const [sub, ind] = findSubstrings(regex, text);
console.log("substring: ", sub);
console.log("index ", ind);

// select DFA states from frontend.
states = {};
const myset = new Set();
myset.add("2");
states["1"] = myset;
states["2"] = myset;
console.log("settt: ", states);

console.log(
  "final: ",
  matchSubfromDFA(states, ind, simplifyGraph(regex), text)
);
