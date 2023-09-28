import { ILayoutRestorer, JupyterFrontEnd } from '@jupyterlab/application';
import { Menu } from '@lumino/widgets';
import { Token } from '@lumino/coreutils';
import { ICommandPalette, IFrame, MainAreaWidget, WidgetTracker } from '@jupyterlab/apputils';
import { IMainMenu } from '@jupyterlab/mainmenu';
import { ILauncher } from '@jupyterlab/launcher';
import { LabIcon } from '@jupyterlab/ui-components';

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
    this._category = 'Cognite';

    // The title.label is the title displayed in the widget tab.
    this.title.label = title;

    // Whether or not you can close the window, we want this to be true.
    this.title.closable = true;

    this.title.icon = cogniteLogo;

    // Store the ID of the corresponding command.
    this._commandId = commandId;

    // The url of the iFrame content we wish to load. In this case, docs-url.
    this.url = url;

    // Launcher items are ordered by rank.
    this.rank = CogniteDocFrame.rank;
    CogniteDocFrame.rank += 1;

    // We can selectively allow some Sandbox-exceptions. All restrictions are applied by default.
    this.sandbox = ['allow-same-origin', 'allow-scripts', 'allow-forms'];
  }
}

function activateCogniteDocumentationButtons(
  app: JupyterFrontEnd,
  commandPalette: any,
  launcher: ILauncher,
  restorer: ILayoutRestorer,
  mainMenu: IMainMenu
) {
  console.log('activateCogniteDocumentationButtons');
  const trackerPythonDocs = new WidgetTracker<MainAreaWidget<CogniteDocFrame>>({
    namespace: 'cognite-docs-python'
  });

  // Create and register the Python SDK Docs command with the launcher
  initializeDocFrame(
    {
      title: 'Python SDK Docs',
      url: 'https://cognite-sdk-python.readthedocs-hosted.com/en/latest/',
      commandId: 'cognite:open_python_docs',
      category: 'Cognite',
      rank: 0
    },
    app,
    launcher,
    commandPalette,
    restorer,
    trackerPythonDocs
  );
  const trackerAPIDocs = new WidgetTracker<MainAreaWidget<CogniteDocFrame>>({
    namespace: 'cognite-docs-api'
  });
  // Create and register the API Docs command with the launcher
  initializeDocFrame(
    {
      title: 'API Docs',
      url: 'https://docs.cognite.com/api/v1/',
      commandId: 'cognite:open_api_docs',
      category: 'Cognite',
      rank: 1
    },
    app,
    launcher,
    commandPalette,
    restorer,
    trackerAPIDocs
  );

  const trackerExperimentalPythonDocs = new WidgetTracker<
    MainAreaWidget<CogniteDocFrame>
  >({
    namespace: 'cognite-docs-experimental-python'
  });

  initializeDocFrame(
    {
      title: 'Experimental Python SDK Docs',
      url: 'https://cognite-sdk-experimental.readthedocs-hosted.com/en/latest/',
      commandId: 'cognite:open_experimental_python_docs',
      category: 'Cognite',
      rank: 2
    },
    app,
    launcher,
    commandPalette,
    restorer,
    trackerExperimentalPythonDocs
  );

  // Hackish way of restoring the layout, having one tracker per widget.
  // I do not understand how the widget-tracker works.
  restorer.restore(trackerPythonDocs, {
    command: 'cognite:open_python_docs',
    name: () => 'cognite-docs-python'
  });
  restorer.restore(trackerAPIDocs, {
    command: 'cognite:open_api_docs',
    name: () => 'cognite-docs-api'
  });
  restorer.restore(trackerExperimentalPythonDocs, {
    command: 'cognite:open_experimental_python_docs',
    name: () => 'cognite-docs-experimental-python'
  });

  // Register the doc-commands in the Cognite MainMenu Item.
  const cogniteMenu = new Menu({ commands: app.commands });
  cogniteMenu.title.label = 'CDF';

  for (const cmd of [
    'cognite:open_python_docs',
    'cognite:open_api_docs',
    'cognite:open_experimental_python_docs'
  ]) {
    cogniteMenu.addItem({
      command: cmd,
      args: {}
    });
  }

  // Add the CDF-menu to the main menu
  mainMenu.addMenu(cogniteMenu, undefined, { rank: 40 });
}

interface ICogniteDocFrameOptions {
  title: string;
  url: string;
  commandId: string;
  category: string;
  rank?: number | undefined;
}

