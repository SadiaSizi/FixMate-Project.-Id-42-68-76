const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json()); 
app.use(cors());       

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '12345sizi', 
    database: 'fixmate_db'
});

db.connect(err => {
    if (err) console.error("Database connection failed: " + err.stack);
    else console.log("Connected to MySQL Database!");
});

app.post('/api/register', async (req, res) => {
    const { full_name, email, password, role } = req.body; 
    
    try {
        const hashpassword = await bcrypt.hash(password, 10);
        
        const sql = "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)";
        
        db.query(sql, [full_name, email, hashpassword, role], (err, result) => {
            if (err) {
                console.log("DB Error:", err.message);
                return res.status(500).json({ error: "Email already exists or Database error" });
            }
            res.json({ message: "Success! User created." });
        });
    } catch (error) {
        res.status(500).json({ error: "Server Error" });
    }
});

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const sql = "SELECT * FROM users WHERE email = ?";
        db.query(sql, [email], async (err, results) => {
            if (err) return res.status(500).json({ error: "Database error" });

            if (results.length === 0) {
                return res.status(401).json({ error: "User not found!" });
            }

            const user = results[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (isMatch) {
                res.json({ 
                    message: "Login successful!", 
                    user: { full_name: user.full_name, role: user.role } 
                });
            } else {
                res.status(401).json({ error: "Incorrect password!" });
            }
        });
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.get('/api/dashboard-stats', (req, res) => {
    const q1 = "SELECT COUNT(*) as total FROM assets";
    const q2 = "SELECT COUNT(*) as total FROM users WHERE role = 'Technician'";
    
    db.query(q1, (err, assetResult) => {
        if (err) return res.status(500).json(err);
        
        db.query(q2, (err, techResult) => {
            if (err) return res.status(500).json(err);
            
            res.json({
                totalAssets: assetResult[0].total,
                totalTechs: techResult[0].total,
                systemUptime: "98%"
            });
        });
    });
});


app.get('/api/assets', (req, res) => {
    const sql = "SELECT * FROM assets";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


app.post('/api/assets', (req, res) => {
    const { asset_name, asset_type, location, status } = req.body;

    const sql = "INSERT INTO assets (asset_name, asset_type, location, status) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [asset_name, asset_type, location, status], (err, result) => {
        if (err) {
            console.error("Error inserting asset:", err);
            return res.status(500).json({ error: "Failed to add asset" });
        }
        res.json({ message: "Asset added successfully!", id: result.insertId });
    });
});


app.get('/api/tech-tasks/:techName', (req, res) => {
    const techName = req.params.techName;
    const sql = `
        SELECT t.*, a.asset_name, a.location 
        FROM maintenance_tasks t 
        JOIN assets a ON t.asset_id = a.asset_id 
        WHERE t.technician_name = ?
        ORDER BY t.deadline ASC`;

    db.query(sql, [techName], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.put('/api/update-task/:id', (req, res) => {
    const taskId = req.params.id;
    const { status, description } = req.body;
    
    const sql = "UPDATE maintenance_tasks SET status = ?, description = ? WHERE id = ?";
    db.query(sql, [status, description, taskId], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: "Update successful" });
    });
});

app.post('/api/assign-task', (req, res) => {
    const { asset_id, technician_name, priority, description, deadline } = req.body;
    
    const sql = `INSERT INTO maintenance_tasks 
                (asset_id, technician_name, priority, description, deadline, status) 
                VALUES (?, ?, ?, ?, ?, 'assigned')`;
    
    db.query(sql, [asset_id, technician_name, priority, description, deadline], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database error" });
        }
        res.json({ message: "Task assigned successfully!", taskId: result.insertId });
    });
});

app.get('/api/technicians', (req, res) => {
    const sql = "SELECT full_name FROM users WHERE role = 'Technician'";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.post('/api/submit-request', (req, res) => {
    const { employee_name, title, location, asset_detail, description } = req.body;
    
    const sql = `INSERT INTO employee_requests 
                (employee_name, title, location, asset_detail, description) 
                VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [employee_name, title, location, asset_detail, description], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to save request" });
        }
        res.json({ message: "Request submitted successfully!" });
    });
});


app.get('/api/employee-requests', (req, res) => {
    const sql = "SELECT * FROM employee_requests WHERE status = 'pending' ORDER BY created_at DESC";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});


app.post('/api/approve-request', (req, res) => {
    const { request_id, technician_name, priority, deadline } = req.body;

    db.query("SELECT * FROM employee_requests WHERE request_id = ?", [request_id], (err, results) => {
        if (err || results.length === 0) return res.status(500).send("Request not found");
        
        const reqData = results[0];
        const taskSql = `INSERT INTO maintenance_tasks 
            (asset_name, location, description, technician_name, priority, deadline, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'assigned')`;
        
        const taskValues = [
            reqData.title, 
            reqData.location, 
            `Employee Report: ${reqData.description} (Asset: ${reqData.asset_detail})`,
            technician_name,
            priority,
            deadline
        ];

        db.query(taskSql, taskValues, (err) => {
            if (err) return res.status(500).send(err);

            db.query("UPDATE employee_requests SET status = 'approved' WHERE request_id = ?", [request_id], (err) => {
                res.json({ message: "Request approved and task assigned!" });
            });
        });
    });
});

app.get('/api/my-requests/:name', (req, res) => {
    const employeeName = req.params.name;
    const sql = "SELECT title, location, status, created_at FROM employee_requests WHERE employee_name = ? ORDER BY created_at DESC";
    db.query(sql, [employeeName], (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));