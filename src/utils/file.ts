import os from "os";
import path from "path";
import { Uri, workspace, OpenDialogOptions, window, Range } from "vscode";
// import { Schemes } from '../constants';

export class FileTools {
  public static async selectWorkspaceFolder() {
    const options: OpenDialogOptions = {
      canSelectMany: false,
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: "Open",
    };

    const folderUri = await window.showOpenDialog(options);
    if (folderUri && folderUri[0]) {
      workspace.updateWorkspaceFolders(
        0,
        workspace.workspaceFolders?.length || 0,
        {
          uri: folderUri[0],
        }
      );
      return folderUri[0].fsPath;
    }
  }

  public static async writeFile(filePath: string, content: string) {
    let workspaceFolder = workspace.workspaceFolders?.[0]?.uri.fsPath;
    if (!workspaceFolder) {
      workspaceFolder = await this.selectWorkspaceFolder();
    }
    // 此时用户可能仍然不选择工作区
    if (!workspaceFolder) {
      window.showErrorMessage("Not select any folder.");
      return;
    }

    const fileUri = Uri.file(path.join(workspaceFolder, filePath));

    // 写入文件
    try {
      await workspace.fs.writeFile(fileUri, Buffer.from(content));
      const doc = await workspace.openTextDocument(fileUri);
      window.showTextDocument(doc);
    } catch (error) {
      window.showErrorMessage("Write file error.");
    }
  }

  public static async writeTmpFile(
    filePath: string,
    content: string | Uint8Array
  ): Promise<Uri | undefined> {
    const tmpFileUri = Uri.file(
      path.join(os.tmpdir(), "./crow-copilot-temp", filePath)
    );

    try {
      await workspace.fs.writeFile(tmpFileUri, Buffer.from(content));
      return tmpFileUri;
    } catch (err: any) {
      window.showErrorMessage("Cannot create temp file: " + err.message);
    }
  }

  public static async readFile(filePath: string): Promise<string | undefined> {
    if (!filePath) {
      return;
    }

    try {
      const fileUri = Uri.file(filePath);
      const content = await workspace.fs.readFile(fileUri);
      return content.toString();
    } catch (err: any) {
      window.showErrorMessage("Read file error: " + err.message);
    }
  }

  // 清空当前编辑器的内容
  public static async clearFileContent(filePath: string) {
    const fileUri = Uri.file(filePath);
    const document = await workspace.openTextDocument(fileUri);
    const editor = await window.showTextDocument(document);
    const fullRange = new Range(
      document.positionAt(0),
      document.positionAt(document.getText().length)
    );
    await editor.edit((editBuilder) => {
      editBuilder.delete(fullRange);
    });
  }

  // 创建临时文件预览
  public static async createTempFilePreview(filePath: string, content: string) {
    const previewFileUri = await FileTools.writeTmpFile(filePath, content);

    if (previewFileUri) {
      const document = await workspace.openTextDocument(previewFileUri);
      await window.showTextDocument(document);
    }
  }

  // 创建临时文件预览
  // public static async createTempReadOnlyFilePreview(filePath: string, content: string) {
  //   const previewFileUri = await FileHelper.writeTmpFile(filePath, content);

  //   if (previewFileUri) {
  //     const tmpFileUri = Uri.parse(`${Schemes.ReadOnly}:${previewFileUri.fsPath}`);
  //     const document = await workspace.openTextDocument(tmpFileUri);
  //     await window.showTextDocument(document);
  //   }
  // }
}
