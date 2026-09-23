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
const invitationSchema = new mongoose.Schema({ title: String, date: String, desc: String });
const Invitation = mongoose.model('Invitation', invitationSchema, 'invitations');

const newsSchema = new mongoose.Schema({ text: String });
const News = mongoose.model('News', newsSchema, 'news');

const photoSchema = new mongoose.Schema({ title: String, desc: String, image: String });
const Photo = mongoose.model('Photo', photoSchema, 'photos');

const departmentSchema = new mongoose.Schema({ name: String, tag: String, desc: String });
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

// Get All Data Route
app.get('/api/data', async (req, res) => {
  try {
    const invitations = await Invitation.find();
    const news = await News.find();
    const photos = await Photo.find();
    const departments = await Department.find();
    const services = await Service.find();
    const achievers = await Achiever.find();
    let config = await SiteConfig.findOne();

    if (!config) {
      config = await SiteConfig.create({
        stats: { students: '3200+', staff: '140+', experience: '50+' },
        aboutUsText: 'Government Arts College, Udumalpet has served students...',
        missionText: 'To provide accessible, high-standard higher education...',
        visionText: 'To evolve into a premier higher education institution...',
        contactInfo: { address: 'Government Arts College, Udumalpet - 642126', phone: '+91 04252 XXXX', email: 'principal@gacudumalpet.ac.in' },
        principalInfo: { name: 'Dr. R. Vasanthakumar', designation: 'Principal', photo: '', message: 'Education is the most powerful weapon...' },
        siteConfig: { logo: '', bgVideo: '' },
        adminUsername: 'GAC@udt',
        adminPassword: 'GAC@2026'
      });
    }

    res.json({ invitations, news, photos, departments, services, achievers, config });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Admin Login Authentication Route
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    let config = await SiteConfig.findOne();
    
    const dbUsername = config && config.adminUsername ? config.adminUsername : 'GAC@udt';
    const dbPassword = config && config.adminPassword ? config.adminPassword : 'GAC@2026';

    if (username === dbUsername && password === dbPassword) {
      res.json({ success: true, message: 'Login successful' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Username or Password!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Teacher Login Authentication Route (Dummy check for integration safety)
app.post('/api/teacher/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    // Add your teacher authentication logic here if needed
    if (username && password) {
      res.json({ success: true, teacher: { name: 'Faculty Member', department: 'General', designation: 'Professor', email: username } });
    } else {
      res.status(401).json({ success: false, message: 'Invalid Teacher Credentials!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Invitations (Notices) CRUD
app.post('/api/invitations', async (req, res) => {
  try { const item = await Invitation.create(req.body); res.json(item); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/invitations/:id', async (req, res) => {
  try { 
    const item = await Invitation.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
    res.json(item); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});
app.delete('/api/invitations/:id', async (req, res) => {
  try { await Invitation.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// News Gallery CRUD
app.post('/api/news', async (req, res) => {
  try { const item = await News.create(req.body); res.json(item); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/news/:id', async (req, res) => {
  try { 
    const item = await News.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
    res.json(item); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});
app.delete('/api/news/:id', async (req, res) => {
  try { await News.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Photo Album CRUD
app.post('/api/photos', async (req, res) => {
  try { const item = await Photo.create(req.body); res.json(item); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/photos/:id', async (req, res) => {
  try { 
    const item = await Photo.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
    res.json(item); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});
app.delete('/api/photos/:id', async (req, res) => {
  try { await Photo.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Departments CRUD
app.post('/api/departments', async (req, res) => {
  try { const item = await Department.create(req.body); res.json(item); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/departments/:id', async (req, res) => {
  try { 
    const item = await Department.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
    res.json(item); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});
app.delete('/api/departments/:id', async (req, res) => {
  try { await Department.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Services CRUD
app.post('/api/services', async (req, res) => {
  try { const item = await Service.create(req.body); res.json(item); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/services/:id', async (req, res) => {
  try { 
    const item = await Service.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
    res.json(item); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});
app.delete('/api/services/:id', async (req, res) => {
  try { await Service.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Achievers CRUD
app.post('/api/achievers', async (req, res) => {
  try { const item = await Achiever.create(req.body); res.json(item); } catch (err) { res.status(500).json({ error: err.message }); }
});
app.put('/api/achievers/:id', async (req, res) => {
  try { 
    const item = await Achiever.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' }); 
    res.json(item); 
  } catch (err) { 
    res.status(500).json({ error: err.message }); 
  }
});
app.delete('/api/achievers/:id', async (req, res) => {
  try { await Achiever.findByIdAndDelete(req.params.id); res.json({ success: true }); } catch (err) { res.status(500).json({ error: err.message }); }
});

// Config Update Route
app.put('/api/config', async (req, res) => {
  try {
    let config = await SiteConfig.findOne();
    if (!config) { config = new SiteConfig(req.body); } else { Object.assign(config, req.body); }
    await config.save();
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));