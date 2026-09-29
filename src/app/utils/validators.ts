import {AbstractControl, ValidationErrors} from '@angular/forms';

export function nonBlank(control: AbstractControl): ValidationErrors | null {
  return typeof control.value === 'string' && control.value.trim().length > 0 ? null : {required: true};
}
