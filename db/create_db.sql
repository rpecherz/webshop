CREATE DATABASE shop_db;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0)
);

CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT DEFAULT 1 CHECK (quantity > 0),
    UNIQUE (user_id, product_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Testing data

INSERT INTO users (email, password, is_admin) VALUES 
('admin@example.com', 'hashed_password_admin', TRUE),
('user@example.com', 'hashed_password_user', FALSE);

INSERT INTO products (name, image_url, price) VALUES 
('Laptop', '/images/laptop.jpg', 3999.99),
('Telefon', '/images/phone.jpg', 1999.50);

INSERT INTO carts (user_id, product_id, quantity) VALUES 
(2, 1, 1),
(2, 2, 2);
