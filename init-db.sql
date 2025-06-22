-- Create tables for Perena Protocol dashboard

-- Pools table
CREATE TABLE IF NOT EXISTS pools (
  id VARCHAR PRIMARY KEY,
  name VARCHAR NOT NULL,
  token_a VARCHAR NOT NULL,
  token_b VARCHAR NOT NULL,
  tvl DECIMAL,
  volume_24h DECIMAL,
  fees_24h DECIMAL,
  apr DECIMAL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Price history
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  token_mint VARCHAR NOT NULL,
  price DECIMAL NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Token holders
CREATE TABLE IF NOT EXISTS token_holders (
  wallet_address VARCHAR PRIMARY KEY,
  balance DECIMAL NOT NULL,
  percentage DECIMAL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions
CREATE TABLE IF NOT EXISTS transactions (
  signature VARCHAR PRIMARY KEY,
  type VARCHAR NOT NULL,
  amount DECIMAL,
  from_wallet VARCHAR,
  to_wallet VARCHAR,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_price_history_token_mint ON price_history(token_mint);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp);
CREATE INDEX IF NOT EXISTS idx_token_holders_balance ON token_holders(balance DESC); 