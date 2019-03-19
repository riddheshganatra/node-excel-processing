var excel = require('excel-stream') // package to read excel to objects in stream
const { Transform } = require('stream');

function getDestination(req, file, cb) {
    cb(null, '')
}

function MyCustomStorage(opts) {
    this.getDestination = (opts.destination || getDestination)
}

MyCustomStorage.prototype._handleFile = function _handleFile(req, file, cb) {

    // set input stream for xlsxWriter stream which will be used to downlaod excel
    req.xlsxWriter.setInputStream(
        // stream of input file
        file.stream
            // convert excel to object stream
            .pipe(excel())
            //process object stream and return formated object for xlsxWriter
            .pipe(getTransformObject())
    );
    cb(null, {
        path: '',
        size: 0
    })
}

MyCustomStorage.prototype._removeFile = function _removeFile(req, file, cb) {
    fsImpl.unlink(file.path, cb)
}

module.exports = function (opts) {
    return new MyCustomStorage(opts)
}

// custom logic start:


// return transform stream which will do proccessing
function getTransformObject() {
    const jsonToDb = new Transform({
        writableObjectMode: true,
        readableObjectMode: true,
        transform(chunk, encoding, callback) {
            // to check current memory usage
            const used = process.memoryUsage().heapUsed / 1024 / 1024;
            // console.log('\033c');
            console.log(`The script uses approximately ${Math.round(used * 100) / 100} MB`);
            // records is blank array decalred below 
            this.records.push(chunk);
            // batch processing of records
            if (this.records.length == 10) {
                saveDataToDB(this.records)
                    .then((data) => {
                        // data is modified data
                        data.forEach((record) => {
                            this.push([...Object.values(record)])
                        })
                        // reset records for batch processing
                        this.records = [];
                        callback();
                    })
            }
            else {
                callback();
            }
        },
        flush(done) {
            // flush we repeat steps for last records,
            // eg total records 108, last 8 records are left to process
            if (this.records.length > 0) {
                saveDataToDB(this.records)
                    .then((data) => {
                        data.forEach((record) => {
                            this.push([...Object.values(record)])
                        })
                        this.records = [];
                        console.log('done processing')
                        done();
                    })
            } else {
                console.log('done processing')
                done();
            }
        }
    });
    jsonToDb.records = [];
    return jsonToDb;
}

// async function to process data
function saveDataToDB(array) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // here data can be modified 
            resolve(array.map(e => ({ ...e, id: Math.floor((Math.random() * 10) + 1) })))
        }, 10)
    })
}