"use client";

import { useState, useCallback } from "react";
import ReactFlow, { Controls, Background, Edge } from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight } from "lucide-react";
import GrammerSyntaxTree from "./tree/tree";
import { GrammarNode } from "./tree/type";

const colors = {
  noun: "#f94144",
  verb: "#43aa8b",
  nounPhrase: "#f3722c",
  verbPhrase: "#90be6d",
  sentence: "#f9c74f",
};

// const nodes = [
//   {
//     id: "1",
//     position: { x: 100, y: 0 },
//     data: { label: "Sentence" },
//     style: { backgroundColor: colors.sentence },
//   },
//   {
//     id: "2",
//     position: { x: 0, y: 100 },
//     data: { label: "Noun Phrase" },
//     style: { backgroundColor: colors.nounPhrase },
//   },
//   {
//     id: "3",
//     position: { x: 0, y: 200 },
//     data: { label: "Noun" },
//     style: { backgroundColor: colors.noun },
//   },
//   {
//     id: "3a",
//     position: { x: 0, y: 300 },
//     data: { label: "I" },
//   },
//   {
//     id: "4",
//     position: { x: 200, y: 100 },
//     data: { label: "Verb Phrase" },
//     style: { backgroundColor: colors.verbPhrase },
//   },
//   {
//     id: "5",
//     position: { x: 200, y: 200 },
//     data: { label: "Verb" },
//     style: { backgroundColor: colors.verb },
//   },
//   {
//     id: "5a",
//     position: { x: 200, y: 300 },
//     data: { label: "like" },
//   },
//   {
//     id: "6",
//     position: { x: 400, y: 200 },
//     data: { label: "Noun Phrase" },
//     style: { backgroundColor: colors.nounPhrase },
//   },
//   {
//     id: "7",
//     position: { x: 400, y: 300 },
//     data: { label: "Noun" },
//     style: { backgroundColor: colors.noun },
//   },
//   {
//     id: "8",
//     position: { x: 400, y: 400 },
//     data: { label: "Icecream" },
//   },
// ];

// const edges = [
//   { id: "e1-2", source: "1", target: "2" },
//   { id: "e2-3", source: "2", target: "3" },
//   { id: "e3-3a", source: "3", target: "3a" },
//   { id: "e1-4", source: "1", target: "4" },
//   { id: "e4-5", source: "4", target: "5" },
//   { id: "e5-5a", source: "5", target: "5a" },
//   { id: "e4-6", source: "4", target: "6" },
//   { id: "e6-7", source: "6", target: "7" },
//   { id: "e7-8", source: "7", target: "8" },
// ];

