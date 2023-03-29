const fs = require("fs");
const path = require("path");
const regexpTree = require("regexp-tree");
const assert = require("assert");
const lexical = require("./lexical");

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

let regex = "M(1|2|3|4|5)*(a|v|d|u)*t";
generateTableAll(regex);
generateTableSub(regex, [
  {
    min: 1,
    max: 5,
    trans: [[1, 1]],
  },
  { min: 2, max: 4, trans: [[2, 2]] },
]);
