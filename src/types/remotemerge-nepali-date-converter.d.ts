declare module "@remotemerge/nepali-date-converter" {
  export interface ConvertedDate {
    year: number;
    month: number;
    date: number;
    day: string;
  }

  export default class DateConverter {
    constructor(date: string);

    toAd(): ConvertedDate;

    toBs(): ConvertedDate;
  }
}
