import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'truncateWords',
  standalone: true
})
export class TruncateWordsPipe implements PipeTransform {
  transform(value: string, limit: number = 20, trail: string = '...'): string {
    if (!value) {
      return '';
    }
    const words = value.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + trail;
    }
    return value;
  }
}
