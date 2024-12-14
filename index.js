import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";
import env from "dotenv"

const app = express();
const port = 3000; 
env.config();

const db= new pg.Client({
    user:process.env.PG_USER,
    host:process.env.PG_HOST,
    database:process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port:process.env.PG_PORT
  });
  db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.get("/",async (req,res)=>{
    const result=await db.query("SELECT * FROM todo");
    const tasks=result.rows;
    res.render("index.ejs",{tasks:tasks});
});

app.post("/submit", async (req,res)=>{
    const task= req.body.task;
    const result=await db.query("INSERT INTO todo (task) VALUES ($1)",[task]);
    res.redirect("/");
});
app.patch("/update",async (req,res)=>{
    const id=req.body.id;
    const task=req.body.task;
    
    try {
        const result=await db.query("UPDATE todo SET task = $1 WHERE id=$2",[task,id]);
        res.status(200).json({ success: true});
    } catch (error) {
        console.error("Error updating item:", error);
        res.status(500).json({ success: false, message: "Failed to update task." });
    }
});
app.delete("/delete/:id",async (req,res)=>{
    const id=parseInt(req.params.id);
    try {
        const result=await db.query("DELETE FROM todo WHERE id = $1",[id]);
        res.status(200).json({ success: true});
    } catch (error) {
        console.error("Error deleting item:", error);
        res.status(500).json({ success: false, message: "Failed to delete task." });
    }
});


app.listen(port, () => {
    console.log(`Server up and running at port ${port}`);
});