// Setting class="jp-icon0" ensures that colors contrast the current theme background.
const cogniteLogo = new LabIcon({
  name: 'Cognite Logo',
  svgstr:
    '<svg  id="cognite_icon_light" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 128 76"><g class="jp-icon0" fill="#fff" fill-rule="evenodd"><path class="st0" d="M101.1,31.3v-6.5c0-3.1-2.5-5.6-5.6-5.6s-5.6,2.5-5.6,5.6v8.3c-3.4,0.6-7,1.4-10.9,2.3V6.2 c0-3.1-2.5-5.6-5.6-5.6s-5.6,2.5-5.6,5.6v31.9c-0.3,0.1-0.6,0.2-1,0.2c-3.5,0.9-6.7,1.7-9.9,2.4V15.8c0-3.1-2.5-5.6-5.6-5.6 s-5.6,2.5-5.6,5.6v27.3c-3.9,0.8-7.5,1.5-10.9,2V32.4c0-3.1-2.5-5.6-5.6-5.6s-5.6,2.5-5.6,5.6v14.2C11.2,48,4,47.4,3.1,45.3 c-1.6-3.8,9.9-9.1,13-10.8c0.1,0,0.1-0.1,0-0.2c0-0.1-0.2-0.1-0.2-0.1c-3.3,1.4-17.2,7.2-15.6,12.1c1.8,5.5,23.4,6.9,68.1-4 c37.6-9.2,54.8-10.9,56.4-7.4c1.4,3-8,8.7-16.9,12.7c-0.2,0.1-0.4,0.4-0.3,0.7c0.1,0.3,0.4,0.4,0.7,0.3c3.3-1.3,20.3-8.5,19.4-14.6 C127.5,30,118.5,28.9,101.1,31.3z"></path><path class="st0" d="M23.8,57.7v4.2c0,3.1,2.5,5.6,5.6,5.6S35,65,35,61.9v-5.4C30.9,57,27.2,57.4,23.8,57.7z"></path><path class="st0" d="M45.9,54.7v15.1c0,3.1,2.5,5.6,5.6,5.6s5.6-2.5,5.6-5.6V52.5C53.1,53.3,49.4,54.1,45.9,54.7z"></path><path class="st0" d="M68.7,49.8c-0.3,0.1-0.5,0.1-0.7,0.2v10.6c0,3.1,2.5,5.6,5.6,5.6s5.6-2.5,5.6-5.6V47.3 C75.8,48,72.3,48.9,68.7,49.8z"></path><path class="st0" d="M90,44.9v6.4c0,3.1,2.5,5.6,5.6,5.6s5.6-2.5,5.6-5.6v-8.5C97.8,43.3,94.1,44,90,44.9z"></path></g></svg>'
});

function initializeDocFrame(
  docFrameOptions: ICogniteDocFrameOptions,
  app: JupyterFrontEnd,
  launcher: ILauncher,
  commandPalette: ICommandPalette,
  restorer: ILayoutRestorer,
  tracker: WidgetTracker<MainAreaWidget<CogniteDocFrame>>
): void {
  // We declare a widget-variable for tracking purposes.
  let widget: MainAreaWidget<CogniteDocFrame>;

  app.commands.addCommand(docFrameOptions.commandId, {
    label: docFrameOptions.title,
    caption: 'Open documentation',
    icon: cogniteLogo,
    // Define the command-functionality.
    execute: () => {
      // If the MainAreaWidget is not defined, we create one.
      if (!widget || widget.isDisposed) {
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

      // If the widget is attached, yet not focused, we refocus it here.
      app.shell.activateById(widget.id);
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
 * Initialization data for the dshub-cognite-docs extension.
 */
const plugin: { activate: (app: JupyterFrontEnd, commandPalette: any, launcher: ILauncher, restorer: ILayoutRestorer, mainMenu: IMainMenu) => void; description: string; id: string; autoStart: boolean; requires: (Token<ICommandPalette> | Token<ILauncher> | ILauncher | Token<ILayoutRestorer> | Token<IMainMenu> | IMainMenu)[] } = {
  id: 'dshub-cognite-docs:plugin',
  description: 'Integrated cognite documentation',
  autoStart: true,
  activate: activateCogniteDocumentationButtons,
  requires: [ICommandPalette, ILauncher, ILayoutRestorer, IMainMenu]
};

export default plugin;
