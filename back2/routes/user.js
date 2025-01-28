const express=require("express")
const mongoose = require("mongoose");
const router=express.Router()
const User=require("../Schemas/user.schema")
const Url=require("../Schemas/urlSchema")
const Workspace=require("../Schemas/workspace.Schema")
const SharedWorkspace=require("../Schemas/sharedWorkspaceSchema")
const bcrypt=require("bcrypt")
const jwt=require("jsonwebtoken")
const env=require("dotenv")
const isLoggedIn = require("../middleware/auth"); 
const UAParser = require("ua-parser-js");

env.config()
const { nanoid } = require("nanoid");

router.post("/signup", async (req, res) => {
    try {
        const { email, password, name,phone } = req.body;
        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            res.status(400).json({ message: "Email already taken" });
            return;
        } else {
            const hashedPassword = bcrypt.hashSync(password, 10);
            const newUser = await new User({ email, password: hashedPassword, name ,phone}).save();
            
            // Include _id in the JWT token
            const token = jwt.sign({ email, name, _id: newUser._id ,phone}, process.env.JWT_SECRET);
            return res.status(200).json({ message: "User created successfully", token, id: newUser._id });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            res.status(400).json({ message: "Invalid email or password" });
            return;
        }
        
        // Include _id in the JWT token
        const token = jwt.sign({ email, name: user.name, _id: user._id }, process.env.JWT_SECRET);
        return res.status(200).json({ message: "Login successful", token, id: user._id, name: user.name });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error" });
    }
});



// Your URL schema
router.post("/shorten", isLoggedIn, async (req, res) => {
  try {
    const { originalUrl, remarks, expirationDate } = req.body;  // Destructure expirationDate from the request body

    // Check if expirationDate is present and valid
    let expiration = null;
    if (expirationDate) {
      expiration = new Date(expirationDate);
      if (isNaN(expiration.getTime())) {
        // If the expirationDate is invalid, return an error response
        return res.status(400).json({ message: "Invalid expiration date" });
      }
    }

    // Generate a unique shortened key using nanoid
    const shortenedKey = nanoid(8); // Use a length of 8 for compact keys

    // Define the status (default is 'active')
    const status = 'active'; // You can make this dynamic if you want

    // Set the initial click count to 0
    const clickCount = 0; // Initialize click count to 0

    // Create a new URL object with the status and click count included
    const newUrl = new Url({
      originalUrl,
      shortenedKey,
      remarks,
      status, // Add status here
      clickCount,
      expirationDate: expiration,
     
       // Only set expirationDate if valid
      user: req.user._id, // Add user ID here
    });

    // Save the new URL to MongoDB
    await newUrl.save();

    // Return the response with the shortened URL
    return res.status(200).json({
      message: "URL shortened successfully",
      shortenedUrl: `${req.protocol}://${req.get("host")}/${shortenedKey}`,
    });
  } catch (error) {
    console.error("Error creating shortened URL:", error);
    return res.status(500).json({ message: "Server error" });
  }
});




router.get("/all", isLoggedIn, async (req, res) => {
  console.log('Accessing /all endpoint'); // Add this log to confirm it's being hit.
  try {
    const userId = req.user._id;
    let urls = await Url.find({ user: userId });
    for (let url of urls) {
      console.log('Expiration Date:', url.expirationDate);
      console.log('Current Date:', new Date());
      
      if (url.expirationDate && new Date(url.expirationDate) < new Date()) {
        url.status = 'inactive';
        await url.save();
        console.log('Updated URL:', url);
      }
    }

    const urlsWithDetails = urls.map(url => ({
      ...url.toObject(),
      ipAddresses: url.ipAddresses,
      osClicks: url.osClicks,
    }));

    return res.status(200).json(urlsWithDetails);

  } catch (error) {
    console.error("Error fetching URLs:", error);
    return res.status(500).send("Server error.");
  }
});





