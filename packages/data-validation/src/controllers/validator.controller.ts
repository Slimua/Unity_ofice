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

import { Disposable, LifecycleStages, LocaleService, OnLifecycle } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { Inject } from '@wendellhu/redi';
import { FORMULA_INPUTS } from '../views/formula-input';
import { NumberValidator } from '../validators/number-validator';
import { DataValidatorRegistryService } from '../services/data-validator-registry.service';

@OnLifecycle(LifecycleStages.Ready, DataValidatorController)
export class DataValidatorController extends Disposable {
    constructor(
        @Inject(ComponentManager) private _componentManager: ComponentManager,
        @Inject(LocaleService) private _localeService: LocaleService,
        @Inject(DataValidatorRegistryService) private _dataValidatorRegistryService: DataValidatorRegistryService
    ) {
        super();
        this._initFormulaInputComponent();
        this._registerValidators();
    }

    private _registerValidators() {
        [NumberValidator].forEach((Validator) => {
            const validator = new Validator(this._localeService);
            this.disposeWithMe(
                this._dataValidatorRegistryService.register(validator)
            );
        });
    }

    private _initFormulaInputComponent() {
        FORMULA_INPUTS.forEach(([componentKey, Component]) => {
            this.disposeWithMe(this._componentManager.register(
                componentKey,
                Component
            ));
        });
    }
}
