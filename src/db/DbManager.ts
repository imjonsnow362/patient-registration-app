import { PGliteWorker } from '@electric-sql/pglite/worker';

let db: PGliteWorker | null = null;

const initSchema = async (database: PGliteWorker) => {
  await database.query(`
    CREATE TABLE IF NOT EXISTS patients (
      id SERIAL PRIMARY KEY,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      date_of_birth TEXT NOT NULL,
      gender TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      address TEXT,
      height_cm REAL,
      weight_kg REAL, 
      allergies TEXT, 
      medical_notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Add columns if they don't exist (migrations)
  // This is a common pattern for "add column if not exists" in PostgreSQL.
  // It checks pg_catalog.pg_attribute to see if the column exists.
  // Each ALTER TABLE should be its own query for better error handling.

  // Add height_cm
  const heightCmExists = await database.query(`
    SELECT 1 FROM pg_catalog.pg_attribute
    WHERE attrelid = 'patients'::regclass
    AND attname = 'height_cm';
  `);
  if (heightCmExists.rows.length === 0) {
    console.log("Adding column: height_cm");
    await database.query(`ALTER TABLE patients ADD COLUMN height_cm REAL;`);
  }

  // Add weight_kg
  const weightKgExists = await database.query(`
    SELECT 1 FROM pg_catalog.pg_attribute
    WHERE attrelid = 'patients'::regclass
    AND attname = 'weight_kg';
  `);
  if (weightKgExists.rows.length === 0) {
    console.log("Adding column: weight_kg");
    await database.query(`ALTER TABLE patients ADD COLUMN weight_kg REAL;`);
  }

  // Add allergies
  const allergiesExists = await database.query(`
    SELECT 1 FROM pg_catalog.pg_attribute
    WHERE attrelid = 'patients'::regclass
    AND attname = 'allergies';
  `);
  if (allergiesExists.rows.length === 0) {
    console.log("Adding column: allergies");
    await database.query(`ALTER TABLE patients ADD COLUMN allergies TEXT;`);
  }

  // Add medical_notes if it was missing (though it seems to be there)
  const medicalNotesExists = await database.query(`
    SELECT 1 FROM pg_catalog.pg_attribute
    WHERE attrelid = 'patients'::regclass
    AND attname = 'medical_notes';
  `);
  if (medicalNotesExists.rows.length === 0) {
    console.log("Adding column: medical_notes");
    await database.query(`ALTER TABLE patients ADD COLUMN medical_notes TEXT;`);
  }

  // Ensure index exists
  await database.query(`
    CREATE INDEX IF NOT EXISTS idx_patient_name ON patients (last_name, first_name);
  `);

  console.log("Database schema initialized and migrated if necessary");
};

export const initDatabase = async (): Promise<PGliteWorker> => {
  if (!db) {
    try {
      const workerInstance = new Worker(new URL('/pglite-worker.js', import.meta.url), {
        type: 'module',
      });
      db = new PGliteWorker(workerInstance);
      await initSchema(db);
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
  return db;
};

export const registerPatient = async (patientData: any): Promise<any> => {
  const database = await initDatabase();
  const {
    first_name,
    last_name,
    date_of_birth,
    gender,
    email,
    phone,
    address,
    height_cm,
    weight_kg,
    allergies,
    medical_notes
  } = patientData;

  const result = await database.query(
    `INSERT INTO patients 
      (first_name, last_name, date_of_birth, gender, email, phone, address, height_cm, weight_kg, allergies, medical_notes) 
     VALUES 
      ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     RETURNING id`,
    [
      first_name,
      last_name,
      date_of_birth,
      gender,
      email || null,
      phone || null,
      address || null,
      height_cm ?? null,
      weight_kg ?? null,
      allergies || null,
      medical_notes || null,
    ]
  );

  return result.rows?.[0];
};

export const getAllPatients = async (): Promise<any[]> => {
  const database = await initDatabase();
  try {
    const result = await database.query(
      "SELECT * FROM patients ORDER BY last_name, first_name"
    );
    return result.rows || [];
  } catch (error) {
    console.error('Error executing getAllPatients query:', error);
    throw error;
  }
};

export const searchPatientsByName = async (
  searchTerm: string
): Promise<any[]> => {
  const database = await initDatabase();
   try {
    const result = await database.query(
      `SELECT * FROM patients
       WHERE first_name ILIKE $1 OR last_name ILIKE $2
       ORDER BY last_name, first_name`,
      [`%${searchTerm}%`, `%${searchTerm}%`]
    );
    return result.rows || [];
   } catch (error) {
      console.error('Error executing searchPatientsByName query:', error);
      throw error;
   }
};

export const executeQuery = async (
  sqlQuery: string,
  params: any[] = []
): Promise<any> => {
  try {
    const database = await initDatabase();
    const result = await database.query(sqlQuery, params);
    return { success: true, data: result.rows || [], error: null };
  } catch (error: any) {
    console.error("Query execution error:", error);
    return {
      success: false,
      data: [],
      error: error.message || "An error occurred while executing the query",
    };
  }
};