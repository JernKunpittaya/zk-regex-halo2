const fs = require("fs");
const path = require("path");
const regexpTree = require("regexp-tree");
const assert = require("assert");
const lexical = require("./lexical");

const a2z = "a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z";
const A2Z = "A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z";
const r0to9 = "0|1|2|3|4|5|6|7|8|9";
const alphanum = `${a2z}|${A2Z}|${r0to9}`;

const key_chars = `(${a2z})`;
const catch_all =
  "(0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|!|\"|#|$|%|&|'|\\(|\\)|\\*|\\+|,|-|.|/|:|;|<|=|>|\\?|@|[|\\\\|]|^|_|`|{|\\||}|~| |\t|\n|\r|\x0b|\x0c)";
const catch_all_without_semicolon =
  "(0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|!|\"|#|$|%|&|'|\\(|\\)|\\*|\\+|,|-|.|/|:|<|=|>|\\?|@|[|\\\\|]|^|_|`|{|\\||}|~| |\t|\n|\r|\x0b|\x0c)";

const email_chars = `${alphanum}|_|.|-`;
const base_64 = `(${alphanum}|\\+|/|=)`;
const word_char = `(${alphanum}|_)`;
const a2z_nosep = "abcdefghijklmnopqrstuvwxyz";
const A2Z_nosep = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const r0to9_nosep = "0123456789";

// let to_from_regex_old = '(\r\n|\x80)(to|from):([A-Za-z0-9 _."@-]+<)?[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.]+>?\r\n';
// let regex = `\r\ndkim-signature:(${key_chars}=${catch_all_without_semicolon}+; )+bh=${base_64}+; `;
// let sig_regex = `${catch_all_without_semicolon}\r\ndkim-signature:(${key_chars}=${catch_all_without_semicolon}+; )+bh=${base_64}+; `;
// let order_invariant_regex_raw = `((\\n|\x80|^)(((from):([A-Za-z0-9 _."@-]+<)?[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.]+>)?|(subject:[a-zA-Z 0-9]+)?|((to):([A-Za-z0-9 _."@-]+<)?[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.]+>)?|(dkim-signature:((a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)=(0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|!|"|#|$|%|&|\'|\\(|\\)|\\*|\\+|,|-|.|/|:|<|=|>|\\?|@|[|\\\\|]|^|_|`|{|\\||}|~| |\t|\n|\r|\x0B|\f)+; ))?)(\\r))+` // Uses a-z syntax instead of | for each char

// let old_regex = '(\r\n|\x80)(to|from):([A-Za-z0-9 _."@-]+<)?[a-zA-Z0-9_.-]+@[a-zA-Z0-9_.]+>?\r\n';
// let regex = '(\r\n|\x80)(to|from):((a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9| |_|.|"|@|-)+<)?(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|_|.|-)+@(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|_|.|-)+>?\r\n';
// let regex = `\r\ndkim-signature:(${key_chars}=${catch_all_without_semicolon}+; )+bh=${base_64}+; `;
// 'dkim-signature:((a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z)=(0|1|2|3|4|5|6|7|8|9|a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|!|"|#|$|%|&|\'|\\(|\\)|\\*|\\+|,|-|.|/|:|<|=|>|\\?|@|[|\\\\|]|^|_|`|{|\\||}|~| |\t|\n|\r|\x0B|\f)+; )+bh=(a|b|c|d|e|f|g|h|i|j|k|l|m|n|o|p|q|r|s|t|u|v|w|x|y|z|A|B|C|D|E|F|G|H|I|J|K|L|M|N|O|P|Q|R|S|T|U|V|W|X|Y|Z|0|1|2|3|4|5|6|7|8|9|\\+|/|=)+; '
// let regex = STRING_PRESELECTOR + `${word_char}+`;
// let regex = 'hello(0|1|2|3|4|5|6|7|8|9)+world';
// console.log(regex);
// console.log(Buffer.from(regex).toString('base64'));

