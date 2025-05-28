const express = require('express');
const fs = require('fs');
const path = require('path');
const csv = require('csvtojson');
const iconv = require('iconv-lite');
const cors = require('cors');

const app = express();
const PORT = 3010;

app.use(cors());

const allowedOrigins = ['http://192.168.109.181:3000'];

// app.use(cors({
//   origin: function (origin, callback) {
//     // ถ้าไม่มี origin (เช่น request จาก curl/postman) หรืออยู่ใน list -> allow
//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// }));

const inputFile1 = './tks1.csv';
const inputFile3 = './tks3.csv';
const inputFile5 = './tks5.csv';
const inputFile12 = './tks12.csv';
const inputFile19 = './tks19.csv';

// GET endpoint สำหรับอ่านและส่ง output.json
app.get('/api/data1', (req, res) => {

  const jsonPath = path.join(__dirname, 'output1.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Unable to read JSON data' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// app.get('/api/data3', (req, res) => {

//   const jsonPath = path.join(__dirname, 'output3.json');

//   fs.readFile(jsonPath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading JSON file:', err);
//       return res.status(500).json({ error: 'Unable to read JSON data' });
//     }

//     try {
//       const jsonData = JSON.parse(data);
//       res.json(jsonData);
//     } catch (parseErr) {
//       console.error('Error parsing JSON:', parseErr);
//       res.status(500).json({ error: 'Invalid JSON format' });
//     }
//   });
// });

app.get('/api/data3', (req, res) => {
  const jsonPath = path.join(__dirname, 'output3.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Unable to read JSON data' });
    }

    try {
      const jsonData = JSON.parse(data);

      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      const search = (req.query.search || "").toLowerCase();

      if (page < 1) page = 1;
      if (limit < 1) limit = 10;

      const filteredData = jsonData.filter(item => {
        const idcard = item.idcard ? item.idcard.toLowerCase() : "";
        const dspname = item.dspname ? item.dspname.toLowerCase() : "";
        return idcard.includes(search) || dspname.includes(search);
      });

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;

      const paginatedData = filteredData.slice(startIndex, endIndex);

      res.json({
        page,
        limit,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
        data: paginatedData
      });

    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});


app.get('/api/data5', (req, res) => {
  const jsonPath = path.join(__dirname, 'output5.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Unable to read JSON data' });
    }

    try {
      const jsonData = JSON.parse(data);

      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      const control = (Number(req.query.control) || 0);
      const ampurFilter = (req.query.ampur || '').toLowerCase();
      const maleFilter = (req.query.male || '').toLowerCase();
      const ageGroup = parseInt(req.query.ageGroup) || 0; // 1–5

      if (page < 1) page = 1;
      if (limit < 1) limit = 10;

      let ageMin = 0;
      let ageMax = 200; // large number for "unlimited"
      switch (ageGroup) {
        // case 1:
        //   ageMax = 12;
        //   break;
        // case 2:
        //   ageMin = 13;
        //   ageMax = 34;
        //   break;
        case 1:
          ageMin = 35;
          ageMax = 44;
          break;
        case 2:
          ageMin = 45;
          ageMax = 59;
          break;
        case 3:
          ageMin = 60;
          break;
        default:
          ageMin = 0;
          ageMax = 200;
      }

      let hba1cMin = 0;
      let hba1cMax = 20;
      switch (control) {
        case 1:
          hba1cMin = 0.1;
          hba1cMax = 6.9;
          break;
        case 2:
          hba1cMin = 7;
          break;
        case 3:
          hba1cMin = "";
          hba1cMax = "";
          break;
        default:
          hba1cMin = 0;
          hba1cMax = 20;
      }

      const filteredData = jsonData.filter(item => {
        const hba1c = Number(item.hba1c) || 0;
        const ampur = item.ampur?.toLowerCase() || '';
        const male = item.male?.toLowerCase() || '';
        const age = parseInt(item.age) || 0;

        return (
          (hba1c >= hba1cMin && hba1c <= hba1cMax) &&
          (!ampurFilter || ampur.includes(ampurFilter)) &&
          (!maleFilter || male === maleFilter) &&
          (age >= ageMin && age <= ageMax)
        );
      });

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      res.json({
        page,
        limit,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
        data: paginatedData
      });

    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});


app.get('/api/data12', (req, res) => {
  const jsonPath = path.join(__dirname, 'output12.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Unable to read JSON data' });
    }

    try {
      const jsonData = JSON.parse(data);

      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 10;
      const control = (Number(req.query.control) || 0);
      const ampurFilter = (req.query.ampur || '').toLowerCase();
      const maleFilter = (req.query.male || '').toLowerCase();
      const ageGroup = parseInt(req.query.ageGroup) || 0; // 1–5

      if (page < 1) page = 1;
      if (limit < 1) limit = 10;

      let ageMin = 0;
      let ageMax = 200; // large number for "unlimited"
      switch (ageGroup) {
        // case 1:
        //   ageMax = 12;
        //   break;
        // case 2:
        //   ageMin = 13;
        //   ageMax = 34;
        //   break;
        case 1:
          ageMin = 35;
          ageMax = 44;
          break;
        case 2:
          ageMin = 45;
          ageMax = 59;
          break;
        case 3:
          ageMin = 60;
          break;
        default:
          ageMin = 0;
          ageMax = 200;
      }

      let hba1cMin = 0;
      let hba1cMax = 20;
      switch (control) {
        case 1:
          hba1cMin = 0.1;
          hba1cMax = 6.9;
          break;
        case 2:
          hba1cMin = 7;
          break;
        case 3:
          hba1cMin = "";
          hba1cMax = "";
          break;
        default:
          hba1cMin = 0;
          hba1cMax = 20;
      }

      const filteredData = jsonData.filter(item => {
        const hba1c = Number(item.hba1c) || 0;
        const ampur = item.ampur?.toLowerCase() || '';
        const male = item.male?.toLowerCase() || '';
        const age = parseInt(item.age) || 0;

        return (
          (hba1c >= hba1cMin && hba1c <= hba1cMax) &&
          (!ampurFilter || ampur.includes(ampurFilter)) &&
          (!maleFilter || male === maleFilter) &&
          (age >= ageMin && age <= ageMax)
        );
      });

      const startIndex = (page - 1) * limit;
      const endIndex = page * limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);

      res.json({
        page,
        limit,
        totalItems: filteredData.length,
        totalPages: Math.ceil(filteredData.length / limit),
        data: paginatedData
      });

    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});


