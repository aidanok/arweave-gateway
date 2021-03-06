/* eslint-disable no-undef */
/* eslint-disable camelcase */

// PRIMARY KEYS
// transaction_id
// block_id
// block_height
// owner_id
// app_name

// TABLES
// user -- don't need to start
// block
// - indep_hash (string)
// - height (integer)
// - timestamp (timestamp)
// - raw_data (JSON)
// transaction
// - id (string)
// - block_hash (string)
// - raw_data (JSON)
// - owner (string)

exports.shorthands = undefined;

exports.up = pgm => {
  pgm.createTable("blocks", {
    hash: {
      type: "varchar(64)",
      notNull: true,
      primaryKey: true,
      unique: true
    },
    height: {
      type: "integer",
      notNull: true,
      unique: true
    },
    timestamp: {
      type: "bigint",
      notNull: true
    },
    rawData: {
      type: "jsonb",
      notNull: true
    }
  });
  pgm.createIndex("blocks", "height");

  pgm.createTable("transactions", {
    id: {
      type: "varchar(43)",
      notNull: true,
      primaryKey: true,
      unique: true
    },
    blockHash: {
      type: "varchar(64)",
      references: "blocks",
      onDelete: "cascade"
    },
    rawData: {
      type: "jsonb",
      notNull: true
    },
    ownerAddress: {
      type: "varchar(43)",
      notNull: true
    },
    tags: {
      type: "jsonb",
      notNull: true
    },
    appName: {
      type: "varchar(64)",
      notNull: true
    }
  });
  pgm.createIndex("transactions", "blockHash");
  pgm.createIndex("transactions", "ownerAddress");
  pgm.createIndex("transactions", "appName");
};

exports.down = pgm => {
  pgm.dropTable("transactions");
  pgm.dropTable("blocks");
};
