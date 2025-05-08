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

      // ✅ เช็ก name, email ก่อน toLowerCase
      const filteredData = jsonData.filter(item => {
        const name = item.idcard ? item.idcard.toLowerCase() : "";
        const email = item.dspname ? item.dspname.toLowerCase() : "";
        return name.includes(search) || email.includes(search);
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
      res.json(jsonData);
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
      res.json(jsonData);
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

app.get('/api/data5', (req, res) => {

  const jsonPath = path.join(__dirname, 'output5.json');

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
