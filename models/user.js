/** User class for message.ly */

const { BCRYPT_WORK_FACTOR } = require("../config");
const bcrypt = require('bcrypt');
const ExpressError = require("../expressError")
const db = require("../db");




/** User of the site. */

class User {

  /** register new user -- returns
   *    {username, password, first_name, last_name, phone}
   */

  static async register({username, password, first_name, last_name, phone}) {
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const results = await db.query(
      `INSERT INTO users (username, password, first_name, last_name, phone, join_at, last_login_at)
      VALUES ($1, $2, $3, $4, $5, current_timestamp, current_timestamp) 
      RETURNING username, password, first_name, last_name, phone`,
      [username, hashedPassword, first_name, last_name, phone]);
    return results.rows[0];
   }

  /** Authenticate: is this username/password valid? Returns boolean. */

  static async authenticate(username, password) {
    const results = await db.query(
      `SELECT password
      FROM users
      WHERE username = $1`,
      [username]);
    const user = results.rows[0]
    if (user){
      return await bcrypt.compare(password, user.password)
    }
    return false;
   }

  /** Update last_login_at for user */

  static async updateLoginTimestamp(username) {
    const results = await db.query(
      `UPDATE users
      SET last_login_at = current_timestamp
      WHERE username = $1 RETURNING username`,
      [username]);
      if (!results.rows[0]){
        throw new ExpressError('User not found', 404)
      }
   }

  /** All: basic info on all users:
   * [{username, first_name, last_name, phone}, ...] */

  static async all() { 
    const results = await db.query(
      `SELECT username, first_name, last_name, phone
      FROM users ORDER BY username`);
    return results.rows
  }

  /** Get: get user by username
   *
   * returns {username,
   *          first_name,
   *          last_name,
   *          phone,
   *          join_at,
   *          last_login_at } */

  static async get(username) {
    const results = await db.query(
      `SELECT username, first_name, last_name, phone, join_at, last_login_at
      FROM users
      WHERE username = $1`,
      [username]);
    if (!results.rows[0]){
      throw new ExpressError('User not found', 404)
    }
    return results.rows[0]
   }

  /** Return messages from this user.
   *
   * [{id, to_user, body, sent_at, read_at}]
   *
   * where to_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesFrom(username) {
    const results = await db.query(
      `SELECT m.id,
      m.body, 
      m.sent_at, 
      m.read_at,
      t.username,
      t.first_name,
      t.last_name, 
      t.phone
      FROM messages AS m
      INNER JOIN users as t ON m.to_username = t.username
      WHERE m.from_username = $1`,
      [username]);
    let m = results.rows;
    if (!m){
      throw new ExpressError('User not found', 404);
    }
    return results.rows.map(m => ({
      id: m.id,
      to_user: {
        username: m.to_username,
        first_name: m.first_name,
        last_name: m.last_name, 
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
   }

  /** Return messages to this user.
   *
   * [{id, from_user, body, sent_at, read_at}]
   *
   * where from_user is
   *   {username, first_name, last_name, phone}
   */

  static async messagesTo(username) {
    const results = await db.query(
      `SELECT m.id,
      m.body, 
      m.sent_at, 
      m.read_at,
      f.username,
      f.first_name,
      f.last_name, 
      f.phone
      FROM messages as m
      INNER JOIN users as f on m.from_username = f.username
      WHERE m.to_username = $1`,
      [username]);
    let m = results.rows;
    if (!m){
      throw new ExpressError('User not found', 404);
    }
    return results.rows.map(m => ({
      id: m.id,
      from_user: {
        username: m.from_username,
        first_name: m.first_name,
        last_name: m.last_name,
        phone: m.phone
      },
      body: m.body,
      sent_at: m.sent_at,
      read_at: m.read_at
    }));
   }
}


module.exports = User;