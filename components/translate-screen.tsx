"use client";

import { useState, useCallback, useEffect } from "react";
import { useEdgesState, useNodesState } from "reactflow";
import "reactflow/dist/style.css";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeftRight } from "lucide-react";
import GrammerSyntaxTree from "./grammerTree";
import GlossSyntaxTree from "./signTree";
import { toast } from "sonner";
import {
  timeGlossEdges,
  timeGlossNodes,
  timeGrammerEdges,
  timeGrammerNodes,
} from "@/lib/examples";
import { GrammarNode } from "./grammerTree/type";
import { GlossNode } from "./signTree/type";

export default function TranslationScreen() {
  const [inputText, setInputText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isReversed, setIsReversed] = useState(false);
  const [grammerNodes, setGrammerNodes, onGrammerNodesChange] =
    useNodesState(timeGrammerNodes);
  const [grammerEdges, setGrammerEdges, onGrammerEdgesChange] =
    useEdgesState(timeGrammerEdges);
  const [signNodes, setSignNodes, onGlossNodesChange] =
    useNodesState(timeGlossNodes);
  const [signEdges, setSignEdges, onGlossEdgesChange] =
    useEdgesState(timeGlossEdges);
  const [loading, setLoading] = useState(false);

  const [grammerLayouted, setGrammerLayouted] = useState(false);
  const [signLayouted, setSignLayouted] = useState(false);

  const handleTranslate = useCallback(async () => {
    if (!inputText) {
      toast.error("Please enter text to translate");
      return;
    }
    setLoading(true);
    const toastLoading = toast.loading("Translating...");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, reversed: isReversed }),
        cache: "no-cache",
      });
      if (!response.ok) throw new Error("Translation failed");
      const data = await response.json();
      setTranslatedText(data.translatedText);
      setGrammerNodes([...data.grammerNodes]);
      setGrammerEdges([...data.grammerEdges]);
      setSignNodes([...data.signNodes]);
      setSignEdges([...data.signEdges]);
      setLoading(false);

      console.log(signNodes);
    } catch (error) {
      console.error(error);
      alert("Error during translation");
    } finally {
      toast.dismiss(toastLoading);
    }
  }, [
    inputText,
    isReversed,
    setGrammerEdges,
    setGrammerNodes,
    setSignEdges,
    setSignNodes,
    signNodes,
  ]);

  const handleSwitch = useCallback(() => {
    setIsReversed(!isReversed);
    setInputText(translatedText);
    setTranslatedText(inputText);
  }, [isReversed, inputText, translatedText]);

  useEffect(() => {
    if (!loading && signLayouted && grammerLayouted) {
      setSignLayouted(false);
      setGrammerLayouted(false);
    }
  }, [grammerLayouted, loading, signLayouted]);

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
            <GrammerSyntaxTree
              nodes={grammerNodes as GrammarNode[]}
              edges={grammerEdges || []}
              setNodes={setGrammerNodes}
              setEdges={setGrammerEdges}
              onNodesChange={onGrammerNodesChange}
              onEdgesChange={onGrammerEdgesChange}
              setLayoutApplied={setGrammerLayouted}
              layoutApplied={grammerLayouted}
            />
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
            {/* <ReactFlow nodes={nodesTranslated} edges={edgesTranslated} fitView>
              <Background />
              <Controls />
            </ReactFlow> */}
            <GlossSyntaxTree
              nodes={signNodes as GlossNode[]}
              edges={signEdges}
              setNodes={setSignNodes}
              setEdges={setSignEdges}
              onNodesChange={onGlossNodesChange}
              onEdgesChange={onGlossEdgesChange}
              setLayoutApplied={setSignLayouted}
              layoutApplied={signLayouted}
            />
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
