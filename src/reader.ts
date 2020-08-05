export type Reader<E, A> = (e: E) => A;

interface CombineReader {
  <E1, A1, B>(r1: Reader<E1, A1>, project: (as: [A1]) => B): Reader<E1, B>;
  <E1, E2, A1, A2, B>(
    r1: Reader<E1, A1>,
    r2: Reader<E2, A2>,
    project: (as: [A1, A2]) => B
  ): Reader<E1 & E2, B>;
}

// yep, type-safe implementation
export const combineReader: CombineReader = (
  ...args: any[]
): Reader<any, any> => (e) => {
  const [project, ...rs] = args.reverse() as any;

  return project(rs.map((r: any) => r(e))) as any;
};

export function ask<A>(): Reader<A, A> {
  return (a) => a;
}
