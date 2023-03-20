const http = require('http');
const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();

const { studentsDefault } = require('./data/students');
let students = [...studentsDefault];

app.use(bodyParser.json());
app.use((req, res, next) => {
	res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
	res.setHeader('Access-Control-Allow-Credentials', 'true');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin, X-Requested-With, Content-Type, Accept, Authorization, If-Match, X-WG-Tenant-Id, x-signalr-user-agent, x-msi-continuation'
	);
	res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,OPTIONS,POST,DELETE');
	res.setHeader('Access-Control-Expose-Headers', 'ETag, x-msi-continuation');

	delete req.headers['if-none-match'];

	next();
});

app.get('/', (req, res, next) => {
	res.json({
		status: true,
		message: 'Up and running',
	});

	next();
});
app.get('/students', (req, res) => {
	res.status(200).json(students);
});

app.get('/students/:id', (req, res) => {
	const id = req.params.id || null;
	if (id) {
		const student = students.filter(s => s.id === Number(id));
		res.status(200).json(...student);
	} else {
		return res.status(400).json({ status: 'error' });
	}
});

app.put('/students/:id', (req, res) => {
	const id = req.params.id || null;
	if (id) {
		const student = students.find(s => s.id === Number(id));
		if (!student) {
			return res.status(404).json({ status: 'not found student' });
		}
		const { name, surname, age } = req.body;
		students = students.map(student => {
			return student.id === Number(id)
				? {
						...student,
						name: name || student.name,
						surname: surname || student.surname,
						age: age || student.age,
				  }
				: student;
		});
		res.status(200).json(students);
	} else {
		return res.status(400).json({ status: 'get student id' });
	}
});

app.post('/student', (req, res) => {
	const { name, surname, age } = req.body;
	const id = students.length + 1;
	students.push({ id, name, surname, age });
	res.status(200).json(students);
});

const port = 8080;
app.listen(8080, () => {
	console.log(`Server is running at port ${port}`);
});