app.get('/api/data19', (req, res) => {

  const jsonPath = path.join(__dirname, 'output19.json');

  fs.readFile(jsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading JSON file:', err);
      return res.status(500).json({ error: 'Unable to read JSON data' });
    }

    try {
      const jsonData = JSON.parse(data);
      res.json(jsonData);
    } catch (parseErr) {
      console.error('Error parsing JSON:', parseErr);
      res.status(500).json({ error: 'Invalid JSON format' });
    }
  });
});

// app.get('/api/data5', (req, res) => {

//   const jsonPath = path.join(__dirname, 'output5.json');

//   fs.readFile(jsonPath, 'utf8', (err, data) => {
//     if (err) {
//       console.error('Error reading JSON file:', err);
//       return res.status(500).json({ error: 'Unable to read JSON data' });
//     }

//     try {
//       const jsonData = JSON.parse(data);
//       res.json(jsonData);
//     } catch (parseErr) {
//       console.error('Error parsing JSON:', parseErr);
//       res.status(500).json({ error: 'Invalid JSON format' });
//     }
//   });
// });

app.post('/api/load/data1', (req, res) => {
  fs.readFile(inputFile1, (err, data) => {
    if (err) throw err;
  
    // แปลง encoding จาก UTF-16LE เป็น UTF-8
    const utf8Data = iconv.decode(data, 'utf16-le');
  
    // แปลง CSV เป็น JSON โดยใช้ , เป็นตัวแบ่ง
    csv({
      noheader: false,
      delimiter: ',' // 👈 เปลี่ยนตรงนี้
    })
      .fromString(utf8Data)
      .then((jsonObj) => {
        console.log(JSON.stringify(jsonObj, null, 2));
  
        fs.writeFileSync('output1.json', JSON.stringify(jsonObj, null, 2), { encoding: 'utf8' });
        res.status(200).json({ saccess: 'json data1 created' });
      });

  });
  
})

