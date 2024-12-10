import { config } from "dotenv";
import express from "express";
import pg from "pg";
import cors from "cors";

import { hostname, type } from "os";
import { formValidator, validatorMiddleware } from "./validator.js";
import { z } from "zod";

import Google from "@auth/express/providers/google";
import { ExpressAuth, getSession } from "@auth/express";
import { createOrder, getkeyId, init, verifyPayment } from "./payment.js";
import { redirect } from "react-router-dom";

config();

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.use(
  cors({
    origin: [
      `${process.env.FRONTEND_URL}`,
      "http://localhost:4173",
      `http://localhost:${PORT}`,
      `http://${hostname()}:${PORT}`,
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("trust proxy", true);

const authConfig = {
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECERT,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const { name, email } = user;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        const result = await client.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );

        if (result.rows.length === 0) {
          const result2 = await client.query(
            "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING user_id",
            [name, email]
          );
        }

        await client.query("COMMIT");
      } catch (err) {
        console.log(err);
        await client.query("ROLLBACK");
      } finally {
        client.release();
      }
      return true;
    },
    async session({ session, token, user }) {
      const { user_id } = (
        await pool.query("SELECT user_id FROM users WHERE email = $1", [
          session.user.email,
        ])
      ).rows[0];
      session.user = { ...session.user, user_id };
      return session;
    },
  },
};

const props = ExpressAuth(authConfig);

app.use("/auth/*", props);

// // Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

app.get("/", (req, res) => {
  res.redirect(`${process.env.FRONTEND_URL}`);
});

// Route to place an order
app.post("/orders", async (req, res) => {
  const { user_id, cart_items } = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const orderResult = await client.query(
        "INSERT INTO orders (user_id) VALUES ($1) RETURNING *",
        [user_id]
      );
      const orderId = orderResult.rows[0].order_id;

      const orderItemsPromises = cart_items.map((item) => {
        return client.query(
          "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)",
          [orderId, item.product_id, item.quantity]
        );
      });

      await Promise.all(orderItemsPromises);
      await client.query("COMMIT");
      res.status(201).json({ order_id: orderId });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ status: "error", data: null, error: err.message });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get all products
