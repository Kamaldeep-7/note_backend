const express = require('express');
const {fetchuser} = require('../middleware/fetchuser')
const router = express.Router();
const Note = require('../models/Note');

// const JWT_SECRET = 'kamalDeep#SECRET';
const { body, validationResult } = require('express-validator');

// Route : 1 Get all the notes: GET "/api/notes/fetchallnotes" , login required
router.get("/fetchallnotes",

    // this is a middleware function
    fetchuser, 

    async(req, res) => {

        try {
            const notes = await Note.find({ user: req.user.id });
            res.json(notes);
        } catch (error) {
            // if there is some error in the code above 500 status code will be showed
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }

    })




// Route : 2 Add a new note using Post: " " , login required
router.post("/addnote",
    // this is a middleware function
    fetchuser
    ,
    [
        // these isemail , isLength comes under express package
        body('title', 'Enter a valid title').isLength({ min: 3 }),
        body('description', 'description must be of atleast 5 characters').isLength({ min: 5 }),

    ],
    async (req, res) => {

        try {

            const { title, description, tag } = req.body

            // if there are errors , return the bad request and the errors
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save();

            res.json(savedNote);

        } catch (error) {
            // if there is some error in the code above 500 status code will be showed
            console.error(error.message);
            res.status(500).send("Internal Server Error");
        }


    })




// Route : 3 update an existing note using Put: "/api/notes/updatenote" , login required
router.put("/updatenote/:id",

    // this is a middle ware function
    fetchuser,

    async (req, res) => {

        try {

            const { title, description, tag } = req.body
            // create a  newNote object
            const newNote = {};
            if (title) { newNote.title = title };
            if (description) { newNote.description = description };
            if (tag) { newNote.tag = tag };
            // Find the note to be updated
            let note = await Note.findById(req.params.id);
            
            
            if (!note) { return res.status(404).send("Not Found") }
            if (note.user.toString() !== req.user.id) { return res.status(401).send("Not allowed") }
            
            note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
            res.json(note);
            
        } catch (error) {
            // if there is some error in the code above 500 status code will be showed
            console.error(error.message);
            res.status(500).send("Internal Server Error");

        }
    })


    // ROUTE : 4 Delete an existing Note using DELETE : "api/notes/deletenote" . Login required

    router.delete("/deletenote/:id",

    fetchuser,
    async (req, res) => {

        try {

            
            // Find the note to be deleted and delete it
            let note = await Note.findById(req.params.id);
            if (!note) { return res.status(404).send("Not Found") }

            // Allow deletion only if the user owns this note
            if (note.user.toString() !== req.user.id) { return res.status(401).send("Not Allowed") }
            note = await Note.findByIdAndDelete(req.params.id);

            res.json({"Success" : "Note have been deleted"});
        } catch (error) {
            
            // if there is some error in the code above 500 status code will be showed
            console.error(error.message);
            res.status(500).send("Internal Server Error");

        }
    })

module.exports = router