import { nanoid as _nanoid } from "nanoid";

export function generateId(size?: number): string {
  return _nanoid(size);
}
