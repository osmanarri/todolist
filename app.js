const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");
const _ = require("lodash");

// let day = date.getDate();
const app = express();

// set ejs as the default engine
app.set("view engine", "ejs");

// parsing data from list.ejs form to the browser
app.use(bodyParser.urlencoded({extended:false}))

// use public folder that has styles.css
app.use(express.static("public"));

// connect to mongoDB that hosted localy
mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser:true});

// create a chema
const itemSchema = new mongoose.Schema({
    name:  String    
   
  });

// create a model
const Item = mongoose.model("Item", itemSchema);

// create a document:
const item1 = new Item ({
    name: "Bring the milk",
    
});

// create a document:
const item2 = new Item ({
    name: "Bring the bread",
    
});

// create a document:
const item3 = new Item ({
    name: "Bring the cake",
    
});

// store the 3 items in a constant
const defaultItems = [item1, item2, item3];

// ceate a new schema that has relation with itemSchema   
const listSchema = new mongoose.Schema({
    name:  String ,
    items: [itemSchema]   
   
  });
  // create a model
  const List = mongoose.model("List", listSchema);



app.get("/", function (req, res) { 
    
    // read all documents
    Item.find({}, function(err, foundItems) {

        //  if the list empty
        if (foundItems.length === 0){

            // insert the 3 default items
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log("Successfully inserted.");
                }
            });
            // then redirect to the home page
            res.redirect("/");
        }else{
               // ejs file, {key wrod : variable, key word, variable} 
            res.render("list", {listTitle: "Today", newListItems: foundItems});

        }    
    })   
   
});

// dynamic route
app.get("/:customListName", function(req, res){
  // convert the string to capitalized string (_.capitalized)
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName}, function(err, foundList){
    if (!err){
      if (!foundList){
        //Create a new list
        const list = new List({
          name: customListName,
          items: defaultItems
        });
        list.save();
        res.redirect("/" + customListName);
      } else {
        //Show an existing list

        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

// create a new item
app.post("/", function(req, res){    
    
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today"){
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
})

app.post("/delete", function(req, res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  // if the delete comes from the home page
  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
      if (!err) {
        console.log("Successfully deleted checked item.");
        res.redirect("/");
      }
    });
    // if the delete comes from the cusotm list (dynamic route)
  } else {
    // find one and update (condition, update, call back function )
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if (!err){
        res.redirect("/" + listName);
      }
    });
  }


});


app.get("/about", (req, res) => {

    res.render("about");
})


app.listen(3000, () => {
    console.log("Server started on port 3000")
})

