import bcrypt from "bcrypt";
import pool from "../config/db";
import { RegisterInput, AuthResponse, LoginInput } from "../types/auth.types";
import { HashUtils } from "../utils/hashUtil";
import { JWTUtils } from "../utils/jwtUtil";


export class AuthService {
  static async register(user: RegisterInput): Promise<AuthResponse> {
    const { email, password, firstname, lastname } = user;
    const hashedPassword = await HashUtils.hashPassword(password);
    const [existingUser]: any = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);

    if (existingUser.length > 0) {
      return {
        success: false,
        message: 'Email already exists',
      };
    }


    await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      firstname VARCHAR(255),
      lastname VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

    const query = 'INSERT INTO users (email, password, firstname, lastname) VALUES (?, ?, ?, ?)';
    const result = await pool.execute(query, [email, hashedPassword, firstname, lastname]);

    if ((result as any)[0].affectedRows === 0) {
      return {
        success: false,
        message: 'Registration failed',
      };
    }

    const userId = (result as any)[0].insertId;
    const [rows]: any = await pool.execute('SELECT id, email, firstname, lastname FROM users WHERE id = ?', [userId]);

    const createdUser = rows[0];

    return {
      success: true,
      message: 'User registered successfully',
      data: {
        user: createdUser,
      }
    };
  }

  static async login(user: LoginInput): Promise<AuthResponse> {
    const { email, password } = user;

    const [rows]: any = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }
    const foundUser = rows[0];

    const isPasswordValid = await bcrypt.compare(password, foundUser.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid email or password',
      };
    }
    const token = JWTUtils.generateToken({ id: foundUser.id, email: foundUser.email });

    return {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: foundUser.id,
          email: foundUser.email,
          firstname: foundUser.firstname,
          lastname: foundUser.lastname,
        },
        accessToken: token,
      },
    };
  }


}