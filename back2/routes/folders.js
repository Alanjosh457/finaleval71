const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;
const Folder = require("../Schemas/folderSchema");
const Formbot = require("../Schemas/formbotSchema");
const User = require("../Schemas/user.schema");
const Form = require('../Schemas/formSchema');
const Response=require('../Schemas/responseSchema')
const dotenv = require("dotenv");
const isLoggedIn = require("../middleware/auth");

dotenv.config();

// Create a new folder
router.post("/create-folder", isLoggedIn, async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user?._id;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Folder name is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const folder = new Folder({
      name,
      user: userId,
      formbots: [],
    });

    await folder.save();

    user.folders = user.folders || [];
    user.folders.push(folder._id);
    await user.save();

    res.status(201).json(folder);
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ error: "An error occurred while creating the folder" });
  }
});

// Create a new formbot
// Create a new formbot

// Create a new formbot inside a folder

router.post("/create-formbot", isLoggedIn, async (req, res) => {
  try {
    console.log('Request received to create formbot:', req.body);  // Log the request body

    const { name, folderId } = req.body;
    console.log('Extracted data: name:', name, 'folderId:', folderId);  // Log the extracted values

    const userId = req.user?._id;
    console.log('User ID:', userId);  // Log user ID to check if it’s being passed correctly

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      console.log('Invalid name:', name);  // Log invalid name
      return res.status(400).json({ error: "Formbot name is required" });
    }

    if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
      console.log('Invalid folderId format:', folderId);  // Log invalid folderId
      return res.status(400).json({ error: "Invalid folder ID format" });
    }

    const user = await User.findById(userId);
    if (!user) {
      console.log('User not found for ID:', userId);  // Log if user is not found
      return res.status(404).json({ error: "User not found" });
    }

    let formbot;
    console.log('Proceeding to create formbot');

    if (folderId) {
      const folder = await Folder.findById(folderId);
      if (!folder) {
        console.log('Folder not found for folderId:', folderId);  // Log if folder is not found
        return res.status(404).json({ error: "Folder not found" });
      }

      console.log('Folder found:', folder);  // Log folder found

      formbot = new Formbot({
        name,
        user: userId,
      });

      folder.formbots.push(formbot._id);
      await folder.save();

      console.log('Folder after adding formbot:', folder);  // Log after formbot is added to folder
    } else {
      formbot = new Formbot({
        name,
        user: userId,
      });
    }

    console.log('Formbot to be saved:', formbot);  // Log before saving the formbot
    await formbot.save();
    console.log('Created formbot:', formbot);  // Log after formbot is saved

    res.status(201).json(formbot);
  } catch (error) {
    console.error("Error creating formbot:", error);
    res.status(500).json({ error: "An error occurred while creating the formbot" });
  }
});



// Fetch all folders for the logged-in user
router.get("/fetchfolders", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user?._id;
    const folders = await Folder.find({ user: userId }).populate("formbots");
    res.status(200).json(folders);
  } catch (error) {
    console.error("Error fetching folders:", error);
    res.status(500).json({ error: "An error occurred while fetching folders" });
  }
});

