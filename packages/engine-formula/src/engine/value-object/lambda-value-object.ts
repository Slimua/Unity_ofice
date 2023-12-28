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

import { ErrorType } from '../../basics/error-type';
import { DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER } from '../../basics/token-type';
import type { BaseAstNode } from '../ast-node/base-ast-node';
import type { LambdaParameterNode } from '../ast-node/lambda-parameter-node';
import type { Interpreter } from '../interpreter/interpreter';
import type { BaseReferenceObject } from '../reference-object/base-reference-object';
import { AsyncObject } from '../reference-object/base-reference-object';
import { BaseValueObject, ErrorValueObject } from './base-value-object';

export class LambdaValueObjectObject extends BaseValueObject {
    private _lambdaPrivacyValueMap = new Map<string, BaseValueObject>();

    constructor(
        private _lambdaNode: BaseAstNode,

        private _interpreter: Interpreter,

        private _lambdaPrivacyVarKeys: string[]
    ) {
        super(0);
        this._lambdaPrivacyValueMap.clear();
    }

    override isLambda() {
        return true;
    }

    execute(...variants: BaseValueObject[]) {
        const paramCount = this._lambdaPrivacyVarKeys.length;
        if (variants.length !== paramCount) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        this._setLambdaPrivacyValueMap(variants);

        this._setLambdaNodeValue(this._lambdaNode);

        this._lambdaNode.setNotEmpty(false);

        let value: AsyncObject | BaseValueObject;
        if (this._interpreter.checkAsyncNode(this._lambdaNode)) {
            value = new AsyncObject(this._interpreter.executeAsync(this._lambdaNode) as Promise<BaseValueObject>);
        } else {
            const o = this._interpreter.execute(this._lambdaNode);
            if (o.isReferenceObject()) {
                value = (o as BaseReferenceObject).toArrayValueObject();
            } else {
                value = o as BaseValueObject;
            }
        }

        this._lambdaNode.setNotEmpty(true);

        return value;
    }

    private _setLambdaNodeValue(node: BaseAstNode) {
        const children = node.getChildren();
        const childrenCount = children.length;
        for (let i = 0; i < childrenCount; i++) {
            const item = children[i];
            const token = item.getToken();

            if (token === DEFAULT_TOKEN_TYPE_LAMBDA_RUNTIME_PARAMETER) {
                const lambdaParameter = (item as LambdaParameterNode).getLambdaParameter();
                const value = this._lambdaPrivacyValueMap.get(lambdaParameter);
                if (value) {
                    (item as LambdaParameterNode).setValue(value);
                }
                continue;
            }

            this._setLambdaNodeValue(item);
        }
    }

    private _setLambdaPrivacyValueMap(variants: BaseValueObject[]) {
        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];
            const key = this._lambdaPrivacyVarKeys[i];

            this._lambdaPrivacyValueMap.set(key, variant);
        }
    }
}
