// import { numfmt } from '@univerjs/base-numfmt-engine';
// import {
//     ACTION_NAMES,
//     ActionOperation,
//     BaseActionExtension,
//     BaseActionExtensionFactory,
//     IActionData,
//     IUniverInstanceService,
//     ISetRangeDataActionData,
//     ISheetActionData,
//     ObjectMatrix,
// } from '@univerjs/core';
// import { Inject, Injector } from '@wendellhu/redi';

// import { NumfmtModel } from '../../Model';
// import { NumfmtPlugin } from '../../NumfmtPlugin';
// import { INumfmtPluginData } from '../../Symbol';
// import { ACTION_NAMES as PLUGIN_ACTION_NAMES } from '../Enum';

// export class NumfmtActionExtension extends BaseActionExtension {
//     constructor(
//         actionDataList: IActionData[],
//         @IUniverInstanceService private readonly _currentUniverService: IUniverInstanceService,
//         @Inject(INumfmtPluginData) private _numfmtPluginData: NumfmtModel,
//         @Inject(Injector) private readonly _sheetInjector: Injector
//     ) {
//         super(actionDataList);
//     }

//     override execute() {
//         const numfmtMatrix = new ObjectMatrix<string>();
//         const actionDataList = this.actionDataList as ISetRangeDataActionData[];

//         actionDataList.forEach((actionData) => {
//             if (actionData.operation != null && !ActionOperation.hasExtension(actionData)) {
//                 return false;
//             }

//             if (actionData.actionName !== ACTION_NAMES.SET_RANGE_DATA_ACTION) {
//                 return false;
//             }

//             const { cellValue, sheetId } = actionData;
//             const numfmtConfig = this._numfmtPluginData.getNumfmtBySheetIdConfig(sheetId);
//             const currSheetNumfmtMatrix = new ObjectMatrix(numfmtConfig);
//             const rangeMatrix = new ObjectMatrix(cellValue);

//             rangeMatrix.forValue((r, c, cell) => {
//                 const typed = numfmt.parseValue(cell.v) as unknown as { z: string; v: string };

//                 if (typed) {
//                     // format already set，get format, e.g. 100% => =sum(2), we will set 200%
//                     const currNumfmtValue = currSheetNumfmtMatrix.getValue(r, c);
//                     // if (currNumfmtValue) {
//                     //     typed.z = ;
//                     // }

//                     const format = numfmt(typed.z);
//                     cell.m = format(typed.v);
//                     cell.v = typed.v || String();
//                     numfmtMatrix.setValue(r, c, typed.z);
//                 }
//             });

//             const setNumfmtRangeDataAction = {
//                 actionName: PLUGIN_ACTION_NAMES.SET_NUMFMT_RANGE_DATA_ACTION,
//                 sheetId,
//                 cellValue: numfmtMatrix.toJSON(),
//                 injector: this._sheetInjector,
//             };
//             this.push(setNumfmtRangeDataAction);
//         });
//     }
// }

// export class NumfmtActionExtensionFactory extends BaseActionExtensionFactory {
//     constructor(_plugin: NumfmtPlugin, @Inject(Injector) private readonly _sheetInjector: Injector) {
//         super(_plugin);
//     }

//     override get zIndex(): number {
//         return 2;
//     }

//     override create(actionDataList: ISheetActionData[]): BaseActionExtension {
//         return this._sheetInjector.createInstance(NumfmtActionExtension, actionDataList);
//     }
// }
