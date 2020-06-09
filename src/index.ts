import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { IFrame, ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';

/**
 * An IFrame subclass that bundles all info pertaining to Cognite Docs.
 */
class CogniteDocFrame extends IFrame {
  static rank = 0;

  public readonly _category: string;
  public readonly _commandId: string;
  public readonly rank: number;

  get category(): string {
    return this._category;
  }

  get commandId(): string {
    return this._commandId;
  }

  constructor(title: string, url: string, commandId: string) {
    super();

    this._category = 'CDF // Documentation';
    this.title.label = title;
    this.title.closable = true;
    this._commandId = commandId;
    this.url = url;
    this.rank = CogniteDocFrame.rank;
    CogniteDocFrame.rank += 1;
  }
}

/**
 * Given a CogniteDocFrame widget, creates and registers the corresponding command with the
 * app, and adds it to the commandPalette.
 * @param app Main Jupyter application.
 * @param widget the CogniteDocFrame in question.
 * @param commandPalette a reference to the commandPalette.
 */
function addDocCommandToPalette(
  app: JupyterFrontEnd<JupyterFrontEnd.IShell>,
  widget: MainAreaWidget<CogniteDocFrame>,
  commandPalette: ICommandPalette
): void {
  const commandId = widget.content.commandId;
  const title = widget.content.title.label;
  app.commands.addCommand(commandId, {
    label: title,
    execute: () => {
      if (!widget.isAttached) {
        // Attach the widget to the main work area if it's not there
        app.shell.add(widget, 'main');
      }
      // Activate the widget
      app.shell.activateById(widget.id);
    }
  });
  commandPalette.addItem({
    command: commandId,
    category: widget.content.category
  });
}

/**
 * The function that executes when the extension loads. Creates
 * a CogniteDocFrame for the PythonSDK and the API, calls `addDocCommandToPalette`,
 * and attaches the commands to the launcher.
 *
 * @param app main Jupyter application
 * @param commandPalette a reference to the commandPalette
 * @param launcher a reference to the jupyter launcher.
 */
function activateCogniteDocumentationButtons(
  app: JupyterFrontEnd,
  commandPalette: ICommandPalette,
  launcher: ILauncher
): void {
  const pythonDocs = new CogniteDocFrame(
    'Cognite Python SDK',
    'https://cognite-sdk-python.readthedocs-hosted.com/en/latest/',
    'cognite:open_python_docs'
  );

  const APIDocs = new CogniteDocFrame(
    'Cognite API',
    'https://docs.cognite.com/api/v1/',
    'cognite:open_api_docs'
  );

  const pythonDocsWidget = new MainAreaWidget({ content: pythonDocs });
  const APIDocsWidget = new MainAreaWidget({ content: APIDocs });

  addDocCommandToPalette(app, pythonDocsWidget, commandPalette);
  addDocCommandToPalette(app, APIDocsWidget, commandPalette);

  launcher.add({
    command: pythonDocs.commandId,
    category: pythonDocs.category,
    rank: pythonDocs.rank
  });

  launcher.add({
    command: APIDocs.commandId,
    category: APIDocs.category,
    rank: APIDocs.rank
  });
}

/**
 * Initialization data for the cognite-functions extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'cognite-functions',
  autoStart: true,
  requires: [ICommandPalette, ILauncher],
  activate: activateCogniteDocumentationButtons
};

export default extension;
