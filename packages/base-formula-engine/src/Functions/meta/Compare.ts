import { ErrorType } from '../../Basics/ErrorType';
import { compareToken } from '../../Basics/Token';
import { ErrorValueObject } from '../../OtherObject/ErrorValueObject';
import { BaseReferenceObject, FunctionVariantType } from '../../ReferenceObject/BaseReferenceObject';
import { BaseValueObject } from '../../ValueObject/BaseValueObject';
import { BaseFunction } from '../BaseFunction';

export class Compare extends BaseFunction {
    private _compareType: compareToken = compareToken.EQUALS;

    setCompareType(token: compareToken) {
        this._compareType = token;
    }

    override calculate(variant1: FunctionVariantType, variant2: FunctionVariantType) {
        if (variant1.isErrorObject() || variant2.isErrorObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let result;

        if (this.checkArrayType(variant1) && this.checkArrayType(variant2)) {
            result = (variant1 as BaseReferenceObject)
                .toArrayValueObject()
                .compare((variant2 as BaseReferenceObject).toArrayValueObject(), this._compareType);
        } else if (this.checkArrayType(variant1)) {
            result = (variant1 as BaseReferenceObject)
                .toArrayValueObject()
                .compare(variant2 as BaseValueObject, this._compareType);
        } else if (this.checkArrayType(variant2)) {
            result = (variant1 as BaseValueObject).compare(
                (variant2 as BaseReferenceObject).toArrayValueObject(),
                this._compareType
            );
        } else {
            result = (variant1 as BaseValueObject).compare(variant2 as BaseValueObject, this._compareType);
        }

        return result;
    }
}
