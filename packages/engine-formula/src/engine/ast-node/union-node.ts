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
import { matchToken } from '../../basics/token';
import type { BaseFunction } from '../../functions/base-function';
import { FUNCTION_NAMES_META } from '../../functions/meta/function-names';
import { IFunctionService } from '../../services/function.service';
import { LexerNode } from '../analysis/lexer-node';
import type { BaseReferenceObject, FunctionVariantType } from '../reference-object/base-reference-object';
import type { BaseValueObject } from '../value-object/base-value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import { BaseAstNode, ErrorNode } from './base-ast-node';
import { BaseAstNodeFactory, DEFAULT_AST_NODE_FACTORY_Z_INDEX } from './base-ast-node-factory';
import { NODE_ORDER_MAP, NodeType } from './node-type';

const UNION_EXECUTOR_NAME = 'UNION';

export class UnionNode extends BaseAstNode {
    constructor(
        private _operatorString: string,
        private _functionExecutor: BaseFunction
    ) {
        super(_operatorString);
    }

    override get nodeType() {
        return NodeType.UNION;
    }

    override execute() {
        const children = this.getChildren();
        let leftNode = children[0].getValue();
        let rightNode = children[1].getValue();

        if (leftNode == null || rightNode == null) {
            throw new Error('leftNode and rightNode');
        }

        let result: FunctionVariantType;
        if (this._operatorString === matchToken.COLON) {
            if (leftNode.isReferenceObject()) {
                leftNode = (leftNode as BaseReferenceObject).toArrayValueObject();
            }

            if (rightNode.isReferenceObject()) {
                rightNode = (rightNode as BaseReferenceObject).toArrayValueObject();
            }

            result = this._functionExecutor.calculate(
                leftNode as BaseValueObject,
                rightNode as BaseValueObject
            ) as FunctionVariantType;
        } else {
            result = ErrorValueObject.create(ErrorType.NAME);
        }
        this.setValue(result);
    }
}

export class UnionNodeFactory extends BaseAstNodeFactory {
    constructor(@IFunctionService private readonly _functionService: IFunctionService) {
        super();
    }

    override get zIndex() {
        return NODE_ORDER_MAP.get(NodeType.UNION) || DEFAULT_AST_NODE_FACTORY_Z_INDEX;
    }

    override create(param: string): BaseAstNode {
        const functionExecutor = this._functionService.getExecutor(FUNCTION_NAMES_META.UNION);
        if (!functionExecutor) {
            console.error(`No function ${param}`);
            return ErrorNode.create(ErrorType.NAME);
        }
        return new UnionNode(param, functionExecutor);
    }

    override checkAndCreateNodeType(param: LexerNode | string) {
        if (!(param instanceof LexerNode)) {
            return;
        }

        const token = param.getToken();

        const tokenTrim = token.trim();

        if (tokenTrim.charAt(0) === '"' && tokenTrim.charAt(tokenTrim.length - 1) === '"') {
            return;
        }

        if (tokenTrim !== matchToken.COLON) {
            return;
        }

        return this.create(tokenTrim);
    }
}
