const {
  client,
  getAllUsers,
  createUser,
  updateUser,
  getAllPosts,
  createPost,
  updatePost,
  getPostsByUser,
  getUserById,
  createTags,
  createPostTag,
  getPostById,
  addTagsToPost,
  getPostsByTagName,
} = require('./index');

async function dropTables() {
  try {
    console.log('Starting to drop tables...');

    await client.query(`
    DROP TABLE IF EXISTS post_tags;
    DROP TABLE IF EXISTS tags;
    DROP TABLE IF EXISTS posts;
    DROP TABLE IF EXISTS users CASCADE;
    `);

    console.log('Finished dropping tables!');
  } catch (error) {
    console.error('Error dropping tables!');
    throw error;
  }
}

async function createTables() {
  try {
    console.log('Starting to build tables...');

    await client.query(`
      CREATE TABLE users (
        id SERIAL PRIMARY KEY,
        username varchar(255) UNIQUE NOT NULL,
        password varchar(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    await client.query(`
      CREATE TABLE posts (
        id SERIAL PRIMARY KEY,
        "authorId" INT REFERENCES users(id) NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        active BOOLEAN DEFAULT true
      );
    `);

    await client.query(`
    CREATE TABLE tags (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) UNIQUE NOT NULL
    )`);

    await client.query(`
    CREATE TABLE post_tags (
      "postId" INTEGER REFERENCES posts(id),
      "tagId" INTEGER REFERENCES tags(id),
      UNIQUE ("postId", "tagId")
    );
`);

    console.log('Finished building tables!');
  } catch (error) {
    console.error('Error building tables!');
    throw error;
  }
}

async function createInitialUsers() {
  try {
    console.log('Starting to create users...');

    await createUser({
      username: 'albert',
      password: 'bertie99',
      name: 'Al Bert',
      location: 'Sidney, Australia',
      active: true,
    });
    await createUser({
      username: 'sandra',
      password: '2sandy4me',
      name: 'Just Sandra',
      location: "Ain't tellin'",
      active: true,
    });
    await createUser({
      username: 'glamgal',
      password: 'soglam',
      name: 'Joshua',
      location: 'Upper East Side',
      active: true,
    });
    await createUser({
      username: 'glamgalDelete',
      password: 'soglam',
      name: 'Joshua',
      location: 'Upper East Side',
      active: true,
    });
    await createUser({
      username: 'glamgalDelete2',
      password: 'soglam',
      name: 'Joshua',
      location: 'Upper East Side',
      active: true,
    });
    await createUser({
      username: 'glamgalDelete3',
      password: 'soglam',
      name: 'Joshua',
      location: 'Upper East Side',
      active: true,
    });

    console.log('Finished creating users!');
  } catch (error) {
    console.error('Error creating users!');
    throw error;
  }
}

async function createInitialPosts() {
  try {
    console.log('Starting to create posts...');

    await createPost({
      authorId: 1,
      title: 'Josh Goes to the Store',
      content: 'Joshua went to the store today!',
      tags: ['#happy', '#youcandoanything'],
    });
    await createPost({
      authorId: 2,
      title: 'Josh Goes to the Mall',
      content: 'Joshua went to the Mall today!',
      tags: ['#happy', '#worst-day-ever'],
    });
    await createPost({
      authorId: 3,
      title: 'Something happened',
      content:
        'Something happened again today! For the first time I have ever seen it happen.',
      tags: ['#happy', '#youcandoanything', '#canmandoeverything'],
    });

    console.log('Finished creating posts!');
  } catch (error) {
    console.error('Error creating posts!');
    throw error;
  }
}

async function rebuildDB() {
  try {
    client.connect();

    await dropTables();
    await createTables();
    await createInitialUsers();
    await createInitialPosts();
  } catch (error) {
    console.log('Error during rebuildDB');
    throw error;
  }
}

async function testDB() {
  try {
    console.log('Starting to test database...');

    console.log('Calling getAllUsers');
    const users = await getAllUsers();
    console.log('Result:', users);

    console.log('Calling getAllPosts');
    const posts = await getAllPosts();
    console.log('Result:', posts);

    console.log('Calling updateUser on users[0]');
    const updateUserResult = await updateUser(users[0].id, {
      name: 'Newname Sogood',
      location: 'Lesterville, KY',
    });
    console.log('Result:', updateUserResult);

    console.log('Calling getPostsByUsers[0]');
    const postsByUsers = await getPostsByUser(users[0].id);
    console.log('Result:', postsByUsers);

    console.log('Getting User by id = 1');
    const userById = await getUserById(1);
    console.log('Result:', userById);

    console.log('Calling updatePost on posts[1], only updating tags');
    const updatePostTagsResult = await updatePost(posts[1].id, {
      tags: ['#youcandoanything', '#redfish', '#bluefish'],
    });
    console.log('Result:', updatePostTagsResult);

    console.log('Calling getPostsByTagName with #happy');
    const postsWithHappy = await getPostsByTagName('#happy');
    console.log('Result:', postsWithHappy);

    console.log(await getUserById(6), 'this id:6*********');

    console.log('Finished database tests!');
  } catch (error) {
    console.error('Error testing database!');
    throw error;
  }
}

rebuildDB()
  .then(testDB)
  .catch(console.error)
  .finally(() => client.end());
