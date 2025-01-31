// Previous type definitions remain the same
export type SentenceLevel = "sentence";

export type ClauseLevel =
  | "clause"
  | "independentClause"
  | "dependentClause"
  | "relativeClause"
  | "subordinateClause";

export type PhraseLevel =
  | "phrase"
  | "nounPhrase"
  | "verbPhrase"
  | "adjectivePhrase"
  | "adverbPhrase"
  | "prepPhrase"
  | "gerundPhrase"
  | "infinitivePhrase"
  | "participlePhrase";

export type WordLevel =
  | "word"
  | "noun"
  | "pronoun"
  | "verb"
  | "auxiliaryVerb"
  | "modalVerb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "coordinatingConjunction"
  | "subordinatingConjunction"
  | "correlativeConjunction"
  | "determiner"
  | "interjection"
  | "particle";

export type NodeType = SentenceLevel | ClauseLevel | PhraseLevel | WordLevel;

export interface GrammarNode {
  id: string;
  type: NodeType;
  data: {
    label: string;
    fullForm?: string;
    isWord?: boolean;
  };
  position: {
    x: number;
    y: number;
  };
}