router.get("/:shortenedKey", async (req, res) => {
  try {
    const { shortenedKey } = req.params;

    // Find the URL entry by shortened key
    const urlEntry = await Url.findOne({ shortenedKey });

    if (urlEntry) {
      // Increment the click count
      urlEntry.clickCount += 1;
      
      // Extract the user's IP address
      let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      
      // If IP is in IPv6 format "::1", convert it to "127.0.0.1"
      if (ip === '::1') {
        ip = '127.0.0.1';
      }

      // Extract user agent information for OS and device
      const userAgent = req.get("User-Agent");
      const parser = new UAParser();
      const result = parser.setUA(userAgent).getResult();

      // Get the OS and device type
      const osName = result.os.name || "unknown";  // OS name or "unknown" if not detected
      const deviceType = result.device.type || "no device";  // Default to 'desktop' if no type found

      // Log for debugging
      console.log("Device Type:", deviceType); 
      console.log("OS:", osName);
      console.log("IP Address:", ip);

      // Track the device-specific click counts (optional, but keeps track of different devices)
      urlEntry.deviceClicks = urlEntry.deviceClicks || { mobile: 0, tablet: 0, desktop: 0 };
      if (deviceType === "mobile") {
        urlEntry.deviceClicks.mobile += 1;
      } else if (deviceType === "tablet") {
        urlEntry.deviceClicks.tablet += 1;
      } else {
        urlEntry.deviceClicks.desktop += 1;
      }

      // Track the OS clicks by storing OS names in osClicks array
      urlEntry.osClicks = urlEntry.osClicks || [];
      if (!urlEntry.osClicks.includes(osName)) {
        urlEntry.osClicks.push(osName);  // Store the OS name if it's not already in the list
      }

      // Track the IP addresses by storing unique IPs in the ipAddresses array
      urlEntry.ipAddresses = urlEntry.ipAddresses || [];
      if (!urlEntry.ipAddresses.includes(ip)) {
        urlEntry.ipAddresses.push(ip);  // Store the IP address if it's not already in the list
      }

      // Save the updated URL entry with IP, OS, and device click data
      await urlEntry.save();

      // Send the original URL as response
      return res.json({ originalUrl: urlEntry.originalUrl });
    } else {
      return res.status(404).send("Shortened URL not found.");
    }
  } catch (error) {
    console.error("Error fetching original URL:", error);
    return res.status(500).send("Server error.");
  }
});




router.get("/search", isLoggedIn, async (req, res) => {
  try {
    // Extract search term from the query
    const { searchTerm } = req.query;

    console.log("Received searchTerm:", searchTerm); // Log the received searchTerm

    if (!searchTerm) {
      console.log("Search term is missing in the request.");
      return res.status(400).json({ message: "Search term is required" });
    }

    // Continue with your database query as you have it
    const userId = req.user._id;
    console.log(`Searching for URLs with term "${searchTerm}" for user ID: ${userId}`);
    
    const searchResults = await Url.find({
      user: userId,
      remarks: { $regex: searchTerm, $options: "i" }, // Case-insensitive search
    });

    console.log(`Search completed. Found ${searchResults.length} results.`);
    return res.status(200).json(searchResults);

  } catch (error) {
    console.error("Error searching URLs:", error);
    return res.status(500).send("Server error.");
  }
});











