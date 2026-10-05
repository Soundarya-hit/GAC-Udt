require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

mongoose.connect(MONGO_URI)
.then(() => console.log("Successfully connected to MongoDB Atlas (Database: gacudt)"))
.catch((err) => console.error("MongoDB connection error:", err));

// Schemas & Models

const resourceSchema = new mongoose.Schema({ title: String, type: String, url: String });
const Resource = mongoose.model('Resource', resourceSchema, 'resources');

const invitationSchema = new mongoose.Schema({ title: String, date: String, desc: String });
const Invitation = mongoose.model('Invitation', invitationSchema, 'invitations');

const newsSchema = new mongoose.Schema({ text: String });
const News = mongoose.model('News', newsSchema, 'news');

const photoSchema = new mongoose.Schema({ title: String, desc: String, image: String });
const Photo = mongoose.model('Photo', photoSchema, 'photos');

// Updated Department Schema supporting images, lab details, and classrooms
const departmentSchema = new mongoose.Schema({ 
  name: String, 
  tag: String, 
  desc: String,
  image: String,
  labAvailabilities: String,
  classRooms: String,
  galleryImages: [String],
  resources: [{
    title: String,
    type: { type: String, enum: ['image', 'video', 'pdf', 'csv', 'link', 'document'] },
    url: String
  }]
});
const Department = mongoose.model('Department', departmentSchema, 'departments');

const serviceSchema = new mongoose.Schema({ title: String, desc: String });
const Service = mongoose.model('Service', serviceSchema, 'services');

const achieverSchema = new mongoose.Schema({ name: String, dept: String, desc: String, photo: String });
const Achiever = mongoose.model('Achiever', achieverSchema, 'achievers');

const configSchema = new mongoose.Schema({
  stats: { students: String, staff: String, experience: String },
  aboutUsText: String,
  missionText: String,
  visionText: String,
  contactInfo: { address: String, phone: String, email: String },
  principalInfo: { name: String, designation: String, photo: String, message: String },
  siteConfig: { logo: String, bgVideo: String },
  adminUsername: { type: String, default: 'GAC@udt' },
  adminPassword: { type: String, default: 'GAC@2026' }
}, { strict: false });
const SiteConfig = mongoose.model('SiteConfig', configSchema, 'site_configs');

// Get All Data Route (Fixed to include resources collection)
app.get('/api/data', async (req, res) => {
  try {
    const invitations = await Invitation.find();
    const news = await News.find();
    const photos = await Photo.find();
    const departments = await Department.find();
    const services = await Service.find();
    const achievers = await Achiever.find();
    const resources = await Resource.find(); // Fixed: Fetching resources from DB
    let config = await SiteConfig.findOne();

    if (!config) {
      config = await SiteConfig.create({
        stats: { students: '3200+', staff: '140+', experience: '50+' },
        aboutUsText: 'Government Arts College, Udumalpet has served students with excellence...',
        missionText: 'To provide accessible, high-standard higher education to rural youth...',
        visionText: 'To evolve into a premier higher education institution fostering academic excellence...',
        contactInfo: { address: 'Government Arts College, Udumalpet - 642126', phone: '+91 04252 XXXX', email: 'principal@gacudumalpet.ac.in' },
        principalInfo: { name: 'Dr. R. Vasanthakumar', designation: 'Principal', photo: '', message: 'Education is the most powerful weapon which you can use to change the world.' },
        siteConfig: { logo: '', bgVideo: '' },
        adminUsername: 'GAC@udt',
        adminPassword: 'GAC@2026'
      });
    }

    res.json({ invitations, news, photos, departments, services, achievers, resources, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login Authentication Route
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let config = await SiteConfig.findOne();
    const dbUsername = config?.adminUsername || 'GAC@udt';
    const dbPassword = config?.adminPassword || 'GAC@2026';

    if (username === dbUsername && password === dbPassword) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Admin Username or Password!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Teacher Login Authentication Route (Mock/Sample)
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username && password) {
      res.json({ 
        success: true, 
        teacher: { name: username, department: 'Computer Science', designation: 'Assistant Professor', email: `${username}@gacudumalpet.ac.in` } 
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Teacher Credentials!' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generic CRUD API Endpoints for Collections
const createCrudRoutes = (model, routeName) => {
  app.get(`/api/${routeName}`, async (req, res) => {
    try { const items = await model.find(); res.json(items); } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.post(`/api/${routeName}`, async (req, res) => {
    try { const newItem = new model(req.body); const saved = await newItem.save(); res.json(saved); } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.put(`/api/${routeName}/:id`, async (req, res) => {
    try { const updated = await model.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(updated); } catch (err) { res.status(500).json({ error: err.message }); }
  });

  app.delete(`/api/${routeName}/:id`, async (req, res) => {
    try { await model.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
  });
};

createCrudRoutes(Resource, 'resources');
createCrudRoutes(Invitation, 'invitations');
createCrudRoutes(News, 'news');
createCrudRoutes(Photo, 'photos');
createCrudRoutes(Department, 'departments');
createCrudRoutes(Service, 'services');
createCrudRoutes(Achiever, 'achievers');

// Update Site Configuration Route
app.put('/api/config', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) {
      config = new SiteConfig(req.body);
    } else {
      config.set(req.body);
    }
    const updatedConfig = await config.save();
    res.json(updatedConfig);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));