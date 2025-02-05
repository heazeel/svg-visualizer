import * as t from "@babel/types";

export interface SvgCode {
  path: {
    realPath: string;
    rootPath: string;
  };
  range: t.SourceLocation;
  code: string;
}