router.put("/update", isLoggedIn, async (req, res) => {
  try {
    const { name, email, phone } = req.body;

    // Get the user ID from the decoded JWT token (already attached in the req.user)
    const userId = req.user._id;  // Use _id from the decoded token
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update name, email, and phone if provided
    if (name) user.name = name;
    if (email) {
      const isEmailTaken = await User.findOne({ email });
      if (isEmailTaken && isEmailTaken._id.toString() !== userId) {
        return res.status(400).json({ message: "Email is already taken" });
      }
      user.email = email;
    }
    if (phone) user.phone = phone; // Update the phone number

    await user.save(); // Save the updated user details

    // Generate a new token with the updated user data
    const token = jwt.sign({ email: user.email, name: user.name, _id: user._id }, process.env.JWT_SECRET);

    return res.status(200).json({ message: "User updated successfully", token, id: user._id, name: user.name });
  } catch (error) {
    console.log("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});



router.delete("/delete", isLoggedIn, async (req, res) => {
  try {
    // Get the user ID from the decoded JWT token
    const userId = req.user._id;

    // Find the user by ID and delete
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ message: "Server error" });
  }
});


// Assuming you have a route for sharing workspaces

router.post('/share-workspace', isLoggedIn, async (req, res) => {
  const { email, workspaceId, mode } = req.body;
  const token = req.headers['authorization']?.split(' ')[1];  // Extract token from headers

  if (!token) {
    return res.status(400).json({ message: 'Authorization token is required' });
  }

  try {
    const decoded = jwt.decode(token);  // Decode JWT token to get user information
    const userId = decoded._id;

    // Validate mode (either 'edit' or 'viewer')
    const validModes = ['edit', 'viewer'];
    if (!validModes.includes(mode)) {
      return res.status(400).json({ message: 'Invalid mode. Must be either "edit" or "viewer"' });
    }

    // Find the workspace to share
    const workspace = await Workspace.findById(workspaceId);
    console.log('workspaceId:', workspace); // Debugging the workspace
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Ensure the current user is the creator/owner of the workspace
    if (workspace.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'You do not have permission to share this workspace' });
    }

    // Find the user to share with by email
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    // Check if the user is already a member of the workspace
    const existingMember = workspace.members.find(
      (member) => member.userId.toString() === userToShare._id.toString()
    );
    if (existingMember) {
      return res.status(400).json({ message: 'User is already a member of this workspace' });
    }

    // Add shared workspace to the user
    userToShare.sharedWorkspaces.push({
      workspaceId: workspace._id,
      sharedBy: decoded.email,
      mode: mode,
    });
    await userToShare.save();

    // Add the user to the workspace's members array with the correct role
    const role = mode === 'edit' ? 'editor' : 'viewer';
    workspace.members.push({
      userId: userToShare._id,
      role: role,
    });
    await workspace.save();

    res.status(200).json({ message: 'Workspace shared successfully!' });
  } catch (error) {
    console.error('Error sharing workspace:', error);

    // Handle specific error cases
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.post('/sharepoint', async (req, res) => {
  console.log('--- Incoming Request ---');
  console.log('Request Body:', req.body);

  const { workspaceId, sharedUserId, shareMode } = req.body;

  try {
    console.log('Step 1: Validating workspace existence...');
    const workspace = await Workspace.findById(workspaceId);

    if (!workspace) {
      console.error('Workspace not found:', workspaceId);
      return res.status(404).json({ message: 'Workspace not found , this message from backend' });
    }
    console.log('Workspace found:', workspace);

    console.log('Step 2: Checking if the user is already shared with the workspace...');
    const existingShare = workspace.sharedWith.find(
      (entry) => entry.user.toString() === sharedUserId
    );

    if (existingShare) {
      console.error('User already has access to this workspace:', sharedUserId);
      return res.status(400).json({ message: 'User already has access to this workspace' });
    }
    console.log('User does not have access yet. Proceeding to share...');

    console.log('Step 3: Adding new user to sharedWith array...');
    workspace.sharedWith.push({
      user: sharedUserId,
      shareMode: shareMode, // Either 'edit' or 'view'
    });

    console.log('Step 4: Saving the updated workspace...');
    await workspace.save();

    console.log('Workspace shared successfully with user:', sharedUserId);
    res.status(200).json({ message: 'Workspace shared successfully' });

  } catch (error) {
    console.error('Error occurred while sharing workspace:', error);

    if (error.name === 'ValidationError') {
      console.error('Validation Error:', error.message);
      return res.status(400).json({ message: error.message });
    }

    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/email/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      return res.status(404).json({ message: 'User is djqdi not found' });
   
    }
    res.json({ user });
    console.log("User successfully found" ,user)
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/shared/:userId', async (req, res) => {
  try {
    // Find all workspaces where the user is in the sharedWith array
    const sharedWorkspaces = await Workspace.find({
      'sharedWith.user': req.params.userId, // Check if the user is in the sharedWith array
    })
      .populate('owner', 'name email') // Populate owner details (optional)
      .populate('sharedWith.user', 'name email') // Populate shared user details (optional)
      .exec();

    if (sharedWorkspaces.length === 0) {
      return res.status(404).json({ message: 'No shared workspaces found' });
    }

    // Return the shared workspaces in the response
    res.json({ sharedWorkspaces });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.get('/check-access/:workspaceId/:userId', async (req, res) => {
  try {
    const { workspaceId, userId } = req.params;
    
    // Validate workspaceId and userId
    if (!workspaceId || !userId) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    if (!mongoose.Types.ObjectId.isValid(workspaceId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    const sharedUser = workspace.sharedWith.find(
      (user) => user.user.toString() === userId
    );

    if (!sharedUser) {
      return res.status(403).json({ message: 'User does not have access to this workspace' });
    }

    res.json({ shareMode: sharedUser.shareMode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


// POST /sharework: Share a workspace

router.post('/sharework', isLoggedIn, async (req, res) => {
  const { email, workspaceId, permission } = req.body;
  const userId = req.user._id; // The sender's userId

  try {
    if (!email || !workspaceId || !permission) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    if (!['view', 'edit'].includes(permission)) {
      return res.status(400).json({ message: 'Invalid permission value.' });
    }

    // Find the user to share with
    const sharedUser = await User.findOne({ email });
    if (!sharedUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Validate the workspace
    let isValidWorkspace = false;

    // If the workspaceId is the sender's userId, it's their default workspace
    if (workspaceId === String(userId)) {
      console.log("Sharing 'My Workspace'.");
      isValidWorkspace = true;
    } else {
      // Check if the workspace exists and is owned by the sender
      const workspace = await Workspace.findOne({ _id: workspaceId, ownerId: userId });
      console.log('Workspace:', workspace);
      if (workspace) {
        isValidWorkspace = true;
      }
    }

    if (!isValidWorkspace) {
      return res.status(403).json({ message: 'Access denied to the workspace.' });
    }

    // Check if the workspace is already shared
    const existingShare = await SharedWorkspace.findOne({
      userId, // Sender
      sharedUserId: sharedUser._id, // Receiver
      workspaceId, // Workspace being shared
    });
    if (existingShare) {
      return res.status(400).json({ message: 'Workspace already shared.' });
    }

    // Share the workspace
    const newSharedWorkspace = new SharedWorkspace({
      userId, // The sender's ID
      sharedUserId: sharedUser._id, // The receiver's ID
      workspaceId,
      permission,
    });

    await newSharedWorkspace.save();
    res.status(200).json({ message: "Workspace shared successfully as 'My Workspace'!", sharedWorkspace: newSharedWorkspace });
  } catch (error) {
    console.error('Error sharing workspace:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

router.get('/sharedwork', isLoggedIn, async (req, res) => {
  const userId = req.user._id;

  try {
    // Fetch shared workspaces (shared by the user and with the user)
    const sharedByUser = await SharedWorkspace.find({ userId })
      .populate('sharedUserId', 'email name')
      .exec();

    const sharedWithUser = await SharedWorkspace.find({ sharedUserId: userId })
      .populate('userId', 'email name')
      .exec();

    // Helper function to determine workspace name
    const resolveWorkspaceName = async (workspaceId) => {
      try {
        console.log('Resolving name for workspaceId:', workspaceId);

        if (workspaceId === String(userId)) {
          console.log('This is the current user’s default workspace.');
          return 'Your Default Workspace';
        }

        // Check if workspaceId corresponds to a user's default workspace
        const owner = await User.findById(workspaceId, 'name email');
        if (owner) {
          console.log('Owner found for default workspace:', owner);
          return `${owner.name}'s Default Workspace`;
        }

        // Fallback: Check for named workspace
        const namedWorkspace = await Workspace.findById(workspaceId, 'name');
        if (namedWorkspace) {
          console.log('Named workspace found:', namedWorkspace);
          return namedWorkspace.name;
        }

        console.log('Workspace name could not be resolved. Returning "Unnamed Workspace".');
        return 'Unnamed Workspace';
      } catch (err) {
        console.error('Error resolving workspace name:', err);
        return 'Unnamed Workspace';
      }
    };

    // Format workspaces with resolved names
    const formatWorkspaces = async (workspaces) => {
      return Promise.all(
        workspaces.map(async (workspace) => {
          const resolvedName = await resolveWorkspaceName(workspace.workspaceId);
          return {
            ...workspace.toObject(),
            workspaceName: resolvedName,
          };
        })
      );
    };

    const formattedSharedByUser = await formatWorkspaces(sharedByUser);
    const formattedSharedWithUser = await formatWorkspaces(sharedWithUser);

    // Response
    res.status(200).json({
      sharedByUser: formattedSharedByUser,
      sharedWithUser: formattedSharedWithUser,
    });
  } catch (error) {
    console.error('Error fetching shared workspaces:', error);
    res.status(500).json({ message: 'Error fetching shared workspaces.' });
  }
});

router.get('/workspace/:workspaceId', isLoggedIn, async (req, res) => {
  const { workspaceId } = req.params;
  const userId = req.user._id;

  try {
    // Determine if the workspace is the user's default workspace
    if (workspaceId === String(userId)) {
      // Fetch the default workspace data
      const userDefaultData = await SharedWorkspace.findOne({ userId });
      if (!userDefaultData) {
        return res.status(404).json({ message: 'Default workspace not found.' });
      }
      return res.status(200).json({
        workspaceId,
        workspaceName: 'Your Default Workspace',
        content: userDefaultData.content,
      });
    }

    // Check if the workspace is owned by the user
    const ownedWorkspace = await Workspace.findOne({ _id: workspaceId, ownerId: userId });
    if (ownedWorkspace) {
      return res.status(200).json({
        workspaceId: ownedWorkspace._id,
        workspaceName: ownedWorkspace.name,
        content: ownedWorkspace.content,
      });
    }

    // Check if the workspace is shared with the user
    const sharedWorkspace = await SharedWorkspace.findOne({
      workspaceId,
      sharedUserId: userId,
    }).populate('workspaceId'); // Populate workspace details
    if (sharedWorkspace) {
      const workspaceDetails = sharedWorkspace.workspaceId;
      return res.status(200).json({
        workspaceId: workspaceDetails._id,
        workspaceName: workspaceDetails.name || `${sharedWorkspace.userId}'s Default Workspace`,
        content: workspaceDetails.content,
        permission: sharedWorkspace.permission,
      });
    }

    // If no match is found, deny access
    res.status(403).json({ message: 'Access denied to the workspace.' });
  } catch (error) {
    console.error('Error fetching workspace:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});



module.exports = router;
