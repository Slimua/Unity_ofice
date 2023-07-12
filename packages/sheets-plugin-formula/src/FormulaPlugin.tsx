import { SheetContext, UniverSheet, Plugin } from '@univerjs/core';
import { FormulaEnginePlugin } from '@univerjs/base-formula-engine';
import { CellEditExtensionManager, CellInputExtensionManager, Icon } from '@univerjs/base-ui';
import { SheetUIPlugin, SHEET_UI_PLUGIN_NAME } from '@univerjs/ui-plugin-sheets';
import { zh, en } from './Locale';

import { IFormulaConfig } from './Basics/Interfaces/IFormula';
import { FORMULA_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { FormulaController } from './Controller/FormulaController';
import { firstLoader } from './Controller/FirstLoader';
import { FormulaCellEditExtensionFactory } from './Basics/Register/FormulaCellEditExtension';
import { FormulaCellInputExtensionFactory } from './Basics/Register/FormulaCellInputExtension';
import { FormulaActionExtensionFactory } from './Basics/Register';
import { FormulaPluginObserve, install } from './Basics/Observer';
import { SearchFormulaController } from './Controller/SearchFormulaModalController';
import { FormulaPromptController } from './Controller/FormulaPromptController';

export class FormulaPlugin extends Plugin<FormulaPluginObserve, SheetContext> {
    protected _formulaActionExtensionFactory: FormulaActionExtensionFactory;

    private _formulaController: FormulaController;

    private _searchFormulaController: SearchFormulaController;

    private _formulaPromptController: FormulaPromptController;

    constructor(private _config?: IFormulaConfig) {
        super(FORMULA_PLUGIN_NAME);
    }

    static create(config?: IFormulaConfig) {
        return new FormulaPlugin(config);
    }

    installTo(universheetInstance: UniverSheet) {
        universheetInstance.installPlugin(this);

        const context = this.getContext();
        let formulaEngine = context.getPluginManager().getPluginByName<FormulaEnginePlugin>('formulaEngine');
        if (!formulaEngine) {
            formulaEngine = new FormulaEnginePlugin();
            universheetInstance.installPlugin(formulaEngine);
        }

        let sheetPlugin = context.getUniver().getGlobalContext().getPluginManager().getRequirePluginByName<SheetUIPlugin>(SHEET_UI_PLUGIN_NAME);
        sheetPlugin?.UIDidMount(() => {
            this._formulaController = new FormulaController(this, this._config);
            this._searchFormulaController = new SearchFormulaController(this);
            this._formulaPromptController = new FormulaPromptController(this);

            this._formulaController.setFormulaEngine(formulaEngine as FormulaEnginePlugin);

            firstLoader(this._formulaController);
            sheetPlugin.getComponentManager().register('FxIcon', Icon.Math.FxIcon);

            sheetPlugin.setFx({
                onClick: () => {
                    this._searchFormulaController.showFormulaModal('SearchFormula', true);
                },
                icon: 'FxIcon',
            });
        });
    }

    initialize(context: SheetContext): void {
        this.context = context;
        /**
         * load more Locale object
         */
        this.getLocale().load({
            en,
            zh,
        });

        this.registerExtension();

        // this._arrayFormLineControl.addArrayFormLineToSheet(
        //     {
        //         startRow: 1,
        //         endRow: 3,
        //         startColumn: 1,
        //         endColumn: 3,
        //     },
        //     'sheet-0004'
        // );
        // this._arrayFormLineControl.addArrayFormLineToSheet(
        //     {
        //         startRow: 4,
        //         endRow: 5,
        //         startColumn: 4,
        //         endColumn: 5,
        //     },
        //     'sheet-0004'
        // );
        // this._arrayFormLineControl.addArrayFormLineToSheet(
        //     {
        //         startRow: 5,
        //         endRow: 6,
        //         startColumn: 5,
        //         endColumn: 6,
        //     },
        //     'sheet-0003'
        // );
    }

    onMounted(context: SheetContext): void {
        install(this);

        this.initialize(context);
    }

    onDestroy(): void {
        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        actionRegister.delete(this._formulaActionExtensionFactory);
    }

    registerExtension() {
        const cellEditRegister = CellEditExtensionManager.create();
        cellEditRegister.add(new FormulaCellEditExtensionFactory(this));

        const cellInputRegister = CellInputExtensionManager.create();
        cellInputRegister.add(new FormulaCellInputExtensionFactory(this));

        const actionRegister = this.context.getCommandManager().getActionExtensionManager().getRegister();
        this._formulaActionExtensionFactory = new FormulaActionExtensionFactory(this);
        actionRegister.add(this._formulaActionExtensionFactory);
    }

    getFormulaEngine() {
        return this._formulaController.getFormulaEngine();
    }

    getFormulaController() {
        return this._formulaController;
    }

    getSearchFormulaController() {
        return this._searchFormulaController;
    }

    getFormulaPromptController() {
        return this._formulaPromptController;
    }
}
