import { Nullable } from '@univerjs/core';

import { BaseAstNode } from './BaseAstNode';

export class LambdaRuntime {
    // lambdaId: { key: BaseAstNode }
    private _lambdaPrivacyVar: Map<string, Map<string, Nullable<BaseAstNode>>> = new Map();

    registerLambdaPrivacyVar(lambdaId: string, lambdaVar: Map<string, Nullable<BaseAstNode>>) {
        this._lambdaPrivacyVar.set(lambdaId, lambdaVar);
    }

    getCurrentPrivacyVar(lambdaId: string) {
        return this._lambdaPrivacyVar.get(lambdaId);
    }
}
