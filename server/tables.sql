-- Users table to store user information
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Products table to store tea leaves information
CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  stock INT NOT NULL,
  image_urls VARCHAR[] -- Column to store array of image links of the product
  variant VARCHAR(100), -- Column to store product variant
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table to store order information
CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(user_id),
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order items table to store details of each product in an order
CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(order_id),
  product_id INT REFERENCES products(product_id),
  quantity INT NOT NULL,
  price DECIMAL(10, 2) NOT NULL
);

-- Order tracking table to store tracking information for orders
CREATE TABLE order_tracking (
  tracking_id SERIAL PRIMARY KEY,
  order_id INT REFERENCES orders(order_id),
  status VARCHAR(50) NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Ratings table to store product ratings
CREATE TABLE ratings (
  rating_id SERIAL PRIMARY KEY,
  product_id INT REFERENCES products(product_id),
  user_id INT REFERENCES users(user_id),
  rating INT CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);