import { registerDecorator, ValidationOptions } from 'class-validator';
import { isCPF } from 'brazilian-values';

export function IsCPF(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isCPF',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        defaultMessage(): string {
          return 'This value is not a CPF valid.';
        },
        validate(value: any) {
          return typeof value === 'string' && isCPF(value); // you can return a Promise<boolean> here as well, if you want to make async validation
        },
      },
    });
  };
}
