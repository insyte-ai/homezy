/**
 * Mongoose utility functions for handling lean() query results
 *
 * When using .lean() for performance, Mongoose's toJSON transform is bypassed.
 * These utilities ensure consistent _id -> id transformation.
 */

type WithId<T> = T & { _id: any };

/**
 * Recursively transform an object, converting _id to id at all levels
 */
const transformRecursive = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) {
    return obj.map(transformRecursive);
  }
  if (typeof obj === 'object') {
    // Check if it's a Date or ObjectId-like (has toHexString)
    if (obj instanceof Date || typeof obj.toHexString === 'function') {
      return obj;
    }
    const { _id, __v, ...rest } = obj;
    const result: any = {};
    // Transform nested objects first
    for (const key of Object.keys(rest)) {
      result[key] = transformRecursive(rest[key]);
    }
    // Add id if _id exists
    if (_id) {
      result.id = _id.toString();
    }
    return result;
  }
  return obj;
};

/**
 * Transform a lean document by converting _id to id (recursively for nested objects)
 */
export const transformLeanDoc = <T extends WithId<any>>(doc: T): Omit<T, '_id'> & { id: string } => {
  return transformRecursive(doc);
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
