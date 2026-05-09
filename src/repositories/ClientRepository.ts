import { AppDataSource } from '../data-source.js';
import { Client } from '../entities/Client.js';

export interface CursorResult<T> {
  items: T[];
  nextCursor?: string;
  hasMore: boolean;
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(
    JSON.stringify({ createdAt: createdAt.toISOString(), id }),
  ).toString('base64');
}

function decodeCursor(cursor: string): { createdAt: string; id: string } {
  const parsed: unknown = JSON.parse(Buffer.from(cursor, 'base64').toString('utf-8'));
  if (
    typeof parsed !== 'object' ||
    parsed === null ||
    !('createdAt' in parsed) ||
    !('id' in parsed) ||
    typeof (parsed as Record<string, unknown>).createdAt !== 'string' ||
    typeof (parsed as Record<string, unknown>).id !== 'string'
  ) {
    throw new Error('Invalid cursor');
  }
  return parsed as { createdAt: string; id: string };
}

export const ClientRepository = AppDataSource.getRepository(Client).extend({
  findByIdOrNull(id: string): Promise<Client | null> {
    return this.findOne({ where: { id } });
  },

  async findManyWithCursor(
    limit: number,
    cursor?: string,
  ): Promise<CursorResult<Client>> {
    const qb = this.createQueryBuilder('client').orderBy('client.createdAt', 'ASC').addOrderBy('client.id', 'ASC').limit(limit + 1);

    if (cursor) {
      const { createdAt, id } = decodeCursor(cursor);
      qb.where(
        '(client.createdAt > :createdAt OR (client.createdAt = :createdAt AND client.id > :id))',
        { createdAt, id },
      );
    }

    const rows = await qb.getMany();
    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const lastItem = items[items.length - 1];
    const nextCursor =
      hasMore && lastItem !== undefined
        ? encodeCursor(lastItem.createdAt, lastItem.id)
        : undefined;

    return { items, nextCursor, hasMore };
  },
});
