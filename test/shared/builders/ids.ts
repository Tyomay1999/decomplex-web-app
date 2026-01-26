export type IdFactory = {
  next: () => string;
};

export const createIdFactory = (prefix: string): IdFactory => {
  let i = 0;

  return {
    next: () => {
      i += 1;
      return `${prefix}_${i}`;
    },
  };
};
