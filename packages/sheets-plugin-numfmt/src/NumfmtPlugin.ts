import { CommandManager, IRangeData, LocaleService, ObjectMatrixPrimitiveType, Plugin, PluginType, SheetContext } from '@univerjs/core';
import { Dependency, Inject, Injector } from '@wendellhu/redi';
import { NUMFMT_PLUGIN_NAME } from './Basics/Const/PLUGIN_NAME';
import { install, NumfmtPluginObserve } from './Basics/Observer';
import en from './Locale/en';
import zh from './Locale/zh';
import { NumfmtController } from './Controller/NumfmtController';
import { NumfmtActionExtensionFactory } from './Basics/Register/NumfmtActionExtension';
import { NumfmtModalController } from './Controller/NumfmtModalController';

export interface INumfmtPluginConfig {}

export class NumfmtPlugin extends Plugin<NumfmtPluginObserve, SheetContext> {
    static override type = PluginType.Sheet;

    private _numfmtController: NumfmtController;

    private _numfmtModalController: NumfmtModalController;

    private _numfmtActionExtensionFactory: NumfmtActionExtensionFactory;

    constructor(
        config: Partial<INumfmtPluginConfig>,
        @Inject(LocaleService) private readonly _localeService: LocaleService,
        @Inject(Injector) override readonly _injector: Injector,
        @Inject(CommandManager) private readonly _commandManager: CommandManager
    ) {
        super(NUMFMT_PLUGIN_NAME);
        this.initializeDependencies(_injector);
    }

    override onMounted(): void {
        install(this);
        this._localeService.getLocale().load({ en, zh });
        this._numfmtActionExtensionFactory = new NumfmtActionExtensionFactory(this);
        this._numfmtController = this._injector.get(NumfmtController);
        this._numfmtModalController = this._injector.get(NumfmtModalController);
        const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        actionRegister.add(this._numfmtActionExtensionFactory);
    }

    override onDestroy(): void {
        super.onDestroy();
        const actionRegister = this._commandManager.getActionExtensionManager().getRegister();
        actionRegister.delete(this._numfmtActionExtensionFactory);
    }

    getNumfmtBySheetIdConfig(sheetId: string): ObjectMatrixPrimitiveType<string> {
        return this._numfmtController.getNumfmtBySheetIdConfig(sheetId);
    }

    setNumfmtByRange(sheetId: string, range: IRangeData, format: string): void {
        this._numfmtController.setNumfmtByRange(sheetId, range, format);
    }

    setNumfmtByCoords(sheetId: string, row: number, column: number, format: string): void {
        this._numfmtController.setNumfmtByCoords(sheetId, row, column, format);
    }

    getNumfmtModalController(): NumfmtModalController {
        return this._numfmtModalController;
    }

    private initializeDependencies(sheetInjector: Injector): void {
        // this._injector = new Injector([
        //     [IRenderingEngine, { useFactory: () => this.getGlobalContext().getPluginManager().getRequirePluginByName<RenderEngine>(PLUGIN_NAMES.BASE_RENDER).getEngine() }],
        //     [NumfmtController],
        //     [NumfmtModalController],
        // ]);
        const dependencies: Dependency[] = [[NumfmtController], [NumfmtModalController]];
        dependencies.forEach((d) => {
            sheetInjector.add(d);
        });
    }
}
