import express from "express";
import cors from "cors";
import "dotenv/config";
import connectionPool from "./utils/db.mjs";

const app = express();
const port = process.env.PORT || 4001;

app.use(
  cors({
    origin: [
      "http://localhost:5173", // Frontend local (Vite)
      "http://localhost:3000", // Frontend local (React แบบอื่น)
      "https://pet-blog-post-db.vercel.app", // Frontend ที่ Deploy แล้ว
    ],
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"]
  })
);
app.use(express.json());

app.post("/posts", async (req, res) => {
  const newPost = {
    ...req.body
  }
  try {
    await connectionPool.query(`
      insert into posts (title, image, category_id, description, content, status_id)
      values ($1, $2, $3, $4, $5, $6)
      `,[
        newPost.title,
        newPost.image,
        newPost.category_id,
        newPost.description,
        newPost.content,
        newPost.status_id
      ])

    return res.status(200).json({
      message: "Created post sucessfully"
    })
  } catch (e) {
    res.status(500).json({ 
      message: "Server could not create post because database connection" 
    })
    console.log("error =",e)
  }  
});

app.get("/posts", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category || "";
    const offset = (page - 1) * limit;

    let query = `SELECT posts.id, posts.image, categories.name AS category, posts.title, posts.description, posts.date, posts.content, posts.likes_count, statuses.status
      FROM posts
      INNER JOIN categories ON posts.category_id = categories.id
      INNER JOIN statuses ON posts.status_id = statuses.id`;

    let countQuery = `SELECT COUNT(*) FROM posts
      INNER JOIN categories ON posts.category_id = categories.id`;

    let values = [];
    let countValues = [];

    if (category) {
      query += " WHERE categories.name ILIKE $1 ORDER BY posts.date DESC LIMIT $2 OFFSET $3";
      values = [`%${category}%`, limit, offset];
      countQuery += " WHERE categories.name ILIKE $1";
      countValues = [`%${category}%`];
    } else {
      query += " ORDER BY posts.date DESC LIMIT $1 OFFSET $2";
      values = [limit, offset];
    }

    const postsResult = await connectionPool.query(query, values);
    const countResult = await connectionPool.query(countQuery, countValues);

    const totalPosts = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalPosts / limit);
    const nextPage = page < totalPages ? page + 1 : null;

    return res.status(200).json({
      posts: postsResult.rows,
      currentPage: page,
      nextPage: nextPage,
      totalPages: totalPages,
      totalPosts: totalPosts
    });
  } catch (e) {
    console.log("error =", e);
    return res.status(500).json({ 
      "message": "Server could not read post because database connection"
    });
  }
});

app.get("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId

    const result = await connectionPool.query(`select * from posts where id=$1`,[postIdFromClient])

    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested post"
      })
    }

    return res.status(200).json(result.rows[0])
  } catch (error) {
    return res.status(500).json({
      message: "Server could not read post because database connection"
    })
  }
})

app.put("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId
    const updatePost = { ...req.body }

    const result = await connectionPool.query(`select * from posts where id=$1`,[postIdFromClient])

    if (!result.rows[0]) {
      return res.status(404).json({
        message: "Server could not find a requested post"
      })
    }

    const query = `
      UPDATE posts 
      SET 
        image = $1,
        category_id = $2,
        title = $3,
        description = $4,
        content = $5,
        status_id = $6
      WHERE id = $7
    `

    await connectionPool.query(query, [
      updatePost.image,
      updatePost.category_id,
      updatePost.title,
      updatePost.description,
      updatePost.content,
      updatePost.status_id,
      postIdFromClient
    ])

    return res.status(200).json({
      message: "Updated post successfully"
    })
  } catch (error) {
    // console.log("error =", error)
    return res.status(500).json({
      message: "Server could not update post because database connection"
    })
  }
});

app.delete("/posts/:postId", async (req, res) => {
  try {
    const postIdFromClient = req.params.postId

    const result = await connectionPool.query(
      `DELETE FROM posts WHERE id = $1`,
      [postIdFromClient]
    )

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Server could not find a requested post to delete"
      })
    }

    return res.status(200).json({
      message: "Deleted post successfully"
    })
  } catch (error) {
    // console.log("error =", error)
    return res.status(500).json({
      message: "Server could not delete post because database connection"
    })
  }
})

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}

// Export for Vercel
export default app;
