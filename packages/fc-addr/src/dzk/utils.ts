import * as _ from "lodash";

import {tdist} from "./tdist";

export function getAreaData(zipcode:string) {
    if (!tdist) {
      return [];
    }

    if (!zipcode) {
      return _.compact(_.map(tdist, (val:string, key:string) => {
        if (key.slice(-4) === '0000') {
          return {
            zipcode: key,
            name: val[0]
          };
        }
      }));
    }

    if (zipcode.slice(-4) === '0000') {
      return _.compact(_.map(tdist, (val, key) => {
        if ( key.slice(0, 2) === zipcode.slice(0, 2) &&
               key.slice(-2) === '00' &&
               key.slice(-4) !== '0000') {
          return {
            zipcode: key,
            name: val[0]
          };
        }
      }));
    }
    else {
      return _.compact(_.map(tdist, (val, key) => {
        if ( key.slice(0, 4) === zipcode.slice(0, 4) &&
               key.slice(-2) !== '00') {
          return {
            zipcode: key,
            name: val[0]
          };
        }
      }));
    }
  }
}