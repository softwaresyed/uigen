import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge } from "../ToolInvocationBadge";
import type { ToolInvocationUIPart } from "@ai-sdk/ui-utils";

afterEach(() => {
  cleanup();
});

function makeTool(
  toolName: string,
  args: Record<string, string>,
  state: "call" | "result" | "partial-call" = "call"
): ToolInvocationUIPart["toolInvocation"] {
  if (state === "result") {
    return { toolCallId: "id", toolName, args, state, result: "ok" };
  }
  return { toolCallId: "id", toolName, args, state } as ToolInvocationUIPart["toolInvocation"];
}

test("str_replace_editor create — loading shows Creating", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(screen.getByText("Creating /App.jsx")).toBeDefined();
});

test("str_replace_editor create — result shows Created", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")} />);
  expect(screen.getByText("Created /App.jsx")).toBeDefined();
});

test("str_replace_editor str_replace — loading shows Editing", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "str_replace", path: "/Card.jsx" })} />);
  expect(screen.getByText("Editing /Card.jsx")).toBeDefined();
});

test("str_replace_editor str_replace — result shows Edited", () => {
  render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "str_replace", path: "/Card.jsx" }, "result")} />);
  expect(screen.getByText("Edited /Card.jsx")).toBeDefined();
});

test("file_manager rename — loading shows Renaming", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "rename", path: "/old.jsx" })} />);
  expect(screen.getByText("Renaming /old.jsx")).toBeDefined();
});

test("file_manager rename — result shows Renamed", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "rename", path: "/old.jsx" }, "result")} />);
  expect(screen.getByText("Renamed /old.jsx")).toBeDefined();
});

test("file_manager delete — result shows Deleted", () => {
  render(<ToolInvocationBadge tool={makeTool("file_manager", { command: "delete", path: "/App.jsx" }, "result")} />);
  expect(screen.getByText("Deleted /App.jsx")).toBeDefined();
});

test("shows spinner when loading", () => {
  const { container } = render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" })} />);
  expect(container.querySelector(".animate-spin")).toBeDefined();
  expect(container.querySelector(".bg-emerald-500")).toBeNull();
});

test("shows green dot when done", () => {
  const { container } = render(<ToolInvocationBadge tool={makeTool("str_replace_editor", { command: "create", path: "/App.jsx" }, "result")} />);
  expect(container.querySelector(".bg-emerald-500")).toBeDefined();
  expect(container.querySelector(".animate-spin")).toBeNull();
});

test("unknown tool falls back to raw tool name", () => {
  render(<ToolInvocationBadge tool={makeTool("some_unknown_tool", {})} />);
  expect(screen.getByText("some_unknown_tool")).toBeDefined();
});