const nodes: GrammarNode[] = [
  {
    id: "1",
    type: "sentence",
    data: {
      label: "S",
      fullForm: "Sentence",
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "2",
    type: "nounPhrase",
    data: {
      label: "NP",
      fullForm: "Noun Phrase",
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "3",
    type: "verbPhrase",
    data: {
      label: "VP",
      fullForm: "Verb Phrase",
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "4",
    type: "noun",
    data: {
      label: "Time",
      isWord: true,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "5",
    type: "verb",
    data: {
      label: "flies",
      isWord: true,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "6",
    type: "prepPhrase",
    data: {
      label: "PP",
      fullForm: "Prepositional Phrase",
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "7",
    type: "preposition",
    data: {
      label: "like",
      isWord: true,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "8",
    type: "nounPhrase",
    data: {
      label: "NP",
      fullForm: "Noun Phrase",
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "9",
    type: "determiner",
    data: {
      label: "an",
      isWord: true,
    },
    position: { x: 0, y: 0 },
  },
  {
    id: "10",
    type: "noun",
    data: {
      label: "arrow",
      isWord: true,
    },
    position: { x: 0, y: 0 },
  },
];

const edges: Edge[] = [
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

const nodesTranslated = [
  {
    id: "1",
    position: { x: 100, y: 0 },
    data: { label: "Sentence" },
    style: { backgroundColor: colors.sentence },
  },
  {
    id: "2",
    position: { x: 0, y: 100 },
    data: { label: "Topic" },
    style: { backgroundColor: colors.nounPhrase },
  },
  {
    id: "3",
    position: { x: 0, y: 200 },
    data: { label: "Noun" },
    style: { backgroundColor: colors.noun },
  },
  {
    id: "3a",
    position: { x: 0, y: 300 },
    data: { label: "Icecream" },
  },
  {
    id: "4",
    position: { x: 200, y: 100 },
    data: { label: "Comment" },
    style: { backgroundColor: colors.verbPhrase },
  },
  {
    id: "5",
    position: { x: 400, y: 200 },
    data: { label: "Verb" },
    style: { backgroundColor: colors.verb },
  },
  {
    id: "5a",
    position: { x: 400, y: 300 },
    data: { label: "like" },
  },
  {
    id: "7",
    position: { x: 200, y: 200 },
    data: { label: "Noun" },
    style: { backgroundColor: colors.noun },
  },
  {
    id: "8",
    position: { x: 200, y: 300 },
    data: { label: "Me" },
  },
  {
    id: "9",
    position: { x: 600, y: 200 },
    data: { label: "Noun" },
    style: { backgroundColor: colors.noun },
  },
  {
    id: "10",
    position: { x: 600, y: 300 },
    data: { label: "Me" },
  },
];

const edgesTranslated = [
  { id: "e1-2", source: "1", target: "2" },
  { id: "e2-3", source: "2", target: "3" },
  { id: "e3-3a", source: "3", target: "3a" },
  { id: "e1-4", source: "1", target: "4" },
  { id: "e4-5", source: "4", target: "5" },
  { id: "e5-5a", source: "5", target: "5a" },
  { id: "4-7", source: "4", target: "7" },
  { id: "7-8", source: "7", target: "8" },
  { id: "4-9", source: "4", target: "9" },
  { id: "9-10", source: "9", target: "10" },
];

export default function TranslationScreen() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isReversed, setIsReversed] = useState(false);

  const handleTranslate = useCallback(() => {
    // This is a placeholder translation function
    // In a real application, you would call your translation API here
    setTranslatedText(inputText.split("").reverse().join(""));
  }, [inputText]);

  const handleSwitch = useCallback(() => {
    setIsReversed(!isReversed);
    setInputText(translatedText);
    setTranslatedText(inputText);
  }, [isReversed, inputText, translatedText]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* <Card>
        <CardContent className="p-4"> */}
      <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between mb-4">
        <h1 className="text-2xl font-bold">Text to Sign Language</h1>
        <Button
          onClick={handleSwitch}
          variant="outline"
          size="sm"
          className="self-start md:self-auto"
        >
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Switch
        </Button>
        <h2 className="text-xl font-semibold">Sign Language to Text</h2>
      </div>
      <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
        <div className="flex-1 space-y-2">
          <label className="font-medium text-sm">
            {isReversed ? "Sign Language" : "Text Input"}
          </label>
          <Textarea
            placeholder={
              isReversed ? "Enter sign language" : "Enter text to translate"
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={8}
            className="resize-none"
          />
          <div className="aspect-video border rounded">
            {/* <ReactFlow nodes={nodes} edges={edges} fitView>
              <Background />
              <Controls />
            </ReactFlow> */}
            <GrammerSyntaxTree initialNodes={nodes} initialEdges={edges} />
          </div>
        </div>
        {/* <div className="hidden md:block w-px self-stretch bg-gray-200"></div> */}
        <div className="flex-1 space-y-2">
          <label className="font-medium text-sm">
            {isReversed ? "Translated Text" : "Sign Language Output"}
          </label>
          <Textarea
            placeholder={
              isReversed ? "Translated text" : "Translated sign language"
            }
            value={translatedText}
            readOnly
            rows={8}
            className="resize-none"
          />
          <div className="aspect-video border rounded">
            <ReactFlow nodes={nodesTranslated} edges={edgesTranslated} fitView>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        </div>
      </div>
      <Button onClick={handleTranslate} className="w-full mt-4">
        Translate
      </Button>
      {/* </CardContent>
      </Card> */}
    </div>
  );
}
