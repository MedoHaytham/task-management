const mongoose = require('mongoose');

exports.connectTestDB = async () => {
  await mongoose.connect(process.env.TEST_DATABASE_URI);
};

exports.clearTestDB = async () => {
  const { collections } = mongoose.connection;
  const promises = Object.values(collections).map(collection =>
    collection.deleteMany({})
  );
  await Promise.all(promises);
};

exports.closeTestDB = async () => {
  await mongoose.connection.dropDatabase(); // بيمسح managetasks_test بس، مش الأصلية
  await mongoose.connection.close();
};