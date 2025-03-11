const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http');
const socketIo = require('socket.io');
const cron = require('node-cron');
const fetch = require('node-fetch').default; 

const authRoutes = require('./routes/authRoutes');
const roleRoutes = require('./routes/roleRoutes');
const trainingRoutes = require('./routes/trainingObjectivesRoutes');
const techstackRoutes = require('./routes/techstackRoutes');
const primarySkillRoutes = require('./routes/primarySkillRoutes');
const projectRoutes = require('./routes/projectRoutes');
const employeeRoutes = require('./routes/employeeSearchByNameRoutes');
const employeeSearchByEmailRoutes = require('./routes/employeeSearchByEmailRoutes');
const serviceDivisionRoutes = require('./routes/serviceDivisionRoutes');
const employeeLevelRoutes = require('./routes/employeeLevelRoutes');
const newTrainingRequestRoutes = require('./routes/newTrainingRequestRoutes');
const trainingRequestEmployeeLevelRoutes = require('./routes/trainingRequestEmployeeLevelRoutes');
const getMaxRequestIdRoutes = require('./routes/getMaxRequestIdRoutes');
const getAllTrainingRequestsRoutes = require('./routes/getAllTrainingRequestsRoutes');
const empNewTrainingRequestedRoutes = require('./routes/empNewTrainingRequestedRoutes');
const trainingRequestPrimarySkillRoutes = require('./routes/trainingRequestPrimarySkillRoutes');
const managerSearchByNameRoutes = require('./routes/managerSearchByNameRoutes');
const getEmpNewTrainingRequestedRoutes = require('./routes/getEmpNewTrainingRequestedRoutes');
const requestStatusRoutes = require('./routes/requestStatusRoutes');
const getTrainingRequestDetailsRoutes = require('./routes/getTrainingRequestDetailsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const commentRoutes = require('./routes/commentRoutes');
const empdetailsforcommentsRoutes = require('./routes/getEmpDetailsCommentRoutes');
const empDeleteTrainingRequestedRoutes = require('./routes/empDeleteTrainingRequestedRoutes');
const emailRoutes = require('./routes/emailRoutes'); // Add this line
const employeeDesignationRoutes = require('./routes/employeeDesignationRoutes'); // Add this line
const employeeWithoutManagerRoutes = require('./routes/employeeWithoutManagerRoutes');
const emailSearchWithoutManagerIdRoutes = require('./routes/emailSearchWithoutManagerIdRoutes'); // Add this line
const empUpdateTrainingRequestedRoutes = require('./routes/empUpdateTrainingRequestedRoutes'); // Add this line
const courseSearchRoutes = require('./routes/courseSearchRoutes');
const courseTypeRoutes = require('./routes/courseTypeRoutes');
const assignCourseRoutes = require('./routes/assignCourseRoutes');
const getAssignedCoursesRoutes = require('./routes/getassignedCoursesRoutes');
const courseStatusRoutes = require('./routes/courseStatusRoutes');
const learnerRoutes = require('./routes/learnerRoutes'); // Add this line
const orgLevelLearnerRoutes = require('./routes/orgLevelLearnerRoutes'); // Add this line
const getEmpLearningCompletionRoutes = require('./routes/getEmpLearningCompletionRoutes');
const getEmpsforCapdev = require('./routes/getEmployeesBasedOnRoleRoutes');
const getsetEmpBasedOnIdRoutes = require('./routes/getsetEmpBasedOnIdRoutes');
const loginRoutes = require('./routes/loginRoutes');
const { getMatrixProjects } = require('./services/matrixProjectService');
const { getCourses } = require('./services/courseService');
const TrainingCommentRoutes = require('./routes/initiateTrainingCommentsRoutes');
const getAllRolesRoutes = require('./routes/getAllRolesRoutes');



// Import the syncEmployees function
const { syncEmployees } = require('./services/StoreEmployeesService'); // Added


const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",  // Update with the URL where your frontend is running
        methods: ["GET", "POST"]
    }
});

// Schedule the getMatrixProjects service to run every 24 hours
cron.schedule('0 0 * * *', async () => {
    console.log('Running getMatrixProjects service...');
    await getMatrixProjects();
});

