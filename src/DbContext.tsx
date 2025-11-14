import { createContext } from 'react';

export type DbConfig = {
  user?: string;
  password?: string;
  host?: string;
  port?: number;
  database?: string;
}

interface DbContextType {
  dbConfig: DbConfig | null;
  setDbConfig: (config: DbConfig | null) => void;
}

export const DbContext = createContext<DbContextType | undefined>(undefined);