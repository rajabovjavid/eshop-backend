const express = require("express");
const router = express.Router();
const { Category } = require("../models/category");

router.get("/", async (req, res) => {
  const categoryList = await Category.find();

  if (!categoryList) {
    res.status(500).json({ success: false });
  }
  res.send(categoryList);
});

router.get("/:id", async (req, res)=>{
  const category = await Category.findById(req.params.id)
  if(!category){
    res.status(500).json({message: "The category was not found"}) 
  }

  res.status(200).send(category)

  /* Category.findById(req.params.id).then(category=>{
    if (category) {
      res.status(200).send(category)
    } else {
      res.status(500).json({message: "The category was not found"})
    }
  }).catch(err=>{
    res.status(400).json({success: false, error: err})
  }) */
})

router.post("/", async (req, res)=>{
  let category = new Category(req.body)

  category = await category.save()

  if(!category){
    return res.status(404).send("category is not created")
  }

  res.send(category)
})

router.put("/:id", async (req, res)=>{
  Category.findByIdAndUpdate(req.params.id, req.body, {new: true}).then(cat=>{
    if (cat) {
      res.status(200).send(cat)
    } else {
      res.status(500).json({message: "category was not updated"})
    }
  }).catch(err=>{
    res.status(400).json({error: err})
  })
})

router.delete("/:id", async (req, res)=>{
  /* const category = await Category.findByIdAndDelete(req.params.id)

  if(!category){
    return res.status(404).json({success: false, message: "category is not deleted"})
  }

  return res.status(200).json({success: true, message: "category is deleted"}) */

  Category.findByIdAndDelete(req.params.id).then(category=>{
    if (category) {
      return res.status(200).json({success: true, message: "category is deleted"})
    } else {
      return res.status(404).json({success: false, message: "category is not deleted"})
    }
  }).catch(err=>{
    res.status(400).json({success: false, error: err})
  })
})

module.exports = router;
