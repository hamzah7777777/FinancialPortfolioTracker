-- Create the database
CREATE DATABASE StockPortfolioDB;

-- Use the database
USE StockPortfolioDB;

-- Create the Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL -- Optional: Track last login time
);

-- Insert sample user into the Users table
INSERT INTO Users (username, email)
VALUES ('john_doe', 'john@example.com');



-- Create the Stocks table
CREATE TABLE Stocks (
    stock_id INT AUTO_INCREMENT PRIMARY KEY,
    ticker_symbol VARCHAR(10) NOT NULL UNIQUE,
    company_name VARCHAR(255),
    sector VARCHAR(100),
    industry VARCHAR(100)
);

-- Insert sample data into the Stocks table
INSERT INTO Stocks (ticker_symbol, company_name, sector, industry)
VALUES
('AAPL', 'Apple Inc.', 'Technology', 'Consumer Electronics'),
('MSFT', 'Microsoft Corporation', 'Technology', 'Software'),
('GOOGL', 'Alphabet Inc.', 'Technology', 'Internet Services'),
('AMZN', 'Amazon.com Inc.', 'Consumer Discretionary', 'Internet & Direct Marketing Retail'),
('TSLA', 'Tesla Inc.', 'Consumer Discretionary', 'Automobiles');


-- Create the Portfolio table
CREATE TABLE Portfolio (
    portfolio_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    stock_id INT,
    quantity INT NOT NULL,
    purchase_price DECIMAL(10, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES Stocks(stock_id) ON DELETE CASCADE
);

-- Insert sample portfolio data
INSERT INTO Portfolio (user_id, stock_id, quantity, purchase_price, purchase_date)
VALUES
(1, 1, 10, 145.67, '2023-08-01'),
(1, 2, 5, 289.32, '2023-07-15'),
(1, 3, 8, 2450.50, '2023-06-20');

-- Create the Transactions table
CREATE TABLE Transactions (
    transaction_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    stock_id INT,
    portfolio_id INT, -- Optional: Direct link to Portfolio
    transaction_type ENUM('buy', 'sell') NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    transaction_fee DECIMAL(10, 2) DEFAULT 0.00, -- Optional: Track transaction fees
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (stock_id) REFERENCES Stocks(stock_id) ON DELETE CASCADE,
    FOREIGN KEY (portfolio_id) REFERENCES Portfolio(portfolio_id) ON DELETE CASCADE -- Optional foreign key
);





-- Insert sample transactions
INSERT INTO Transactions (user_id, stock_id, transaction_type, quantity, price)
VALUES
(1, 1, 'buy', 10, 145.67),
(1, 2, 'buy', 5, 289.32),
(1, 3, 'buy', 8, 2450.50);