// Fetch data from Matrix Project API
app.get('/api/fetch-matrix-projects', async (req, res) => {
    try {
        await getMatrixProjects();
        res.status(200).json({ message: 'Data fetched and saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
});

// Schedule the getCourses service to run every 24 hours
cron.schedule('0 0 * * *', async () => {
    console.log('Running getCourses service...');
    await getCourses();
});


// Added employee sync cron job
cron.schedule('0 0 * * *', async () => {
    console.log('Running employee sync service...');
    await syncEmployees();
});


// Added manual sync endpoint
app.get('/api/sync-employees', async (req, res) => {
    try {
        await syncEmployees();
        res.status(200).json({ message: 'Employee sync completed successfully' });
    } catch (error) {
        console.error('Manual employee sync failed:', error);
        res.status(500).json({ message: 'Employee sync failed' });
    }
});


// Fetch data from Academy API
app.get('/api/fetch-courses', async (req, res) => {
    try {
        await getCourses();
        res.status(200).json({ message: 'Data fetched and saved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
});

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Authentication routes
app.use('/api/auth', authRoutes);

// Role management routes
app.use('/api/role', roleRoutes);

// Training objectives routes
app.use('/api/training', trainingRoutes);

// Tech stack routes
app.use('/api/techstack', techstackRoutes);

// Primary skill routes
app.use('/api/primaryskill', primarySkillRoutes);

// Project routes
app.use('/api/project', projectRoutes);

// Employee search by name routes
app.use('/api/employeeSearchByName', employeeRoutes);

// Employee search by email routes
app.use('/api/employee', employeeSearchByEmailRoutes);

// Service division routes
app.use('/api', serviceDivisionRoutes);

// Employee level routes
app.use('/api/employee-level', employeeLevelRoutes);

// New training request routes
app.use('/api/newtrainingrequest', newTrainingRequestRoutes);

// Training request employee level routes
app.use('/api/training-request', trainingRequestEmployeeLevelRoutes);

// Get max request ID routes
app.use('/api/get-max-request-id', getMaxRequestIdRoutes);

// Get all training requests routes
app.use('/api/training-requests', getAllTrainingRequestsRoutes);

// Employee new training requested routes
app.use('/api/empNewTrainingRequested', empNewTrainingRequestedRoutes);

// Training request primary skills routes
app.use('/api/trainingRequestPrimarySkills', trainingRequestPrimarySkillRoutes);

// Manager search by name routes
app.use('/api/managerSearchByName', managerSearchByNameRoutes);

// Get employee new training requested routes
app.use('/api/getEmpNewTrainingRequested', getEmpNewTrainingRequestedRoutes);



// Request status routes
app.use('/api/request-status', requestStatusRoutes);

// Training request details routes
app.use('/api', getTrainingRequestDetailsRoutes);

// Notification routes
app.use('/api/notifications', notificationRoutes);

// Comment routes
app.use('/api/comments', commentRoutes);

// Employee details for comments routes
app.use('/api/getempdetails', empdetailsforcommentsRoutes);

// Employee delete training requested routes
app.use('/api/empDeleteTrainingRequested', empDeleteTrainingRequestedRoutes);

// Email routes
app.use('/api/email', emailRoutes); // Add this line

// Employee designation routes
app.use('/api/employeeDesignation', employeeDesignationRoutes); // Add this line

app.use('/api/employees', employeeWithoutManagerRoutes);

// Email search without manager ID routes
app.use('/api/emailSearchWithoutManagerId', emailSearchWithoutManagerIdRoutes); // Add this line

// Update training request routes
app.use('/api/empUpdateTrainingRequested', empUpdateTrainingRequestedRoutes); // Add this line

// Learner routes
app.use('/api/learners', learnerRoutes); // Add this line

//Get Cpadev employees
app.use('/api/emp',getEmpsforCapdev );
 
//getempbyid and setassignedto routes
app.use('/api/getemp', getsetEmpBasedOnIdRoutes);

//initiateTrainingComments
app.use('/api/training-comment', TrainingCommentRoutes);
 
//orglevellearner
app.use('/api/orgLevelLearners', orgLevelLearnerRoutes); // Add this line

//get all roles
app.use('/api/getAllRoles', getAllRolesRoutes);

app.use('/api/employee-completion-status', getEmpLearningCompletionRoutes);

app.use('/api', loginRoutes)
//capdev courses Assign and status update routes

app.use('/api/courses', courseSearchRoutes);
app.use('/api/course-types', courseTypeRoutes);
app.use('/api/assign-courses', assignCourseRoutes);
app.use('/api/assigned-courses', getAssignedCoursesRoutes);
app.use('/api/course-status', courseStatusRoutes);


// WebSocket connection for real-time updates
io.on('connection', (socket) => {
    console.log('New client connected');

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
});

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});