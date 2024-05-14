const express = require('express');
const app = express();
const path = require('path');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const mongoose = require('mongoose');
const HealthRecord = require('./models/HealthRecord');
const port = 5000;

app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/create', (req, res) => {
    const { recordID, name, age, gender, weight, height, condition } = req.body;

    if (!recordID || !name || !age || !gender || !weight || !height || !condition) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    const healthRecord = new HealthRecord({
        recordID,
        name,
        age,
        gender,
        weight,
        height,
        condition
    });

    healthRecord.save()
        .then(record => {
            res.json(record); 
        })
        .catch(err => {
            console.error('Error creating record:', err);
            res.status(500).json({ error: 'An error occurred while creating the record.' });
        });
});

app.get('/read/:id', (req, res) => {
    const recordId = req.params.id;
  
    if (!recordId) {
        return res.status(400).json({ error: 'Record ID is required.' });
    }

    HealthRecord.findById(recordId)
        .then(record => {
            if (!record) {
                res.status(404).json({ error: 'Record not found' });
                return;
            }
            res.json(record);
        })
        .catch(err => {
            console.error('Error reading record:', err);
            res.status(500).json({ error: 'An error occurred while reading the record.' });
        });
});

const PROTO_PATH = './health.proto';
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    include: ['./health.proto']
};

const packageDefinition = protoLoader.loadSync(PROTO_PATH, options);
const healthProto = grpc.loadPackageDefinition(packageDefinition);

const grpcserver = new grpc.Server();

const mongoURI = 'mongodb://127.0.0.1:27017/';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('MongoDB Connected');

        insertDummyData();
    })
    .catch(err => console.error('MongoDB Connection Error:', err));

function insertDummyData() {
    HealthRecord.insertMany(RecordDummy.RecordDummy)
        .then(() => console.log('Dummy data inserted successfully'))
        .catch(err => console.error('Error inserting dummy data:', err));
}

grpcserver.addService(healthProto.HealthTracker.service, {
    CreateRecord: (call, callback) => {
        const healthRecord = new HealthRecord(call.request);
        healthRecord.save()
            .then(record => callback(null, record))
            .catch(err => callback(err, null));
    },
    ReadRecord: (call, callback) => {
        HealthRecord.findById(call.request.id)
            .then(record => callback(null, record))
            .catch(err => callback(err, null));
    },
    UpdateRecord: (call, callback) => {
        HealthRecord.findByIdAndUpdate(call.request.id, call.request, { new: true })
            .then(record => callback(null, record))
            .catch
    },
    DeleteRecord: (call, callback) => {
        HealthRecord.findByIdAndDelete(call.request.id)
            .then(() => callback(null, { message: 'Record deleted successfully' }))
            .catch(err => callback(err, null));
    }
});

grpcserver.bindAsync('127.0.0.1:50051', grpc.ServerCredentials.createInsecure(), () => {
    grpcserver.start();
    console.log('gRPC server running at 127.0.0.1:50051');
});

let RecordDummy = {
    RecordDummy: [
        {
            recordID: "1",
            name: "Rudi",
            age: "19",
            gender: "male",
            weight: "70",
            height: "1.75",
            condition: "healthy"
        },
        {
            recordID: "2",
            name: "lana",
            age: "20",
            gender: "female",
            weight: "50",
            height: "1.59",
            condition: "healthy"
        }
    ]
};

module.exports = grpcserver;

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
