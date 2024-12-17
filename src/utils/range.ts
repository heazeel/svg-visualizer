import { Position, Range } from "vscode";
import * as t from "@babel/types";

class RangeTools {
  public static createRange(
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
}

export default RangeTools;
