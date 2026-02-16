export function validatePostData(req, res, next) {
  const { title, image, category_id, description, content, status_id } = req.body

  // Validate title
  if (title === undefined || title === null || title.trim() === "") {
    return res.status(400).json({ message: "Title is required" })
  }
  if (typeof title !== "string") {
    return res.status(400).json({ message: "Title must be a string" })
  }

  // Validate image
  if (image === undefined || image === null || image.trim() === "") {
    return res.status(400).json({ message: "Image is required" })
  }
  if (typeof image !== "string") {
    return res.status(400).json({ message: "Image must be a string" })
  }

  // Validate category_id
  if (category_id === undefined || category_id === null) {
    return res.status(400).json({ message: "Category ID is required" })
  }
  if (typeof category_id !== "number") {
    return res.status(400).json({ message: "Category ID must be a number" })
  }

  // Validate description
  if (description === undefined || description === null || description.trim() === "") {
    return res.status(400).json({ message: "Description is required" })
  }
  if (typeof description !== "string") {
    return res.status(400).json({ message: "Description must be a string" })
  }

  // Validate content
  if (content === undefined || content === null || content.trim() === "") {
    return res.status(400).json({ message: "Content is required" })
  }
  if (typeof content !== "string") {
    return res.status(400).json({ message: "Content must be a string" })
  }

  // Validate status_id
  if (status_id === undefined || status_id === null) {
    return res.status(400).json({ message: "Status ID is required" })
  }
  if (typeof status_id !== "number") {
    return res.status(400).json({ message: "Status ID must be a number" })
  }

  next()
}
