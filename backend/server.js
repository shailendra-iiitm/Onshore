const dotenv      = require('dotenv');
const app         = require('./app');
const connectMongo = require('./src/config/db');
dotenv.config();
const PORT = process.env.PORT || 5000;
connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
