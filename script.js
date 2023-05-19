const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/farmmart');

  // use `await mongoose.connect('mongodb://user:password@127.0.0.1:27017/test');` if your database has auth enabled

  const itemSchema = new mongoose.Schema({
    name: String,
    price: Number
  });

  const Veggie = mongoose.model('Veggie', itemSchema);

  const beetroot = new Veggie({ name: 'beetroot' });
 

  await beetroot.save();
}