app.get("/products", async (req, res) => {
  try {
    const { skip, limit } = req.query;

    // const result = await pool.query(
    //   "SELECT title, image_urls, price, stock FROM products limit $2 offset $1",
    //   [skip || 0, limit || 5]
    // );

    const combinedQuery = `
      SELECT p.title, p.image_urls, p.price, p.stock, COALESCE(r.sum, 0) as rating, COALESCE(r.count, 0) as count
      FROM products p
      LEFT JOIN (
      SELECT product_id, SUM(rating) as sum, COUNT(*) as count
      FROM ratings
      GROUP BY product_id
      ) r ON p.product_id = r.product_id
      LIMIT $2 OFFSET $1
    `;

    const combinedResult = await pool.query(combinedQuery, [
      skip || 0,
      limit || 5,
    ]);

    const rows = combinedResult.rows.map((row) => {
      row.rating = row.count > 0 ? row.sum / row.count : 0;
      row.in_stock = row.stock > 0;
      delete row.stock;
      return row;
    });

    res.json(rows);
    // result.rows = await Promise.all(
    //   result.rows.map(async (row) => {
    //     row.price = parseFloat(row.price, 1);
    //     const result = await pool.query(
    //       "SELECT sum(rating), count(*) FROM ratings WHERE product_id = $1",
    //       [row.product_id]
    //     );
    //     const { count, sum } = result.rows;
    //     row.in_stock = row.stock > 0;
    //     delete row.stock;
    //     row.rating = count > 0 ? sum / count : 0;
    //     row.count = count || 0;
    //     return row;
    //   })
    // );

    // res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/search", async (req, res) => {
  try {
    const { q: query } = req.query;
    const result = await pool.query(
      `SELECT p.title, p.image_urls, p.price, p.stock, COALESCE(r.sum, 0) as rating, COALESCE(r.count, 0) as count
      FROM products p
      LEFT JOIN (
        SELECT product_id, SUM(rating) as sum, COUNT(*) as count
        FROM ratings
        GROUP BY product_id
      ) r ON p.product_id = r.product_id WHERE title ILIKE '%${query}%'`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get a single product by ID
app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE product_id = $1 limit 1",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get a single product by name
app.get("/product/name/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const formattedName = name.replace(/_/g, " ");
    const result = await pool.query(
      `SELECT p.*, COALESCE(r.sum, 0) as rating, COALESCE(r.count, 0) as count
      FROM products p
      LEFT JOIN (
        SELECT product_id, SUM(rating) as sum, COUNT(*) as count
        FROM ratings
        GROUP BY product_id
      ) r ON p.product_id = r.product_id WHERE title ILIKE $1 LIMIT 1`,
      [`%${formattedName}%`]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const login = formValidator({
  email: z.string().email(),
  password: z.string().min(8),
});
const signup = formValidator({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

app.post("/api/signin", validatorMiddleware(login), (req, res, next) => {
  res.send({ status: 200, data: "" });
});

app.post("/api/signup", validatorMiddleware(signup), async (req, res, next) => {
  res.send({ status: 200, data: "" });
});

app.get("/api/user", async (req, res) => {
  try {
    const session = await getSession(req, authConfig);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.json(session.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Route to get all orders for a user
app.get("/api/orders", async (req, res) => {
  const session = await getSession(req, authConfig);

  if (!session) {
    return res
      .status(400)
      .send({ status: 400, error: "User not authenticated" });
  }

  const { user_id } = session.user;

  try {
    const result = await pool.query("SELECT * FROM orders WHERE user_id = $1", [
      user_id,
    ]);
    res.json({ status: 200, data: result.rows });
  } catch (err) {
    res.status(500).json({ status: 500, error: err.message });
  }
});

// Route to add or update a rating for a product
app.post("/api/rating", async (req, res) => {
  const { user_id, product_id, rating, review = "" } = req.body;

  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const existingRating = await client.query(
        "SELECT * FROM ratings WHERE user_id = $1 AND product_id = $2",
        [user_id, product_id]
      );

      if (existingRating.rows.length > 0) {
        await client.query(
          "UPDATE ratings SET rating = $1, review = $2, created_at = CURRENT_TIMESTAMP WHERE user_id = $3 AND product_id = $4",
          [rating, review, user_id, product_id]
        );
      } else {
        await client.query(
          "INSERT INTO ratings (user_id, product_id, rating, review) VALUES ($1, $2, $3, $4)",
          [user_id, product_id, rating, review]
        );
      }

      await client.query("COMMIT");
      res.status(200).json({ status: "success" });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ status: "error", error: err.message });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ status: "error", error: err.message });
  }
});

init();

const order_map = new Map();

// Route to create a new order
app.post("/api/order", async (req, res) => {
  const { user_id, total_amount, items } = req.body;
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const orderResult = await client.query(
        "INSERT INTO orders (user_id, total_amount, status) VALUES ($1, $2, 'WAITING') RETURNING *",
        [user_id, total_amount]
      );
      const orderId = orderResult.rows[0].order_id;

      const orderItemsPromises = items.map((item) => {
        return client.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)",
          [orderId, item.product_id, item.quantity, item.price]
        );
      });

      await Promise.all(orderItemsPromises);
      await client.query("COMMIT");

      const amount = parseInt(total_amount * 100),
        receipt_id = "receipt-#order-id_" + orderId;

      const result = await createOrder(amount, receipt_id);
      if (result) {
        order_map.set(result.id, receipt_id);
        return res.json({
          status: 200,
          data: { keyId: getkeyId(), orderId: result.id },
        });
      }
      res.json({ status: 200, error: "FAILED" });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ status: "error", data: null, error: err.message });
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/handle_success", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const reciept_id = order_map.get(razorpay_order_id);
  const isValid = verifyPayment(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  );
  if (!isValid) return res.redirect(`${process.env.FRONTEND_URL}/order_failed`);

  const orderid = reciept_id.split("_")[1];

  await pool.query("UPDATE orders SET status = 'PAID' WHERE order_id = $1", [
    orderid,
  ]);

  res.redirect(`${process.env.FRONTEND_URL}/order_success`);
});

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