app.post('/api/load/data3', (req, res) => {
  fs.readFile(inputFile3, (err, data) => {
    if (err) throw err;
  
    // แปลง encoding จาก UTF-16LE เป็น UTF-8
    const utf8Data = iconv.decode(data, 'utf16-le');
  
    // แปลง CSV เป็น JSON โดยใช้ , เป็นตัวแบ่ง
    csv({
      noheader: false,
      delimiter: ',' // 👈 เปลี่ยนตรงนี้
    })
      .fromString(utf8Data)
      .then((jsonObj) => {
        console.log(JSON.stringify(jsonObj, null, 2));
  
        fs.writeFileSync('output3.json', JSON.stringify(jsonObj, null, 2), { encoding: 'utf8' });
        res.status(200).json({ saccess: 'json data3 created' });
      });

  });
  
})

app.post('/api/load/data5', (req, res) => {
  fs.readFile(inputFile5, (err, data) => {
    if (err) throw err;
  
    // แปลง encoding จาก UTF-16LE เป็น UTF-8
    const utf8Data = iconv.decode(data, 'utf16-le');
  
    // แปลง CSV เป็น JSON โดยใช้ , เป็นตัวแบ่ง
    csv({
      noheader: false,
      delimiter: ',' // 👈 เปลี่ยนตรงนี้
    })
      .fromString(utf8Data)
      .then((jsonObj) => {
        console.log(JSON.stringify(jsonObj, null, 2));
  
        fs.writeFileSync('output5.json', JSON.stringify(jsonObj, null, 2), { encoding: 'utf8' });
        res.status(200).json({ saccess: 'json data5 created' });
      });

  });
  
})

app.post('/api/load/data12', (req, res) => {
  fs.readFile(inputFile12, (err, data) => {
    if (err) throw err;
  
    // แปลง encoding จาก UTF-16LE เป็น UTF-8
    const utf8Data = iconv.decode(data, 'utf16-le');
  
    // แปลง CSV เป็น JSON โดยใช้ , เป็นตัวแบ่ง
    csv({
      noheader: false,
      delimiter: ',' // 👈 เปลี่ยนตรงนี้
    })
      .fromString(utf8Data)
      .then((jsonObj) => {
        console.log(JSON.stringify(jsonObj, null, 2));
  
        fs.writeFileSync('output12.json', JSON.stringify(jsonObj, null, 2), { encoding: 'utf8' });
        res.status(200).json({ saccess: 'json data12 created' });
      });

  });
  
})

app.post('/api/load/data19', (req, res) => {
  fs.readFile(inputFile19, (err, data) => {
    if (err) throw err;
  
    // แปลง encoding จาก UTF-16LE เป็น UTF-8
    const utf8Data = iconv.decode(data, 'utf16-le');
  
    // แปลง CSV เป็น JSON โดยใช้ , เป็นตัวแบ่ง
    csv({
      noheader: false,
      delimiter: ',' // 👈 เปลี่ยนตรงนี้
    })
      .fromString(utf8Data)
      .then((jsonObj) => {
        console.log(JSON.stringify(jsonObj, null, 2));
  
        fs.writeFileSync('output19.json', JSON.stringify(jsonObj, null, 2), { encoding: 'utf8' });
        res.status(200).json({ saccess: 'json data19 created' });
      });

  });
  
})

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
