// tslint:disable:no-implicit-dependencies
import { valueConverter } from "aurelia-binding";

@valueConverter("filter")
export class Filter {
  public toView(arr: any[], prop: string, value: any): any[] {
    if (arr && arr.length && prop && value) {
      return arr.filter((a: any) => (a[prop] === value));
    } else {
      return arr;
    }
  }
}
