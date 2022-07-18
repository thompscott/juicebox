const { Client } = require('pg');

const client = new Client('postgres://localhost:5432/juicebox-dev');

async function createUser({ username, password, name, location }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO users(username, password, name, location) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (username) DO NOTHING 
      RETURNING *;
    `,
      [username, password, name, location]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function updateUser(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [user],
    } = await client.query(
      `
      UPDATE users
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return user;
  } catch (error) {
    throw error;
  }
}

async function getAllUsers() {
  const { rows } = await client.query(
    `SELECT id, username, password, name, location, active
    FROM users;
  `
  );

  return rows;
}

/*Posts*/
async function createPost({ authorId, title, content }) {
  try {
    const { rows } = await client.query(
      `
      INSERT INTO posts("authorId", title, content) 
      VALUES($1, $2, $3) 
      RETURNING *;
    `,
      [authorId, title, content]
    );

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getAllPosts() {
  const { rows } = await client.query(
    `SELECT "authorId", title, content, id
    FROM posts;
  `
  );

  return rows;
}

async function updatePost(id, fields = {}) {
  // build the set string
  const setString = Object.keys(fields)
    .map((key, index) => `"${key}"=$${index + 1}`)
    .join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
    const {
      rows: [post],
    } = await client.query(
      `
      UPDATE posts
      SET ${setString}
      WHERE id=${id}
      RETURNING *;
    `,
      Object.values(fields)
    );

    return post;
  } catch (error) {
    throw error;
  }
}

async function getPostsByUser(userId) {
  try {
    const { rows } = await client.query(`
      SELECT * FROM posts
      WHERE "authorId"=${userId};
    `);

    return rows;
  } catch (error) {
    throw error;
  }
}

async function getUserById(userId) {
  // first get the user (NOTE: Remember the query returns
  try {
    const { rows } = await client.query(`
    SELECT id, username, name, location, active FROM users
    WHERE id=${userId};
  `);
    if (!rows.length) {
      return null;
    }

    const post = await getPostsByUser(userId);
    rows[0].posts = post;

    return rows;
  } catch (error) {
    throw error;
  }
}

/*Tags*/
async function createTags(tagList) {
  if (tagList.length === 0) { 
    return; 
  }

  // need something like: $1), ($2), ($3 
  const insertValues = tagList.map(
    (_, index) => `$${index + 1}`).join('), (');
  // then we can use: (${ insertValues }) in our string template

  // need something like $1, $2, $3
  const selectValues = tagList.map(
    (_, index) => `$${index + 1}`).join(', ');
  // then we can use (${ selectValues }) in our string template

  try {
    await client.query(
      `
      INSERT INTO tags(name) 
      VALUES ${insertValues} 
      ON CONFLICT (name) DO NOTHING;
    `,
      insertValues
    );
    const { rows } = await client.query(
      `
      SELECT * FROM tags
      WHERE name
      IN (${selectValues})
      `,
      selectValues
    )

    return rows;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getPostsByUser,
  getUserById,
  createTags
};
