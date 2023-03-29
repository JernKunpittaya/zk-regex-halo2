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

let regex = "a(1|3|4)*d";
generateTableAll(regex);
