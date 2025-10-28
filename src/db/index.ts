import mysql from "mysql2/promise";

const db = mysql.createPool(process.env.AIVEN_CONNECTION_URL!);

export default db;
