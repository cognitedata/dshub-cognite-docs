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
  // I wanted to use a static counter to auto-rank (their order in the launcher) the CogniteDocFrames
  // by the order of when they are linked to the launcher. Probably a bad idea,
  // as it just adds complexity without much gain. Should just set these manually.
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

    // We can selectively allow some Sandbox-exceptions. All restrictions are applied by default.
    this.sandbox = ['allow-same-origin', 'allow-scripts'];
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

  // Create one widget for each doc-page we wish to have available in the launcher.
  const pythonDocsWidget = new MainAreaWidget({ content: pythonDocs });
  const APIDocsWidget = new MainAreaWidget({ content: APIDocs });

  // Create, add, and link the respective commands for opening the doc-widget.
  addDocCommandToPalette(app, pythonDocsWidget, commandPalette);
  addDocCommandToPalette(app, APIDocsWidget, commandPalette);

  // Add the widgets to the launcher. The rank tells us in which order items are
  // displayed. Launcher items under the same category are grouped together.
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
 * Entrypoint for the JupyterExtension. For devs, I recommend you start here.
 * This function is responsible for requesting additional functionality (using the requires keyword),
 * and when the extension is activated, it calls the 'activate'-function. If auto-start is enabled, it
 * automatically activates on page-load.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'cognite-functions',
  autoStart: true,
  requires: [ICommandPalette, ILauncher],
  activate: activateCogniteDocumentationButtons
};

export default extension;
