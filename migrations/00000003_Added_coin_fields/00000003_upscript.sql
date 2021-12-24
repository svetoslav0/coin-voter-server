ALTER TABLE coins
ADD COLUMN date_added DATETIME DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN logo_url VARCHAR(255),
ADD COLUMN price DECIMAL(24, 16),
ADD COLUMN market_cap DECIMAL(24, 16),
ADD COLUMN is_presale INT DEFAULT 0,
ADD COLUMN website VARCHAR(255) NOT NULL,
ADD COLUMN telegram VARCHAR(255),
ADD COLUMN twitter VARCHAR(255),
ADD COLUMN contract_address VARCHAR(255);