// Note that this is not complete and very case specific i.e. can only handle a-z and not a-c.
function regexToMinDFASpec(str) {
  // Replace all A-Z with A2Z etc
  let combined_nosep = str
    .replaceAll("A-Z", A2Z_nosep)
    .replaceAll("a-z", a2z_nosep)
    .replaceAll("0-9", r0to9_nosep)
    .replaceAll("\\w", A2Z_nosep + r0to9_nosep + a2z_nosep);

  function addPipeInsideBrackets(str) {
    let result = "";
    let insideBrackets = false;
    let index = 0;
    let currChar;
    while (true) {
      currChar = str[index];
      if (index >= str.length) {
        break;
      }
      if (currChar === "[") {
        result += "(";
        insideBrackets = true;
        index++;
        continue;
      } else if (currChar === "]") {
        currChar = insideBrackets ? ")" : currChar;
        insideBrackets = false;
      }
      if (currChar === "\\") {
        index++;
        currChar = str[index];
      }
      result += insideBrackets ? "|" + currChar : currChar;
      index++;
    }
    return result.replaceAll("(|", "(");
  }

  return addPipeInsideBrackets(combined_nosep);
}

function toNature(col) {
  var i,
    j,
    base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    result = 0;
  if ("1" <= col[0] && col[0] <= "9") {
    result = parseInt(col, 10);
  } else {
    for (i = 0, j = col.length - 1; i < col.length; i += 1, j -= 1) {
      result += Math.pow(base.length, j) * (base.indexOf(col[i]) + 1);
    }
  }
  return result;
}

// input: regex, output: its minimal DFA
function compile(regex) {
  let nfa = lexical.regexToNfa(regex);
  let dfa = lexical.minDfa(lexical.nfaToDfa(nfa));

  var i,
    j,
    states = {},
    nodes = [],
    stack = [dfa],
    symbols = [],
    top;

  while (stack.length > 0) {
    top = stack.pop();
    if (!states.hasOwnProperty(top.id)) {
      states[top.id] = top;
      top.nature = toNature(top.id);
      nodes.push(top);
      for (i = 0; i < top.edges.length; i += 1) {
        if (top.edges[i][0] !== "ϵ" && symbols.indexOf(top.edges[i][0]) < 0) {
          symbols.push(top.edges[i][0]);
        }
        stack.push(top.edges[i][1]);
      }
    }
  }
  nodes.sort(function (a, b) {
    return a.nature - b.nature;
  });
  symbols.sort();

  let graph = [];
  for (let i = 0; i < nodes.length; i += 1) {
    let curr = {};
    curr.type = nodes[i].type;
    curr.edges = {};
    for (let j = 0; j < symbols.length; j += 1) {
      if (nodes[i].trans.hasOwnProperty(symbols[j])) {
        curr.edges[symbols[j]] = nodes[i].trans[symbols[j]].nature - 1;
      }
    }
    graph[nodes[i].nature - 1] = curr;
  }
  //   console.log("lexical out: ", JSON.stringify(graph));
  return graph;
}

