declare type Optional<T> = T | null | undefined;
declare type List<T> = ArrayLike<T>;
declare type Many<T> = T | ReadonlyArray<T>;

declare interface Dictionary<T> {
  [index: string]: T;
}

declare let process: {
  env: {
    NODE_ENV: 'development' | 'production',
    VERCEL_URL: Optional<string>;
    BUILD_TIME: `${number}`;
  }
};

interface JQueryStatic {
  (document: Document): JQuery<Document>;
  <TElement extends HTMLElement = HTMLElement>(selector: JQuery.Selector | TElement | JQuery<TElement>, context?: Element | Document | JQuery | JQuery.Selector): JQuery<TElement>;
  (...args: any[]): JQuery
}

type JQueryable<TElement = HTMLElement> = JQuery<TElement> | JQuery.Selector | TElement;
