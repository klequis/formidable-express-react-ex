'use strict'

import express from 'express'
import formidable from 'formidable'
import path from 'path'
import cors from 'cors'
import * as R from 'ramda'
import fse from 'fs-extra'
const app = express()
app.use(cors())

app.use(function (error, req, res, next) {
  // Gets called because of `wrapAsync()`
  console.log('error handler called')
  res.json({ note: 'me', message: error.message })
})

function wrapAsync(fn) {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next)
  }
}

app.get(
  '*',
  wrapAsync(async function (req, res) {
    await new Promise((resolve) => setTimeout(() => resolve(), 50))
    // Async error!
    throw new Error('woops')
  })
)

app.post(
  '/api/upload',
  wrapAsync(async (req, res) => {
    console.log('POSTED')
    throw new Error('woops')
  })
)

// ------------------------------------  //
app.post(
  '/api/upload--real',
  wrapAsync((req, res) => {
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
      // const x = await moveFiles(uploadDir, files.uploadedFiles)

      // -->
      // try {
      const a = await Promise.all(
        files.uploadedFiles.map(async (f) => {
          return fse.move(f.path, path.join(uploadDir, f.name))
        })
      )
      // } catch (e) {
      // console.log('** re-throwing')
      // snext(e)
      // }
      // <--

      res.json({ fields, files, uploadDir })
    })
    form.on('error', (err) => {
      console.log('form.on: error', err)
    })
  })
)

app.get('/api/test', async (req, res, next) => {
  res.json({ result: 'success' })
})

app.listen(4040, () => {
  console.log('Server listening on http://localhost:4040 ...')
})

const moveFiles = async (uploadDir, files) => {
  try {
    await Promise.all(
      files.map(async (f) => {
        return fse.move(f.path, path.join(uploadDir, f.name))
      })
    )
  } catch (e) {
    console.log('---------------------------------------------------')
    return new Error(`could not move files: ${e}`)
  }
}
