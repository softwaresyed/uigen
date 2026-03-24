import { Loader2 } from "lucide-react";
import type { ToolInvocationUIPart } from "@ai-sdk/ui-utils";

interface Props {
  tool: ToolInvocationUIPart["toolInvocation"];
}

function getLabel(tool: ToolInvocationUIPart["toolInvocation"]): string {
  const done = tool.state === "result";
  const args = tool.args as Record<string, string> | undefined;
  const command = args?.command;
  const path = args?.path ?? args?.old_path ?? "";

  if (tool.toolName === "str_replace_editor") {
    switch (command) {
      case "create":
        return done ? `Created ${path}` : `Creating ${path}`;
      case "str_replace":
      case "insert":
        return done ? `Edited ${path}` : `Editing ${path}`;
      case "view":
        return done ? `Viewed ${path}` : `Viewing ${path}`;
      case "undo_edit":
        return done ? `Undid edit in ${path}` : `Undoing edit in ${path}`;
    }
  }

  if (tool.toolName === "file_manager") {
    switch (command) {
      case "rename":
        return done ? `Renamed ${path}` : `Renaming ${path}`;
      case "delete":
        return done ? `Deleted ${path}` : `Deleting ${path}`;
    }
  }

  return tool.toolName;
}

export function ToolInvocationBadge({ tool }: Props) {
  const done = tool.state === "result";
  const label = getLabel(tool);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{label}</span>
    </div>
  );
}
