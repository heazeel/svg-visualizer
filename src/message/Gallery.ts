import * as t from "@babel/types";
import { BaseMsgCenter, Payload } from "./Base";
import RangeTools from "../utils/range";
import EditorTools from "../utils/editor";

export class GalleryMsgCenter extends BaseMsgCenter<any> {
  public messageName = "gallery";

  public handlePayload(
    payload: Payload<{ path: string; range: t.SourceLocation }>
  ) {
    const { method, params } = payload;
    if (method === "openCode") {
      const { path, range } = params;
      const vscodeRange = RangeTools.createRange(range);
      EditorTools.openDocumentAndSelectRange(path, vscodeRange);
    }
  }
}
