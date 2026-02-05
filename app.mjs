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
      "https://pet-blog-post-db.vercel.app/", // Frontend ที่ Deploy แล้ว
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
    const result = await connectionPool.query("SELECT * FROM posts");
    res.status(200).json(result.rows);
  } catch (e) {
    res.status(500).json({ message: "Server could not fetch posts because of database connection" });
    console.log("error =", e);
  }
});

app.get("/health", (req, res) => {
  res.status(200).json({ message: "OK" });
});

app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
