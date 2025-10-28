import express from "express";
const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Meetup backend " + new Date().toISOString());
  });

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));