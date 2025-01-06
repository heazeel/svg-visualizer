import { parse, ParseResult } from "@babel/parser";
import generate from "@babel/generator";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

export const getOriginSvgCode = (
  path: NodePath<t.JSXElement>
): NodePath | undefined => {
  const openingEl = path.node.openingElement;
  const closingEl = path.node.closingElement;
  if (
    t.isJSXIdentifier(openingEl.name) &&
    openingEl.name.name === "svg" &&
    t.isJSXIdentifier(closingEl?.name) &&
    closingEl.name.name === "svg" &&
    path.node.loc
  ) {
    return path;
  }
};

export const getConvertedSvgCode = (path: NodePath) => {
  path.traverse({
    JSXAttribute(path) {
      const name = path.node.name;
      if (
        t.isJSXIdentifier(name) &&
        /[a-z][A-Z]/.test(name.name) &&
        name.name !== "viewBox" &&
        name.name !== "gradientUnits"
      ) {
        name.name = name.name.replace(/([a-z])([A-Z])/g, (match, p1, p2) => {
          return p1 + "-" + p2.toLowerCase();
        });
      }
    },
  });

  let { code: convertedSvgContent } = generate(path.node);
  if (convertedSvgContent.endsWith(";")) {
    convertedSvgContent = convertedSvgContent.slice(0, -1);
  }

  return convertedSvgContent;
};
