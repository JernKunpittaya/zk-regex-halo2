const fs = require("fs");
const path = require("path");
const regexpTree = require("regexp-tree");
const assert = require("assert");
const lexical = require("./lexical");
const gen = require("./gen");

// Generate table for all chars DFA
async function generateTableAll(simp_graph) {
  // start output to table all chars
  const writeStream = fs.createWriteStream("table_all.txt");
  // write start state (always 0)
  writeStream.write(0 + "\n");
  // write accepted state
  simp_graph["accepted_states"].forEach((state) => {
    writeStream.write(state + " ");
  });
  // write number of nodes in DFA
  writeStream.write("\n" + simp_graph["states"].length + "\n");
  // write current state, next state, char
  for (const state in simp_graph["transitions"]) {
    if (simp_graph["transitions"][state] != {}) {
      for (const alp in simp_graph["transitions"][state]) {
        writeStream.write(
          state + " " + simp_graph["transitions"][state][alp] + " " + alp + "\n"
        );
      }
    }
  }
  writeStream.end();
}
// Generate table for substring, given the state to reveal
// MUST refer to the table all of its corresponding regex
async function generateTableSub(states) {
  // states = a list of states that reveal a certain substring, will spin of many sub_table, depending on how many substrings you choose.
  // states = [{dictionary of states to reveal for substring1}, {dictionary of states to reveal for substring2}, ...]
  console.log("latest: ", states[0]);
  let writeStream;
  for (let i = 0; i < states.length; i++) {
    writeStream = fs.createWriteStream("table_sub_" + i + ".txt");
    // hardcode max substring len, min position of substring, max position of substring
    writeStream.write(30 + "\n" + 0 + "\n" + 100 + "\n");
    for (const state in states[i]) {
      for (const nextState of states[i][state]) {
        writeStream.write(state + " " + nextState + "\n");
      }
    }
    writeStream.end();
  }
}

const regex = "M(1|2|3|4|5)*(a|v|d|u)*t";
const text = "accttsdM1aatasdfu]kktjjllM1233vdt[tM155aaatad]sfl;jasd;flkM15adt";

console.log("OG regex: ", regex);
const simp_graph = gen.simplifyGraph(regex);
console.log("simp graph: ", simp_graph);
generateTableAll(simp_graph);
const [substrings, indexes] = gen.findSubstrings(simp_graph, text);
console.log("text: ", text);
console.log("match_substring: ", substrings);
console.log("match_index: ", indexes);
console.log("\n  ");

// Highlight substring in any regex we matched
const substring = [37, 41];
console.log("select substring: ", substring);

// Given DFA
const states_fromSubstring = gen.matchDFAfromSub(
  simp_graph,
  indexes,
  substring
);
console.log("DFA state from substring: ", states_fromSubstring);
generateTableSub([states_fromSubstring]);

console.log(
  "index of ALL substrings from DFA states: ",
  gen.matchSubfromDFA(simp_graph, text, indexes, states_fromSubstring)
);