function simplifyGraph(regex) {
  const regex_spec = regexToMinDFASpec(regex);
  // console.log("before: ", regex);
  // console.log("after: ", regex_spec);
  console.log("simple regex: ", regex_spec);
  const ast = regexpTree.parse(`/${regex_spec}/`);
  regexpTree.traverse(ast, {
    "*": function ({ node }) {
      if (node.type === "CharacterClass") {
        throw new Error("CharacterClass not supported");
      }
    },
  });

  const graph_json = compile(regex_spec);
  const N = graph_json.length;
  states = [];
  alphabets = new Set();
  start_state = "0";
  accepted_states = new Set();
  transitions = {};
  rev_transitions = {};
  or_sets = [];
  for (let i = 0; i < N; i++) {
    states.push(i.toString());
    transitions[i.toString()] = {};
    rev_transitions[i.toString()] = {};
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
          if (!(i in rev_transitions[graph_json[i]["edges"][key].toString()])) {
            rev_transitions[graph_json[i]["edges"][key].toString()][i] = [];
          }
          rev_transitions[graph_json[i]["edges"][key].toString()][i].push(alp);
        }
      }
    }
  }
  let or_stops = new Set();
  // now use transitions to construct or_sets
  for (let state in transitions) {
    let tmp_set = new Set();
    if (Object.keys(transitions[state]).length > 1) {
      tmp_set = new Set();
      for (let alp in transitions[state]) {
        if (transitions[state][alp] != state) {
          tmp_set.add([state, transitions[state][alp]].toString());
        }
      }
    }

    if (tmp_set.size > 1) {
      or_sets.push(tmp_set);
      or_stops.add(state);
    }
  }
  // console.log("or_sets: ", or_sets);
  // deal with or_stops
  for (let state in rev_transitions) {
    let tmp_set = new Set();
    if (Object.keys(rev_transitions[state]).length > 1) {
      tmp_set = new Set();
      for (let prev_state in rev_transitions[state]) {
        if (prev_state != state) {
          tmp_set.add([state, prev_state].toString());
        }
      }
    }

    if (tmp_set.size > 1) {
      or_stops.add(state);
    }
  }

  // console.log("or_stops: ", or_stops);

  let or_sets_all = [];
  // simulate till or_stops
  for (let or_set of or_sets) {
    let or_set_all = new Set();
    let clone_or_set;
    while (or_set.size > 0) {
      clone_or_set = new Set();
      for (let ele of or_set) {
        or_set_all.add(ele);
        let next_state = ele.split(",")[1];
        if (!or_stops.has(next_state)) {
          for (let alp in transitions[next_state]) {
            if (
              !or_set_all.has(
                [next_state, transitions[next_state][alp]].toString()
              )
            ) {
              clone_or_set.add(
                [next_state, transitions[next_state][alp]].toString()
              );
            }
          }
        }
      }
      or_set = new Set(clone_or_set);
    }

    or_sets_all.push(or_set_all);
  }
  // console.log("transition: ", transitions);
  // console.log("rev: ", rev_transitions);

  return {
    states: states,
    alphabets: alphabets,
    start_state: start_state,
    accepted_states: accepted_states,
    transitions: transitions,
    or_sets: or_sets_all,
  };
}

// Define a function to check whether a string is accepted by the finite automata
function accepts(simp_graph, str) {
  let state = simp_graph["start_state"];
  for (let i = 0; i < str.length; i++) {
    const symbol = str[i];
    if (simp_graph["transitions"][state][symbol]) {
      state = simp_graph["transitions"][state][symbol];
    } else {
      return false;
    }
  }
  return simp_graph["accepted_states"].has(state);
}

// Define a function to find all substrings of a long text that are accepted by the finite automata
function findSubstrings(simp_graph, text) {
  const substrings = [];
  const indexes = [];
  for (let i = 0; i < text.length; i++) {
    for (let j = i + 1; j <= text.length; j++) {
      const substring = text.slice(i, j);
      if (accepts(simp_graph, substring)) {
        substrings.push(substring);
        indexes.push([i, j]);
      }
    }
  }
  // indexes is not inclusive at the end
  return [substrings, indexes];
}
// match from DFA to text
function matchSubfromDFA(simp_graph, text, indexes, states) {
  //states is {1:{"2"},3:{"3","4"},4:{"6"}}
  // indexes is like [ [ 3, 10 ], [ 18, 20 ], [ 20, 30 ], [ 44, 48 ] ]
  // let myset = new Set();
  // myset.add("5");
  // console.log("statesss: ", JSON.parse(JSON.stringify({ 1: myset, 5: ["6"] })));
  let reveal_all = [];
  let reveal_index;
  for (let i = 0; i < indexes.length; i++) {
    let state = simp_graph["start_state"];
    reveal_index = [];
    for (let j = indexes[i][0]; j < indexes[i][1]; j++) {
      next_state = simp_graph["transitions"][state][text[j]];
      if (states[state] && states[state].has(next_state)) {
        reveal_index.push(j);
      }
      state = next_state;
    }
    reveal_all.push(reveal_index);
  }
  // return the reveal position of substring extraction.
  return reveal_all;
}

