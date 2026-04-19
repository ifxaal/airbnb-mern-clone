require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Property = require('./models/Property');
  const props = await Property.find();
  console.log(JSON.stringify(props, null, 2));
  process.exit(0);
}).catch(console.error);
