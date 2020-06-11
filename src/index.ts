import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import {
  ICommandPalette,
  IFrame,
  MainAreaWidget,
  WidgetTracker
} from '@jupyterlab/apputils';
import { ILauncher } from '@jupyterlab/launcher';

interface ICogniteDocFrameOptions {
  title: string;
  url: string;
  commandId: string;
  category?: string | undefined;
  rank?: number | undefined;
}

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

    // The category under which the command will be organized.
    this._category = 'CDF // Documentation';

    // The title.label is the title displayed in the widget tab.
    this.title.label = title;

    // Whether or not you can close the window, we want this to be true.
    this.title.closable = true;

    // Store the ID of the corresponding command.
    this._commandId = commandId;

    // The url of the iFrame content we wish to load. In this case, docs-url.
    this.url = url;

    // Launcher items are ordered by rank.
    this.rank = CogniteDocFrame.rank;
    CogniteDocFrame.rank += 1;

    // We can selectively allow some Sandbox-exceptions. All restrictions are applied by default.
    this.sandbox = ['allow-same-origin', 'allow-scripts'];
  }
}

function initializeDocFrame(
  docFrameOptions: ICogniteDocFrameOptions,
  app: JupyterFrontEnd,
  launcher: ILauncher,
  commandPalette: ICommandPalette,
  restorer: ILayoutRestorer,
  tracker: WidgetTracker<MainAreaWidget<CogniteDocFrame>>
) {
  // We declare a widget-variable for tracking purposes.
  let widget: MainAreaWidget<CogniteDocFrame>;

  app.commands.addCommand(docFrameOptions.commandId, {
    label: docFrameOptions.title,

    // Define the command-functionality.
    execute: () => {
      // If the MainAreaWidget is not defined, we create one.
      if (!widget) {
        const docContent = new CogniteDocFrame(
          docFrameOptions.title,
          docFrameOptions.url,
          docFrameOptions.commandId
        );
        widget = new MainAreaWidget<CogniteDocFrame>({ content: docContent });
      }
      // Check whether the widget is already tracked. If not, we start tracking.
      if (!tracker.has(widget)) {
        tracker.add(widget);
      }
      // If the widget is not attached to the main work area, we attach it.
      if (!widget.isAttached) {
        app.shell.add(widget, 'main');
      }
      widget.content.update();
    }
  });

  // Add the command to the palette.
  commandPalette.addItem({
    command: docFrameOptions.commandId,
    category: docFrameOptions.category
  });

  // Add the command to the launcher
  launcher.add({
    command: docFrameOptions.commandId,
    category: docFrameOptions.category,
    rank: docFrameOptions.rank
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
 * @param restorer
 */
function activateCogniteDocumentationButtons(
  app: JupyterFrontEnd,
  commandPalette: ICommandPalette,
  launcher: ILauncher,
  restorer: ILayoutRestorer
): void {
  const tracker = new WidgetTracker<MainAreaWidget<CogniteDocFrame>>({
    namespace: 'cognite-docs'
  });

  initializeDocFrame(
    {
      title: 'Cognite Python SDK Docs',
      url: 'https://cognite-sdk-python.readthedocs-hosted.com/en/latest/',
      commandId: 'cognite:open_python_docs',
      category: 'Cognite Documentation',
      rank: 0
    },
    app,
    launcher,
    commandPalette,
    restorer,
    tracker
  );

  initializeDocFrame(
    {
      title: 'Cognite API Docs',
      url: 'https://docs.cognite.com/api/v1/',
      commandId: 'cognite:open_api_docs',
      category: 'Cognite Documentation',
      rank: 1
    },
    app,
    launcher,
    commandPalette,
    restorer,
    tracker
  );

  for (const cmd of ['cognite:open_python_docs', 'cognite:open_api_docs']) {
    restorer.restore(tracker, {
      command: cmd,
      name: () => 'cognite-docs'
    });
  }
}

/**
 * Initialization data for the cognite-documentation extension.
 * Entrypoint for the JupyterExtension. For devs, I recommend you start here.
 * This function is responsible for requesting additional functionality (using the requires keyword),
 * and when the extension is activated, it calls the 'activate'-function. If auto-start is enabled, it
 * automatically activates on page-load.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'cognite-documentation',
  autoStart: true,
  requires: [ICommandPalette, ILauncher, ILayoutRestorer],
  activate: activateCogniteDocumentationButtons
};

export default extension;
