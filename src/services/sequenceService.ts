import pool from "../config/db";

export class SequenceService {
  static isValidSequence(sequence: string): boolean {
    return /^[ATGC]+$/i.test(sequence);
  }

  static analyzeSequence(sequence: string) {
    const seq = sequence.toUpperCase();
    const length = seq.length;

    const gcCount = (seq.match(/[GC]/g) || []).length;
    const gcContent = length > 0 ? ((gcCount / length) * 100).toFixed(2) : "0.00";

    const complementMap: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
    const reverseComplement = seq
      .split("")
      .reverse()
      .map((base) => complementMap[base])
      .join("");

    return { length, gcContent, reverseComplement };
  }

  static async createSequence(userId: number, sequence: string, description?: string) {
    if (!this.isValidSequence(sequence)) {
      return {
        success: false,
        message: "Invalid DNA sequence. Only A, T, G, C allowed.",
      };
    }
    const analysis = this.analyzeSequence(sequence);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS sequences (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sequence TEXT NOT NULL,
    description VARCHAR(255),
    length INT,
    gc_content DECIMAL(5,2),
    reverse_complement TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    const query = "INSERT INTO sequences (user_id, sequence, description, length, gc_content, reverse_complement) VALUES (?, ?, ?, ?, ?, ?)";
    const [result]: any = await pool.execute(query, [userId, sequence, description, analysis.length, analysis.gcContent, analysis.reverseComplement]);

    if (result.affectedRows === 0) {
      return {
        success: false,
        message: "Failed to save sequence."
      };
    }

    const sequenceId = result.insertId;
    const [rows]: any = await pool.execute(
      "SELECT id, user_id, sequence, description, length, gc_content, reverse_complement, created_at FROM sequences WHERE id = ?",
      [sequenceId]
    );

    const createdSequence = rows[0];


    return {
      success: true,
      message: "Sequence saved successfully.",
      data: createdSequence,
    };
  }

  static async searchSequences(keywordOrId: string | number) {
    let query = "";
    let params: (string | number)[] = [];

    if (typeof keywordOrId === "number") {
      query = "SELECT * FROM sequences WHERE id = ?";
      params = [keywordOrId];
    } else {
      query = `
      SELECT * FROM sequences
      WHERE description LIKE ? OR sequence LIKE ?
    `;
      const keywordPattern = `%${keywordOrId}%`;
      params = [keywordPattern, keywordPattern];
    }

    const [rows]: any = await pool.execute(query, params);
    return rows;
  }

  static async getUserSequences(userId: number) {
    try {
      const query = `
        SELECT id, sequence, description, length, gc_content, reverse_complement, created_at
        FROM sequences
        WHERE user_id = ?
        ORDER BY created_at DESC
      `;
      const [rows]: any = await pool.execute(query, [userId]);

      return {
        success: rows.length > 0 ? true : false,
        message: rows.length > 0 ? "User sequences fetched successfully" : "No sequences found",
        data: rows,
      };
    } catch (error) {
      console.error(error);
      return {
        success: false,
        message: "Failed to fetch sequences",
      };
    }
  }

  static async getAllSequences() {
    const query = `
      SELECT 
        s.id,
        s.user_id,
        s.sequence,
        s.description,
        s.length,
        s.gc_content,
        s.reverse_complement,
        s.created_at,
        u.email,
        u.firstname,
        u.lastname
      FROM sequences s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
    `;

    const [rows]: any = await pool.execute(query);

    if (rows.length === 0) {
      return {
        success: false,
        message: "No sequences found",
      };
    }

    return {
      success: true,
      message: "Sequences fetched successfully",
      data: rows,
    };
  }
}
