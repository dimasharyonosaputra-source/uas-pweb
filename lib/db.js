import mysql from 'mysql2/promise';

// Ganti string di dalam tanda kutip ini dengan MYSQL_URL yang kamu salin dari Railway
const databaseUrl = 'mysql://root:dEBqDRNVJTSJgSxawULqLfIucJikpXsT@turntable.proxy.rlwy.net:17769/railway';

const pool = mysql.createPool(databaseUrl);

export { pool as db }; 
export default pool;