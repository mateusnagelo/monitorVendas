import { createContext } from 'react';

export interface DbConfig {
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
}

export type DbContextType = {
  dbConfig: DbConfig | null;
  setDbConfig: (config: DbConfig | null) => void;
};

export const DbContext = createContext<DbContextType | null>(null);