// Fetch all formbots for the logged-in user
router.get("/fetchformbots", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user?._id;
    const formbots = await Formbot.find({ user: userId }).populate("folder");
    res.status(200).json(formbots);
  } catch (error) {
    console.error("Error fetching formbots:", error);
    res.status(500).json({ error: "An error occurred while fetching formbots" });
  }
});
router.get('/formbot/:formbotId', isLoggedIn, async (req, res) => {
  try {
    const { formbotId } = req.params;
    // Find the formbot by ID
    const formbot = await Formbot.findById(formbotId);
    
    if (!formbot) {
      return res.status(404).json({ message: 'Formbot not found' });
    }

    res.json(formbot); // Send formbot data back to the client
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.post('/saveforms', isLoggedIn, async (req, res) => {
  try {
    const { title, fields, formbotId } = req.body;

    // Validate input
    if (!formbotId || !title || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'formbotId, title, and fields are required, and fields must be an array.' });
    }

    // Validate fields
    for (const field of fields) {
      if (!field.type || !field.label) {
        return res.status(400).json({ message: 'Each field must have a type and label.' });
      }
    }

    // Create a new form
    const form = new Form({ title, fields, formbotId });
    await form.save();
      console.log('Form to save:', form);

    res.status(201).json({ success: true, form });
    console.log('Form saved successfully:', form);
  } catch (error) {
    console.error('Error saving form:', error);
    res.status(500).json({ success: false, message: 'Error saving form', error });
  }
});

router.get('/getforms', isLoggedIn, async (req, res) => {
  try {
    const { formbotId } = req.query;

    if (!formbotId) {
      return res.status(400).json({ message: 'formbotId is required.' });
    }

    const forms = await Form.find({ formbotId });

    if (!forms.length) {
      return res.status(404).json({ message: 'No forms found for this formbot.' });
    }

    res.status(200).json({ success: true, forms });
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ success: false, message: 'Error fetching forms', error });
  }
});
router.put('/updateform/:id', isLoggedIn, async (req, res) => {
  try {
    const { title, fields } = req.body;

    // Validate input
    if (!title || !fields || !Array.isArray(fields)) {
      return res.status(400).json({ message: 'Title and fields are required, and fields must be an array.' });
    }

    // Validate fields
    for (const field of fields) {
      if (!field.type || !field.label) {
        return res.status(400).json({ message: 'Each field must have a type and label.' });
      }
    }

    // Ensure only one submit button exists
    const submitFields = fields.filter((field) => field.type === 'submit');
    if (submitFields.length > 1) {
      return res.status(400).json({ message: 'A form can only contain one submit button.' });
    }

    const form = await Form.findByIdAndUpdate(
      req.params.id,
      { title, fields },
      { new: true, runValidators: true }
    );

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    res.json({ success: true, form });
  } catch (error) {
    console.error('Error in updateform:', error);
    res.status(500).json({ success: false, message: 'Error updating form', error });
  }
});
router.delete('/deleteform/:id', isLoggedIn, async (req, res) => {
  try {
    const form = await Form.findByIdAndDelete(req.params.id);

    if (!form) {
      return res.status(404).json({ success: false, message: 'Form not found.' });
    }

    res.json({ success: true, message: 'Form deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteform:', error);
    res.status(500).json({ success: false, message: 'Error deleting form', error });
  }
});
module.exports = router;

router.get('/fetchformdata/:formId',async (req, res) => {
  const { formId } = req.params;

  try {
    // Fetch the form by formId
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    res.status(200).json({
      formFields: form.fields, // Send form fields
    });
  } catch (error) {
    console.error('Error fetching form data:', error);
    res.status(500).json({ message: 'Error fetching form data', error });
  }
});

// Submit form responses
router.post('/submitform', isLoggedIn, async (req, res) => {
  const { formId, responses } = req.body;

  if (!formId || !responses || responses.length === 0) {
    return res.status(400).json({ message: 'FormId and responses are required.' });
  }

  try {
    // Fetch the form to ensure the formId is valid
    const form = await Form.findById(formId);
    
    if (!form) {
      return res.status(404).json({ message: 'Form not found' });
    }

    // Validate responses - ensure the response fields are valid
    const invalidFields = responses.filter(response => 
      !response.label || response.value === undefined
    );
    
    if (invalidFields.length > 0) {
      return res.status(400).json({ message: 'Invalid response fields', invalidFields });
    }

    // Create a new Response document for the form submission
    const newResponse = new Response({
      formbotId: form.formbotId, // Ensure to use formbotId from the associated form
      fields: responses, // Store the responses in the fields array
    });

    await newResponse.save();

    res.status(201).json({ success: true, message: 'Responses submitted successfully', response: newResponse });
  } catch (error) {
    console.error('Error submitting responses:', error);
    res.status(500).json({ message: 'Error submitting responses', error });
  }
});

router.post('/submitresponse', async (req, res) => {
  try {
    console.log('Incoming request body:', JSON.stringify(req.body, null, 2));

    const { formbotId, responses } = req.body;

    // Validate that formbotId is a valid ObjectID
    if (!formbotId || typeof formbotId !== 'string') {
      return res.status(400).json({ message: 'Invalid formbotId provided.' });
    }

    console.log('Using formbotId:', formbotId);

    // Normalize responses to always be an array
    const normalizedResponses = Array.isArray(responses) ? responses : [responses];

    // Validate each response object
    for (const response of normalizedResponses) {
      if (
        typeof response !== 'object' ||
        !response.label ||
        typeof response.value === 'undefined'
      ) {
        console.error('Invalid response object:', response);
        return res.status(400).json({
          message: 'Each response must be an object with label and value properties.',
        });
      }
    }

    // Create a new response document
    const newResponse = new Response({
      formbotId, // Use the plain formbotId
      fields: normalizedResponses, // Store the normalized array
      createdAt: new Date(),
      views: 0,  // Initialize views to 0
      starts: 0, // Initialize starts to 0
    });

    // Save the responses to the database
    const savedResponse = await newResponse.save();
    console.log('Successfully saved response:', savedResponse);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Responses submitted successfully',
      response: savedResponse,
    });
  } catch (error) {
    console.error('Error during response submission:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});



router.get('/getallresponses/:formbotId', async (req, res) => {
  try {
    const { formbotId } = req.params; // Extract formbotId from the route parameter

    // Find all responses with the specific formbotId
    const savedResponses = await Response.find({ formbotId });

    if (!savedResponses || savedResponses.length === 0) {
      return res.status(404).json({ message: 'No responses found for this formbot.' });
    }

    // Send the filtered responses
    res.status(200).json({
      success: true,
      responses: savedResponses.map((response) => ({
        _id: response._id,
        formbotId: response.formbotId,
        views: response.views,
        starts: response.starts,
        fields: response.fields,
        createdAt: response.createdAt
      })),
    });
  } catch (error) {
    console.error('Error fetching responses:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});

// Increment views count (every time the response page is loaded)
router.patch('/incrementViews/:formbotId', async (req, res) => {
  try {
    const { formbotId } = req.params;

    // Find the response associated with this formbotId
    const response = await Response.findOne({ formbotId });
    console.log('Responses', response)

    if (!response) {
      return res.status(404).json({ message: 'Response not found for this formbot' });
    }

    // Increment views by 1
    response.views += 1;
    await response.save();

    return res.status(200).json({ success: true, views: response.views });
  } catch (err) {
    console.error('Error incrementing views:', err);
    return res.status(500).json({ message: 'Error incrementing views' });
  }
});

// Increment the starts count when the user starts filling out the form
router.post('/incrementStarts/:formbotId', async (req, res) => {
  try {
    const { formbotId } = req.params;

    // Find the response associated with this formbotId
    const response = await Response.findOne({ formbotId });
    console.log("Received formbotId:", formbotId);

    if (!response) {
      return res.status(404).json({ message: 'Response not found for this formbot' });
    }

    // Ensure the response.fields array exists and has at least one field
    if (response.fields && response.fields.length > 0 && response.fields[0].value) {
      // Increment the starts count if the first input field is filled
      response.starts = (response.starts || 0) + 1; // Initialize starts to 0 if it's undefined
      await response.save();
      return res.status(200).json({ success: true, starts: response.starts });
    }

    // If the first input field is not filled, send a different response
    return res.status(400).json({ message: 'First input field is not filled yet.' });

  } catch (err) {
    console.error('Error incrementing starts:', err);
    return res.status(500).json({ message: 'Error incrementing starts' });
  }
});

// Increment the view count when the user views the form
router.post('/viewformbot', async (req, res) => {
  try {
    const { formbotId } = req.body;

    if (!formbotId || typeof formbotId !== 'string') {
      return res.status(400).json({ message: 'Invalid formbotId provided.' });
    }

    // Find the formbot response document by formbotId
    const response = await Response.findOne({ formbotId });

    if (!response) {
      return res.status(404).json({ message: 'Formbot response not found.' });
    }

    // Increment the views count
    response.views = (response.views || 0) + 1; // Initialize views to 0 if it's undefined

    // Save the updated response document
    await response.save();

    // Send success message and the updated views count
    res.status(200).json({
      success: true,
      message: 'Formbot view count incremented.',
      views: response.views,  // Return the updated view count
    });
  } catch (error) {
    console.error('Error during formbot view increment:', error);
    return res.status(500).json({ message: 'Internal server error', error });
  }
});
