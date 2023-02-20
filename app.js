//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose")
const app = express();
const _=require("lodash");
mongoose.set('strictQuery', true);

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


mongoose.connect(process.env.MONGO_URI,{useNewUrlParser:true});


const itemSchema={name:String}

const Item=mongoose.model("Item",itemSchema)
  
const item1=new Item({
  name:"welcome to your todolist!"
})

const item2=new Item({
  name:"hit the + button to add anew item"
})

const item3=new Item({
  name:"<-- hit this delete button to delete"
})

const defaultItems=[item1,item2,item3]

const listSchema={
  name:String,
  items:[itemSchema]
}
const List=new mongoose.model("List",listSchema);


app.get("/", function(req, res) {

Item.find({},(err,foundItems)=>{
    
  if(foundItems.length===0){
    Item.insertMany(defaultItems,(err)=>{
      if(err){
        console.log(err);
      }
      else{
        console.log("success");
      }
    });
res.redirect("/")
  }
else
{

  res.render("list", {listTitle:"Today", newListItems: foundItems});

}    
  
   })

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;

  const item=new Item({
    name:itemName
  });
if(listName==="Today"){
  await item.save();
  res.redirect("/")
}
else{
  List.findOne({name:listName},(err,foundList)=>{
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName)
  })
}


});
app.post("/delete",(req,res)=>{

const checkedItemId=req.body.checkbox;
const listName=req.body.hidden;

if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId,(err)=>{
    if(!err){console.log("success")
  res.redirect("/")}
  })
  
}
else{
  List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},(err,foundlist)=>{
    if(!err){
      res.redirect("/"+listName);
    }
  }
  )
}



    })

app.get("/:customerListName",(req,res)=>{
  const customListName=_.capitalize(req.params.customerListName);

 

  List.findOne({name:customListName},async(err,foundList)=>{
    if(!err){
      if(!foundList){
        // svae a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        await list.save();
        res.redirect("/"+customListName)
      }
      else{
        // show aexisting list
        res.render("list",{listTitle:foundList.name,newListItems:foundList.items});


      }
    }
      })
})

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
