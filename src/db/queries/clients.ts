import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { clientToDTO } from "./dto";
import type { CreateClientInput, UpdateClientInput } from "@/lib/validators/clients";

export async function getClientsByUserId(userId: string) {
  const rows = await db
    .select()
    .from(clients)
    .where(and(eq(clients.userId, userId), isNull(clients.deletedAt)));
  return rows.map(clientToDTO);
}

export async function createClient(userId: string, data: CreateClientInput) {
  const [row] = await db
    .insert(clients)
    .values({ userId, name: data.name })
    .returning();
  return clientToDTO(row);
}

export async function updateClient(
  clientId: string,
  userId: string,
  data: UpdateClientInput,
) {
  const [row] = await db
    .update(clients)
    .set({ ...data, updatedAt: new Date() })
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.userId, userId),
        isNull(clients.deletedAt),
      ),
    )
    .returning();
  return row ? clientToDTO(row) : null;
}

export async function softDeleteClient(clientId: string, userId: string) {
  const [row] = await db
    .update(clients)
    .set({ deletedAt: new Date() })
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.userId, userId),
        isNull(clients.deletedAt),
      ),
    )
    .returning();
  return !!row;
}
