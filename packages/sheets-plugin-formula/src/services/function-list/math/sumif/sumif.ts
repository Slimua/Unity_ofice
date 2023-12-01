import type { FunctionVariantType } from '@univerjs/base-formula-engine';
import { BaseFunction, ErrorType, ErrorValueObject } from '@univerjs/base-formula-engine';

export class Sumif extends BaseFunction {
    override calculate(...variants: FunctionVariantType[]) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
}
