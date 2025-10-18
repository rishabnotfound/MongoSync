/**
 * MongoDB service for managing database connections and operations
 */

import { MongoClient, Db, ObjectId } from 'mongodb';

// Cache for MongoDB clients
const clientCache = new Map<string, MongoClient>();

/**
 * Get or create a MongoDB client for the given URI
 */
export async function getMongoClient(uri: string): Promise<MongoClient> {
  // Check if we already have a client for this URI
  if (clientCache.has(uri)) {
    const client = clientCache.get(uri)!;
    // Check if client is still connected
    try {
      await client.db('admin').command({ ping: 1 });
      return client;
    } catch {
      // Client is disconnected, remove from cache
      clientCache.delete(uri);
    }
  }

  // Create new client
  const client = new MongoClient(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
  });

  await client.connect();
  clientCache.set(uri, client);

  return client;
}

/**
 * Close a MongoDB client
 */
export async function closeMongoClient(uri: string): Promise<void> {
  const client = clientCache.get(uri);
  if (client) {
    await client.close();
    clientCache.delete(uri);
  }
}

/**
 * List all databases
 */
export async function listDatabases(uri: string) {
  const client = await getMongoClient(uri);
  const adminDb = client.db('admin');
  const { databases } = await adminDb.admin().listDatabases();
  return databases;
}

/**
 * List all collections in a database
 */
export async function listCollections(uri: string, database: string) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const collections = await db.listCollections().toArray();
  return collections;
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(uri: string, database: string, collection: string) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const stats = await db.command({ collStats: collection });
  return stats;
}

/**
 * Find documents in a collection
 */
export async function findDocuments(
  uri: string,
  database: string,
  collection: string,
  filter: any = {},
  options: {
    projection?: any;
    sort?: any;
    limit?: number;
    skip?: number;
  } = {}
) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const coll = db.collection(collection);

  const { projection, sort, limit = 50, skip = 0 } = options;

  const cursor = coll.find(filter);

  if (projection) {
    cursor.project(projection);
  }

  if (sort) {
    cursor.sort(sort);
  }

  cursor.skip(skip).limit(limit);

  const documents = await cursor.toArray();
  const total = await coll.countDocuments(filter);

  return {
    documents,
    total,
  };
}

/**
 * Insert a document
 */
export async function insertDocument(
  uri: string,
  database: string,
  collection: string,
  document: any
) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const coll = db.collection(collection);

  const result = await coll.insertOne(document);
  return result;
}

/**
 * Update a document
 */
export async function updateDocument(
  uri: string,
  database: string,
  collection: string,
  filter: any,
  update: any
) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const coll = db.collection(collection);

  const result = await coll.updateOne(filter, { $set: update });
  return result;
}

/**
 * Delete a document
 */
export async function deleteDocument(
  uri: string,
  database: string,
  collection: string,
  filter: any
) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const coll = db.collection(collection);

  const result = await coll.deleteOne(filter);
  return result;
}

/**
 * Execute an aggregation pipeline
 */
export async function executeAggregation(
  uri: string,
  database: string,
  collection: string,
  pipeline: any[]
) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const coll = db.collection(collection);

  const startTime = Date.now();
  const results = await coll.aggregate(pipeline).toArray();
  const executionTime = Date.now() - startTime;

  return {
    results,
    executionTime,
  };
}

/**
 * Test connection
 */
export async function testConnection(uri: string): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await getMongoClient(uri);
    await client.db('admin').command({ ping: 1 });
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection failed',
    };
  }
}

/**
 * Get database statistics
 */
export async function getDatabaseStats(uri: string, database: string) {
  const client = await getMongoClient(uri);
  const db = client.db(database);
  const stats = await db.stats();
  return stats;
}
