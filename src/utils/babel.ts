import { parse, ParseResult } from "@babel/parser";
import generate from "@babel/generator";
import traverse, { NodePath } from "@babel/traverse";
import * as t from "@babel/types";

// 获取svg代码
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

// 将svg中的驼峰属性转换为短横线分隔
export const getConvertedSvgCode = (path: NodePath) => {
  const svgCamelCaseAttributes = new Set([
    "attributeName",
    "attributeType",
    "baseFrequency",
    "baseProfile",
    "calcMode",
    "clipPathUnits",
    "contentScriptType",
    "contentStyleType",
    "diffuseConstant",
    "edgeMode",
    "externalResourcesRequired",
    "filterRes",
    "filterUnits",
    "glyphRef",
    "gradientTransform",
    "gradientUnits",
    "kernelMatrix",
    "kernelUnitLength",
    "keyPoints",
    "keySplines",
    "keyTimes",
    "lengthAdjust",
    "limitingConeAngle",
    "markerHeight",
    "markerUnits",
    "markerWidth",
    "maskContentUnits",
    "maskUnits",
    "numOctaves",
    "pathLength",
    "patternContentUnits",
    "patternTransform",
    "patternUnits",
    "pointsAtX",
    "pointsAtY",
    "pointsAtZ",
    "preserveAlpha",
    "preserveAspectRatio",
    "primitiveUnits",
    "refX",
    "refY",
    "repeatCount",
    "repeatDur",
    "requiredExtensions",
    "requiredFeatures",
    "specularConstant",
    "specularExponent",
    "spreadMethod",
    "startOffset",
    "stdDeviation",
    "stitchTiles",
    "surfaceScale",
    "systemLanguage",
    "tableValues",
    "targetX",
    "targetY",
    "textLength",
    "viewBox",
    "viewTarget",
    "xChannelSelector",
    "yChannelSelector",
    "zoomAndPan",
  ]);

  // 缓存转换后的属性名
  const cache = new Map<string, string>();

  path.traverse({
    JSXAttribute(path) {
      let name = path.node.name;
      let value = path.node.value;

      if (t.isJSXIdentifier(name)) {
        const attributeName = name.name;

        if (t.isJSXExpressionContainer(value)) {
          // 如果属性值是数字，转换为字符串
          if (t.isNumericLiteral(value.expression)) {
            path.replaceWith(
              t.jsxAttribute(
                t.jsxIdentifier(attributeName),
                t.stringLiteral(value.expression.value.toString())
              )
            );
            return;
          }

          // 如果 stroke/fill 属性是变量，赋值为 #fff
          if (attributeName === "stroke" || attributeName === "fill") {
            path.replaceWith(
              t.jsxAttribute(
                t.jsxIdentifier(attributeName),
                t.stringLiteral("#fff")
              )
            );
            return;
          }

          // 如果 strokeWidth/stroke-width 属性是变量，赋值为 1
          if (
            attributeName === "strokeWidth" ||
            attributeName === "stroke-width"
          ) {
            path.replaceWith(
              t.jsxAttribute(
                t.jsxIdentifier("stroke-width"),
                t.stringLiteral("1")
              )
            );
            return;
          }

          // 其他变量属性直接删除
          path.remove();
          return;
        }

        // 将驼峰属性转换为短横线分隔
        if (
          /[a-z][A-Z]/.test(attributeName) &&
          !svgCamelCaseAttributes.has(attributeName)
        ) {
          if (!cache.has(attributeName)) {
            const kebabCaseName = attributeName.replace(
              /([a-z])([A-Z])/g,
              (match, p1, p2) => {
                return p1 + "-" + p2.toLowerCase();
              }
            );
            cache.set(attributeName, kebabCaseName);
          }
          name.name = cache.get(attributeName)!;
        }
      }
    },
    // 删除解构属性
    JSXSpreadAttribute(path) {
      path.remove();
    },
  });

  let { code: convertedSvgContent } = generate(path.node);
  if (convertedSvgContent.endsWith(";")) {
    convertedSvgContent = convertedSvgContent.slice(0, -1);
  }

  return convertedSvgContent;
};
