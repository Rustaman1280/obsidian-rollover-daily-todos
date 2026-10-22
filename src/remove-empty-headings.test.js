import { expect, test } from "vitest";
import { removeEmptyHeadings } from "./get-todos";

test("preserves an already empty template heading during todo deletion", () => {
  const lines = ["## Notes", "", "## Tasks", "- [ ] a"];
  expect(removeEmptyHeadings(lines, [3])).toStrictEqual(["## Notes", ""]);
});

test("does not clean up any headings when no lines were deleted", () => {
  const lines = ["# Parent", "## Notes", "", "## Tasks", ""];
  expect(removeEmptyHeadings(lines)).toStrictEqual(lines);
});

test("keeps the ancestor of a pre-existing empty child", () => {
  const lines = ["# Parent", "## Notes", "", "## Tasks", "- [ ] a"];
  expect(removeEmptyHeadings(lines, [4])).toStrictEqual([
    "# Parent",
    "## Notes",
    "",
  ]);
});

test("distinguishes repeated heading titles by their original line indices", () => {
  const lines = ["## Notes", "", "## Notes", "- [ ] a"];
  expect(removeEmptyHeadings(lines, [3])).toStrictEqual(["## Notes", ""]);
});

test("deleting only blank lines does not make a heading eligible for cleanup", () => {
  expect(removeEmptyHeadings(["## Notes", "", " "], [1])).toStrictEqual([
    "## Notes",
    " ",
  ]);
});

test.each(["```", "~~~", "````", "  ~~~~"])(
  "does not interpret headings inside a %s code fence",
  (fence) => {
    const lines = [fence + "md", "# example", "- [ ] a", "# other", "", fence];
    expect(removeEmptyHeadings(lines, [2])).toStrictEqual([
      fence + "md",
      "# example",
      "# other",
      "",
      fence,
    ]);
  }
);

test("only a matching fence of sufficient length ends a code block", () => {
  const lines = ["````md", "~~~", "```", "# example", "- [ ] a", "````"];
  expect(removeEmptyHeadings(lines, [4])).toStrictEqual([
    "````md",
    "~~~",
    "```",
    "# example",
    "````",
  ]);
});

test("resumes real heading cleanup after a code fence closes", () => {
  const lines = ["```", "# code", "```", "## Tasks", "- [ ] a"];
  expect(removeEmptyHeadings(lines, [4])).toStrictEqual([
    "```",
    "# code",
    "```",
  ]);
});

test("does not mutate the original note or the deletion indices", () => {
  const lines = Object.freeze(["## Tasks", "- [ ] a"]);
  const removed = Object.freeze([1]);
  expect(removeEmptyHeadings(lines, removed)).toStrictEqual([]);
  expect(lines).toStrictEqual(["## Tasks", "- [ ] a"]);
  expect(removed).toStrictEqual([1]);
});
