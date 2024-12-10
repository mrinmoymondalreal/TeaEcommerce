import { config } from "dotenv";
import pg from "pg";

config();

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

async function insertProduct(product) {
  const { title, price, description, images } = product;
  const query = `
    INSERT INTO products (title, price, description, image_urls, stock)
    VALUES ($1, $2, $3, $4, 100)
    RETURNING product_id;
  `;
  const values = [title, price, description, images];

  try {
    const res = await pool.query(query, values);
    console.log("Product inserted:", res.rows[0].product_id);
    return res.rows[0];
  } catch (err) {
    console.error("Error inserting product:", err);
    throw err;
  }
}

fetch(
  "https://dummyjson.com/products/search?select=title,price,description,images&limit=20"
)
  .then((e) => e.json())
  .then((e) => {
    e.products.forEach(async (product) => {
      // console.log(product.images);
      await insertProduct({ ...product, price: product.price * 84 });
    });
    // process.exit(0);
  });
