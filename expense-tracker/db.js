import pg from 'pg';

// Return DATE columns as plain 'YYYY-MM-DD' strings instead of JS Date objects,
// which would otherwise be shifted by the local time zone.
pg.types.setTypeParser(pg.types.builtins.DATE, (value) => value);

// A pool keeps a few open connections and hands one to each query.
// With no arguments it reads PGHOST, PGPORT, PGDATABASE, PGUSER and PGPASSWORD from the environment.
export const pool = new pg.Pool();
