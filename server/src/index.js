'use strict'

const express = require('express')
const formidable = require('formidable')
const path = require('path')
const cors = require('cors')

const app = express()
app.use(cors())

app.post('/api/upload', (req, res, next) => {
  console.log('req.headers', req.headers)
  const uploadDir = path.join(__dirname, '../uploads')
  // CASE 1: 2 files, wrong uploadDir -->
  // const form = formidable({
  //   multiples: true,
  //   uploadDir: uploadDir
  // })
  // <-- doesn't work

  // CASE 2: Correct uploadDir but only 1 file -->
  const form = formidable()
  form.multiples = true
  form.uploadDir = uploadDir
  // <-- works

  console.log('form.uploadDir', form.uploadDir)

  form.parse(req, (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    res.json({ fields, files, uploadDir })
  })
})

app.get('/api/test', async (req, res, next) => {
  res.json({ result: 'success' })
})

app.listen(4040, () => {
  console.log('Server listening on http://localhost:4040 ...')
})
