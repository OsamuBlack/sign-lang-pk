import { GrammarNode } from "@/components/grammerTree/type";
import { GlossNode } from "@/components/signTree/type";
import { Edge } from "reactflow";

export const timeGrammerNodes: GrammarNode[] = [
  {
    id: "1",
    type: "sentence",
    data: { label: "S", fullForm: "Sentence" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "nounPhrase",
    data: { label: "NP", fullForm: "Noun Phrase" },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    type: "verbPhrase",
    data: { label: "VP", fullForm: "Verb Phrase" },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "noun",
    data: { label: "Time", isWord: true },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "verb",
    data: { label: "flies", isWord: true },
    position: { x: 0, y: 0 },
  },
  {
    id: "6",
    type: "prepPhrase",
    data: { label: "PP", fullForm: "Prepositional Phrase" },
    position: { x: 0, y: 0 },
  },
  {
    id: "7",
    type: "preposition",
    data: { label: "like", isWord: true },
    position: { x: 0, y: 0 },
  },
  {
    id: "8",
    type: "nounPhrase",
    data: { label: "NP", fullForm: "Noun Phrase" },
    position: { x: 0, y: 0 },
  },
  {
    id: "9",
    type: "determiner",
    data: { label: "an", isWord: true },
    position: { x: 0, y: 0 },
  },
  {
    id: "10",
    type: "noun",
    data: { label: "arrow", isWord: true },
    position: { x: 0, y: 0 },
  },
];

export const timeGrammerEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-3", source: "1", target: "3" },
  { id: "e2-4", source: "2", target: "4" },
  { id: "e3-5", source: "3", target: "5" },
  { id: "e3-6", source: "3", target: "6" },
  { id: "e6-7", source: "6", target: "7" },
  { id: "e6-8", source: "6", target: "8" },
  { id: "e8-9", source: "8", target: "9" },
  { id: "e8-10", source: "8", target: "10" },
];

export const timeGlossNodes: GlossNode[] = [
  {
    id: "1",
    type: "signedSentence",
    data: { label: "S", fullForm: "Signed Sentence" },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "topicPhrase",
    data: { label: "TOP", fullForm: "Topic Phrase" },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    type: "topic",
    data: { label: "TIME", isManual: true },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "commentPhrase",
    data: { label: "COMMENT", fullForm: "Comment Phrase" },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "verb",
    data: { label: "FLY", isManual: true },
    position: { x: 0, y: 0 },
  },
  {
    id: "6",
    type: "noun",
    data: { label: "SAME-ARROW", isManual: true },
    position: { x: 0, y: 0 },
  },
];

export const timeGlossEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e1-4", source: "1", target: "4" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e4-5", source: "4", target: "5" },
  { id: "e4-6", source: "4", target: "6" },
];
