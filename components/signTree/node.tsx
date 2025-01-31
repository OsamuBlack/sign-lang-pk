import { Handle, Position } from "reactflow";

const signNodeColors: Record<string, string> = {
  signedSentence: "bg-emerald-500",
  topicPhrase: "bg-purple-500",
  commentPhrase: "bg-blue-500",
  topic: "bg-purple-500",
  comment: "bg-blue-500",
  verb: "bg-indigo-500",
  noun: "bg-red-500",
  comparison: "bg-amber-500",
  classifier: "bg-gray-500",
  word: "bg-gray-500",
};

export function CustomNode({
  data,
  type,
  hideFullForm,
}: {
  data: {
    label: string;
    fullForm?: string;
    isManual?: boolean; // True for gloss words (manual signs)
  };
  type: string;
  hideFullForm?: boolean;
}) {

  return (
    <div className="relative">
      {type === "signedSentence" ? null : (
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
      )}
      <div
        className={`px-4 py-2 rounded-lg border-2 shadow-lg transition-transform hover:scale-105
          ${
            data.isManual
              ? "bg-white border-gray-300 text-gray-900" // Gloss words in white
              : `${
                  signNodeColors[type] || "bg-gray-500"
                } text-white border-transparent`
          }`}
      >
        <div className="text-sm font-medium">
          {data.isManual || hideFullForm ? data.label : data.fullForm}
        </div>
      </div>
      {data.isManual ? null : (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      )}
    </div>
  );
}
