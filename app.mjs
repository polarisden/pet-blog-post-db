import express from "express";
import cors from "cors";
import "dotenv/config";
import postRouter from "./routes/postRouter.mjs";
import authRouter from "./routes/auth.mjs";

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
app.use("/posts", postRouter)
app.use("/auth", authRouter)

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Server is running at ${port}`);
  });
}

// Export for Vercel
export default app;
