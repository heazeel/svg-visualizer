import { Position, Range } from "vscode";
import * as t from "@babel/types";

/**
 * 解析后的 loc 初始位置 { line: 1, column: 0, index: 0 }
 * line 是从 1 开始计数，column 和 index 从 0 开始，后续换算需要注意下
 */
export function createRange(
  startLoc: t.SourceLocation,
  endLoc?: t.SourceLocation
) {
  const _endLoc = endLoc || startLoc;

  const startPosition = new Position(
    startLoc.start.line - 1,
    startLoc.start.column
  );
  const endPosition = new Position(_endLoc.end.line - 1, _endLoc.end.column);

  return new Range(startPosition, endPosition);
}
