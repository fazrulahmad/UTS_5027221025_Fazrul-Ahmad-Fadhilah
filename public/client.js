const grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

const PROTO_PATH = './health.proto';
var packageDefinition = protoLoader.loadSync(PROTO_PATH);
const healthProto = grpc.loadPackageDefinition(packageDefinition);

const client = new healthProto.HealthTracker('localhost:50051', grpc.credentials.createInsecure());

const form = document.getElementById('healthForm');
    const responseDiv = document.getElementById('response');

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const record = {
        name: formData.get('name'),
        age: parseInt(formData.get('age')),
        gender: formData.get('gender'),
        weight: parseFloat(formData.get('weight')),
        height: parseFloat(formData.get('height')),
        condition: formData.get('condition')
      };
      
      createRecord(record);
    });

    function createRecord(record) {
      fetch('/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(record)
      })
      .then(response => response.json())
      .then(data => {
        responseDiv.textContent = 'Record created successfully.';
        form.reset();
      })
      .catch(error => {
        console.error('Error:', error);
        responseDiv.textContent = 'An error occurred. Please try again later.';
      });
    }

  function displayRecord(record) {
      const displayElement = document.getElementById('HealthRecord');
      displayElement.innerHTML = `
        <p>Name: ${record.name}</p>
        <p>Age: ${record.age}</p>
        <p>Gender: ${record.gender}</p>
        <p>Weight: ${record.weight} kg</p>
        <p>Height: ${record.height} cm</p>
        <p>Condition: ${record.condition}</p>
      `;
    }

  function readRecord(recordID) {
  fetch(`/read/${recordID}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(record => {
      console.log('Record retrieved:', record);
      displayRecord(record);
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function displayRecord(record) {
  const displayElement = document.getElementById('HealthRecord');
  displayElement.innerHTML = `
    <p>Name: ${record.name}</p>
    <p>Age: ${record.age}</p>
    <p>Gender: ${record.gender}</p>
    <p>Weight: ${record.weight} kg</p>
    <p>Height: ${record.height} cm</p>
    <p>Condition: ${record.condition}</p>
  `;
}

function updateRecord(record) {
  client.UpdateRecord(record, (err, response) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Record updated:', response);
  });
}

function deleteRecord(recordID) {
  client.DeleteRecord({ recordID }, (err, _response) => {
    if (err) {
      console.error('Error:', err);
      return;
    }
    console.log('Record deleted');
  });
}

module.exports = {
  createRecord,
  readRecord,
  updateRecord,
  deleteRecord
};