// match from text to DFA. Flow can be one substring --> state --> to all substrings
// this function support only one continuous substring
function matchDFAfromSub(simp_graph, indexes, sub_index, text) {
  // sub_index = [i, j] non inclusive
  // indexes = sth like [ [ 3, 10 ], [ 18, 20 ], [ 20, 30 ], [ 44, 48 ] ]
  // find which indexes our sub_index belongs to
  let index;
  for (let i = 0; i < indexes.length; i++) {
    if (indexes[i][0] <= sub_index[0] && indexes[i][1] >= sub_index[1]) {
      index = [indexes[i][0], indexes[i][1]];
      break;
    }
  }
  //   const index =
  //states is {1:{"2"},3:{"3","4"},4:{"6"}}
  let states = {};
  let state = simp_graph["start_state"];
  for (let i = index[0]; i < index[1]; i++) {
    const symbol = text[i];
    next_state = simp_graph["transitions"][state][symbol];
    if (i >= sub_index[0] && i < sub_index[1]) {
      if (!(state in states)) {
        let tmp_set = new Set();
        tmp_set.add(next_state.toString());
        states[state] = tmp_set;
      }
      states[state].add(next_state.toString());
    }
    state = next_state;
  }
  // return the reveal position of substring extraction.
  // console.log("states");
  // check with the or_sets first!
  // console.log("og states", states);
  let final_states = {};
  for (const state in states) {
    for (const next_state of states[state]) {
      if (!(state in final_states)) {
        final_states[state] = new Set();
      }
      final_states[state].add(next_state);
      for (const or_set in simp_graph["or_sets"]) {
        if (simp_graph["or_sets"][or_set].has([state, next_state].toString())) {
          for (const ele of simp_graph["or_sets"][or_set]) {
            if (!(ele.split(",")[0] in final_states)) {
              final_states[ele.split(",")[0]] = new Set();
            }
            final_states[ele.split(",")[0]].add(ele.split(",")[1]);
          }
          break;
        }
      }
    }
  }
  return final_states;
}

function indexToText(text, index_array) {
  //indexes = [
  //   [ 8, 9, 10, 11, 12, 13 ],
  //   [ 45, 46, 48 ],
  //   [ 62, 63, 64, 65, 66, 67 ]
  // ]
  let result = [];
  for (const indexes of index_array) {
    let sub_result = "";
    for (const index of indexes) {
      sub_result += text[index];
    }
    result.push(sub_result);
  }
  return result;
}

module.exports = {
  simplifyGraph,
  findSubstrings,
  matchDFAfromSub,
  matchSubfromDFA,
};

// TEST

const regex = "send ($)?[0-9]+(.[0-9]+)? (usdc|dai|eth) ";
const text_test =
  "i send 54.3 eth to you but 6 daid back send 7.89 dai , send $43.1 eth ";

// const regex = " [a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+.[a-zA-Z0-9]+ ";
// const regex = ' [a-z"]+';
// const text = 'asdfa sa_fs-"d%s@gmail.com asdfas';

console.log("OG regex: ", regex);
const simp_graph = simplifyGraph(regex);
console.log("simp graph: ", simp_graph);
const [substrings, indexes] = findSubstrings(simp_graph, text_test);
console.log("text: ", text_test);
console.log("match_substring: ", substrings);
console.log("match_index: ", indexes);
console.log("\n  ");

// Highlight substring in any regex we matched
const substring = [7, 14];
console.log("select substring: ", substring);

// // Given DFA
const states_fromSubstring = matchDFAfromSub(
  simp_graph,
  indexes,
  substring,
  text_test
);
console.log("DFA state from substring: ", states_fromSubstring);

console.log(
  "index of ALL substrings from DFA states: ",
  indexToText(
    text_test,
    matchSubfromDFA(simp_graph, text_test, indexes, states_fromSubstring)
  )
);

export default { matchDFAfromSub, matchSubfromDFA };
