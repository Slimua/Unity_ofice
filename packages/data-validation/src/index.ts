/**
 * Copyright 2023-present DreamNum Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export { UniverDataValidationPlugin } from './plugin';
export { type IDataValidatorProvider, DataValidatorService, IDataValidatorService, type IRulePosition } from './services/data-validator.service';
export { DataValidatorRegistryService } from './services/data-validator-registry.service';
export { DataValidationModel } from './models/data-validation-model';
export {
    OpenValidationPanelOperation,
    CloseValidationPanelOperation,
    ToggleValidationPanelOperation,
    DataValidationPanelName,
} from './commands/operations/data-validation.operation';

export {
    AddDataValidationCommand,
    RemoveDataValidationCommand,
    UpdateDataValidationCommand,
    RemoveAllDataValidationCommand,
} from './commands/commands/data-validation.command';

export type {
    IRemoveAllDataValidationCommand,
    IRemoveDataValidationCommandParams,
    IUpdateDataValidationCommand,
} from './commands/commands/data-validation.command';

export {
    AddDataValidationMutation,
    RemoveAllDataValidationMutation,
    RemoveDataValidationMutation,
    ReplaceDataValidationMutation,
    UpdateDataValidationMutation,
} from './commands/mutations/data-validation.mutation';

export type {
    IAddDataValidationMutationParams,
    IRemoveAllDataValidationMutationParams,
    IRemoveDataValidationMutationParams,
    IReplaceDataValidationMutationParams,
    IUpdateDataValidationMutationParams,
} from './commands/mutations/data-validation.mutation';

export * from './types';
