import { Handle, Position } from "reactflow";

const nodeColors: Record<string, string> = {
  sentence: "bg-emerald-500",
  nounPhrase: "bg-red-500",
  verbPhrase: "bg-blue-500",
  noun: "bg-red-500",
  verb: "bg-blue-500",
  prepPhrase: "bg-amber-500",
  preposition: "bg-amber-500",
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
    isWord?: boolean;
  };
  type: string;
  hideFullForm?: boolean;
}) {

  console.log(data.label, hideFullForm);
  return (
    <div className="relative">
      {type === "sentence" ? (
        ""
      ) : (
        <Handle type="target" position={Position.Top} className="w-3 h-3" />
      )}
      <div
        className={`px-4 py-2 rounded-lg border-2 shadow-lg transition-transform hover:scale-105
          ${
            data.isWord
              ? "bg-white border-gray-300 text-gray-900"
              : `${
                  nodeColors[type] || "bg-gray-500"
                } text-white border-transparent`
          }`}
      >
        <div className="text-sm font-medium">
          {data.isWord || hideFullForm ? data.label : data.fullForm}
        </div>
      </div>
      {data.isWord ? (
        ""
      ) : (
        <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
      )}{" "}
    </div>
  );
}
