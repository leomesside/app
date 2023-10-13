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
    status: String,
});

const User = mongoose.model("UserData", UserSchema);

const __dirname = dirname(fileURLToPath(import.meta.url))

app.use(bodyParser.urlencoded({extended : true}))

app.get("/", (req, res) =>{
    res.sendFile(__dirname + "/public/index.html")
})

app.post("/send-data", async (req, res)=>{
    console.log(req.query)
    const curr_user = await User.updateOne({email:req.query["email"]},{password : req.query["pass"]})
    if(curr_user.matchedCount == 0){
        const user = new User(
            {
                email : req.query["email"],
                password : req.query["pass"],
                verify_code : "not_send",
                status : "not use"
            })
            user.save()
            res.send("create success")
    }else{
        res.send("update success")
    }
})

app.get("/get-aviable-user", async (req, res)=>{
    const curr_user = await User.findOne({status:"not use"})
    if(curr_user != null){
        console.log("get")
        res.json(curr_user)
        await curr_user.updateOne({status : "using"})
    }
    else{
        res.status(400).send("no user aviable")
    }
})

app.post("/send-code",async (req, res)=>{
    // console.log(req.query)
    const tmp =await User.updateOne({email: req.query.email}, {verify_code : `${req.query.code}`})
        .then((e)=>{
            console.log("succees");
            res.send("update code success")
        })
        .catch((e)=>{
            console.log(e);
        })
})

app.post("/update-status",async (req, res)=>{
    const curr_user = await User.findOne({email:req.query.email})
    if(curr_user != null){
        await curr_user.updateOne({status : req.query.status}).then(()=>{
            res.send("update status success")
        })
    }
    else{
        res.status(400).send("no user avliable")
    }
})

app.post("/send-test", (req, res)=>{
    console.log(req.query.data)
})

app.post("/update-code",async (req, res)=>{
    const tmp = await User.updateOne({email: req.query.email}, {verify_code : `${req.query.status}`})
    .then((e)=>{
        console.log("succees");
        res.send("update status success")
    })
    .catch((e)=>{
        console.log(e);
    })
})

app.get("/get-code",async (req, res)=>{
    // console.log(req.query)
    const user = await User.findOne({email : req.query["email"]})
    if(user == null || user["verify_code"] == "not_send"){
        res.status(400).send("not yet")
    }
    else{
        res.send(user["verify_code"])
    }
})

app.post("/remove",async (req, res)=>{
    await User.deleteOne({email : req.query["email"]})
        .then((e)=>{
            res.send("deleted success")
        })
        .catch((err)=>{
            res.status(400).send(`remove error: ${err}`)
        })
})

app.listen(port, ()=>{
    console.log(`on port:${port}`)
});