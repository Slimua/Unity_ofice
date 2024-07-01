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

import type { SheetsSelectionsService } from '@univerjs/sheets';
import { createIdentifier } from '@wendellhu/redi';

/**
 * Ref selections service reuses code of `SelectionManagerService`. And it only contains ref selections
 * when user is editing formula.
 *
 * Its data should be cleared by the caller quit editing formula and reconstructed when user starts editing.
 */
export const IRefSelectionsService = createIdentifier<SheetsSelectionsService>('sheets-formula.ref-selections.service');

// TODO@wzhudev: `IRefSelectionsService` should have a total different implementation than `SheetsSelectionsService`
// because ref ranges could from different units in a formula.
