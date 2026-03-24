const { MongoClient } = require('mongodb');
async function test() {
    const client = new MongoClient('mongodb://127.0.0.1:27017');
    try {
        await client.connect();
        const db = client.db('football_turf');
        const cols = await db.listCollections().toArray();
        console.log("Collections:", cols.map(c => c.name));
        for (let c of ['bookings', 'booking', 'bokings', 'boking']) {
             const doc = await db.collection(c).findOne();
             if (doc) {
                 console.log(`\nFound doc in collection ${c}:`);
                 console.log(JSON.stringify(doc, null, 2));
             }
        }
    } catch (e) { console.error(e); } finally { await client.close(); }
}
test();
