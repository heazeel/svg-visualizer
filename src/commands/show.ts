import * as vscode from "vscode";
import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import * as t from "@babel/types";

const disposable = vscode.commands.registerCommand(
  "svg-visualizer.show",
  () => {
    vscode.window.showInformationMessage("Hello World from svg-visualizer!");
  }
);

const containsSVG = (
  code: string
): {
  hasSVG: boolean;
  svgContent: string | null;
} => {
  const ast = parser.parse(code, {
    sourceType: "module",
    plugins: ["jsx"],
  });

  let hasSVG = false;
  let svgContent: string | null = null;

  traverse(ast, {
    JSXElement(path) {
      const el = path.node.openingElement;
      if (t.isJSXIdentifier(el.name) && el.name.name === "svg") {
        hasSVG = true;
        svgContent = path.toString();
        path.stop();
      }
    },
  });

  return { hasSVG, svgContent };
};

const hoverProvider = vscode.languages.registerHoverProvider("*", {
  provideHover(document, position, token) {
    const code = document.getText();
    const { hasSVG, svgContent } = containsSVG(code);

    if (hasSVG && svgContent) {
      const hoverMessage = new vscode.MarkdownString(`
        <div>
          ${svgContent}
        </div>
      `);
      hoverMessage.isTrusted = true;
      return new vscode.Hover(hoverMessage);
    }

    return null;
  },
});

export default hoverProvider;
