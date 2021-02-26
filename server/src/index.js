const { wrap } = require('module')
import cors from 'cors'
import formidable from 'formidable'
import path from 'path'
import fse from 'fs-extra'

const app = require('express')()
app.use(cors())

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
  wrapAsync(async function (req, res) {
    const uploadDir = path.join(__dirname, '../uploads')
    const form = formidable({
      multiples: true
      // uploadDir: uploadDir - doesn't work :(
    })

    form.parse(req, async (err, fields, files) => {
      console.log('files', files)
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
    // -->
    // await new Promise((resolve) => setTimeout(() => resolve(), 50))
    // throw new Error('woops')
    // <--
  })
)

app.use(function (error, req, res, next) {
  // Gets called because of `wrapAsync()`
  res.json({ message: error.message })
})

app.listen(4040)

function wrapAsync(fn) {
  return function (req, res, next) {
    // Make sure to `.catch()` any errors and pass them along to the `next()`
    // middleware in the chain, in this case the error handler.
    fn(req, res, next).catch(next)
  }
}
