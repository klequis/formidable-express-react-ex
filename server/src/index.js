'use strict'

import express from 'express'
import formidable from 'formidable'
import path from 'path'
import cors from 'cors'
import * as R from 'ramda'
import fse from 'fs-extra'
const app = express()
app.use(cors())

const moveFiles = async (uploadDir, files) => {
  const all = Promise.all(
    files.map(async (f) => {
      return fse.move(f.path, path.join(uploadDir, f.name))
    })
  )
  return all
}

app.post('/api/upload', (req, res, next) => {
  const uploadDir = path.join(__dirname, '../uploads')

  const form = formidable({
    multiples: true
    // uploadDir: uploadDir - doesn't work :(
  })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      next(err)
      return
    }
    // console.log('type', R.type(files.uploadedFiles))
    // console.log('files.uploadFiles', files.uploadedFiles)

    // files.uploadedFiles.map((f) => {
    //   console.log({
    //     path: f.path,
    //     name: f.name,
    //     type: f.type
    //   })
    // })

    // currPath = f.path

    // const moves = R.map(async (f) => {
    //   console.log({
    //     path: f.path,
    //     name: f.name,
    //     type: f.type
    //   })
    //   return
    // }, files.uploadedFiles)
    // const m = await Promise.all([moves])
    const m = await moveFiles(uploadDir, files.uploadedFiles)
    console.log('m', m)
    // need to do fse.move with promise.all
    // R.map(f => await fse.move(f.path, ))
    // const movedFiles = promise.all([
    //   fse.move()
    // ])
    res.json({ fields, files, uploadDir })
  })
})

app.get('/api/test', async (req, res, next) => {
  res.json({ result: 'success' })
})

app.listen(4040, () => {
  console.log('Server listening on http://localhost:4040 ...')
})
