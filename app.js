//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");                        // MONGO STUFF >>>>>>
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// "mongodb://127.0.0.1:27017/todolistDB"
// PnSLFq4Ru5EMggtu
mongoose.connect("mongodb+srv://hjh28rex:PnSLFq4Ru5EMggtu@cluster0.odvweiu.mongodb.net/todolistDB");    // MONGO STUFF >>>>>>

const itemsSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]                                       // This is the relationship aspect 
});

const Item = mongoose.model("Item", itemsSchema);            // MONGO STUFF >>>>>>
const List = mongoose.model("List", listSchema); 

const eat = new Item({           // MONGO STUFF >>>>>>
  name:"Eat"
});

const sleep = new Item({         // MONGO STUFF >>>>>>
  name:"Sleep"
});

const poop = new Item({          // MONGO STUFF >>>>>>
  name:"Poop"
});

const defaultItems = [eat,sleep,poop];

app.get("/", function(req, res) {

Item.find()
.then(function (items) {

  if (items.length === 0){
    Item.insertMany(defaultItems); // MONGO STUFF >>>>>>
  }  

  res.render("list", {listTitle: "Today", newListItems:items});

})
.catch(function (err) {
  console.log(err);
});

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItem = new Item({        
    name: itemName
  });

  if (listName === "Today"){
    newItem.save();

    res.redirect("/");
  } else{

    List.findOne({name: listName})
    .then(function (listFound) {
      listFound.items.push(newItem)
      listFound.save()
      res.redirect("/" + listName);
    })
    .catch(function (err) {
      console.log(err);
    });

  }

 
});

app.get("/:customListName", function (req, res){ 

   const customListName = _.capitalize(req.params.customListName);

    List.findOne({name: customListName})
    .then(function (listFound) {

      if(listFound){
        // show the found list !!
        res.render("list", {listTitle: customListName, newListItems:listFound.items})
      } else{
          const list = new List({
          name: customListName,
          items: defaultItems
          })

          list.save();
          res.redirect("/" + customListName);
      }

    })
    .catch(function (err) {
      console.log(err);
    });


});

app.post("/delete", function(req, res){
  const checkedItemID = req.body.checkBox;
  const listName = req.body.listName;

  if (listName === "Today"){
    Item.deleteOne({_id: checkedItemID})
    .then(() => {
      console.log("Successfully Deleted");
    })
    .catch((err) => {
      console.log(err);
    });
  
    res.redirect("/");

  } else{
    List.findOneAndUpdate(
      {name: listName},
      {$pull:{items:{_id: checkedItemID}}}).
      then(() => {
        console.log("Successfully Deleted");
      })
      .catch((err) => {
        console.log(err);
      });
  }
    res.redirect("/" + listName);
})

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
