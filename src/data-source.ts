import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { getDataSourceOptions } from './data-source-options.js';

export const AppDataSource = new DataSource(getDataSourceOptions());
