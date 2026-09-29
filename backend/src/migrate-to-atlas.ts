import { MongoClient } from 'mongodb';

const LOCAL_URI = 'mongodb://127.0.0.1:27017/live_leaderboard_db';
const ATLAS_URI = 'mongodb+srv://kavin88701:KAVIN123@cluster0.mwrpznk.mongodb.net/live_leaderboard_db?retryWrites=true&w=majority';

async function migrate() {
  console.log('🚀 Starting Data Migration to MongoDB Atlas...');
  const localClient = new MongoClient(LOCAL_URI);
  const atlasClient = new MongoClient(ATLAS_URI);

  try {
    await localClient.connect();
    console.log('✓ Connected to Local MongoDB');

    await atlasClient.connect();
    console.log('✓ Connected to MongoDB Atlas Cluster');

    const localDb = localClient.db('live_leaderboard_db');
    const atlasDb = atlasClient.db('live_leaderboard_db');

    const collections = await localDb.listCollections().toArray();
    console.log(`Found ${collections.length} collections to migrate:`, collections.map((c) => c.name));

    for (const colInfo of collections) {
      const colName = colInfo.name;
      if (colName.startsWith('system.')) continue;

      const localCol = localDb.collection(colName);
      const atlasCol = atlasDb.collection(colName);

      const docs = await localCol.find({}).toArray();
      console.log(`\n📦 Migrating '${colName}' (${docs.length} documents)...`);

      // Clear existing in Atlas before fresh migration
      await atlasCol.deleteMany({});

      if (docs.length > 0) {
        await atlasCol.insertMany(docs);
      }

      // Copy indexes (excluding default _id index)
      try {
        const indexes = await localCol.indexes();
        for (const idx of indexes) {
          if (idx.name === '_id_') continue;
          const { key, name, unique, sparse } = idx;
          await atlasCol.createIndex(key, { name, unique, sparse });
        }
      } catch (idxErr: any) {
        console.warn(`  Notice copying index on ${colName}:`, idxErr.message);
      }

      const atlasCount = await atlasCol.countDocuments();
      console.log(`✓ '${colName}' successfully migrated! Verified Atlas Count: ${atlasCount}`);
    }

    console.log('\n=======================================================');
    console.log('🎉 ALL DATA SUCCESSFULLY MIGRATED TO MONGODB ATLAS!');
    console.log('=======================================================');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await localClient.close();
    await atlasClient.close();
  }
}

migrate();
