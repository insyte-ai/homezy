/**
 * Mongoose utility functions for handling lean() query results
 *
 * When using .lean() for performance, Mongoose's toJSON transform is bypassed.
 * These utilities ensure consistent _id -> id transformation.
 */

type WithId<T> = T & { _id: any };

/**
 * Transform a lean document by converting _id to id
 */
export const transformLeanDoc = <T extends WithId<any>>(doc: T): Omit<T, '_id'> & { id: string } => {
  const { _id, __v, ...rest } = doc as any;
  return {
    ...rest,
    id: _id.toString(),
  };
};

/**
 * Transform an array of lean documents
 */
export const transformLeanDocs = <T extends WithId<any>>(docs: T[]): (Omit<T, '_id'> & { id: string })[] => {
  return docs.map(transformLeanDoc);
};

/**
 * Transform a lean document with additional fields
 * Useful when you need to add computed properties
 */
export const transformLeanDocWith = <T extends WithId<any>, E extends object>(
  doc: T,
  extra: E
): Omit<T, '_id'> & { id: string } & E => {
  return {
    ...transformLeanDoc(doc),
    ...extra,
  };
};
