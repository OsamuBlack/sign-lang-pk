// Sentence level (full signed thought)
export type SentenceLevel = "signedSentence";

// Clause level (independent/dependent clauses)
export type ClauseLevel =
  | "signedClause"
  | "independentClause"
  | "dependentClause"
  | "conditionalClause"
  | "relativeClause";

// Phrase level (structural groups)
export type PhraseLevel =
  | "signedPhrase"
  | "topicPhrase" // For topic-comment structure
  | "commentPhrase"
  | "nounPhrase"
  | "verbPhrase"
  | "adjectivePhrase"
  | "adverbPhrase"
  | "prepositionalPhrase"
  | "classifierPhrase"; // Used for shape/movement representation

// Word level (individual signs in gloss format)
export type WordLevel =
  | "signedWord"
  | "topic"
  | "comment"
  | "noun"
  | "pronoun"
  | "verb"
  | "adjective"
  | "adverb"
  | "preposition"
  | "conjunction"
  | "determiner"
  | "classifier";

// All node types combined
export type GlossNodeType =
  | SentenceLevel
  | ClauseLevel
  | PhraseLevel
  | WordLevel;

// Sign Language Gloss Node
export interface GlossNode {
  id: string;
  type: GlossNodeType;
  data: {
    label: string; 
    fullForm?: string; 
    isManual?: boolean;
  };
  position: {
    x: number;
    y: number;
  };
}
