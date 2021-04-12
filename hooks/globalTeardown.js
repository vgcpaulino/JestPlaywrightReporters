const fs = require('fs');
const archiver = require('archiver');
const { allureConfig } = require('../reporter/allure.config');

module.exports = async function () {
    console.log(`###################### Global Tear Down!`);

    if (allureConfig.generateAfterFinish) {
        generateAllureReport();
        if (allureConfig.zipAfterFinish) zipDirectory('./allure-report', './allureReport.zip');
    }
    
};

/**
 * @returns {void}
 */
function generateAllureReport() {
    const allureCli = require('allure-commandline');
    const generate = allureCli(['generate', 'allure-results']);
    generate.on('exit', function(exitCode) {
        console.log(`Allure Report Generation: ${exitCode}`);
    });
}

/**
 * @param {String} source The directory that will be compressed.
 * @param {String} out The path to generate the zip fille.
 * @returns {Promise}
 */
function zipDirectory(source, out) {
  const archive = archiver('zip', { zlib: { level: 9 }});
  const stream = fs.createWriteStream(out);

  return new Promise((resolve, reject) => {
    archive
      .directory(source, false)
      .on('error', err => reject(err))
      .pipe(stream)
    ;

    stream.on('close', () => resolve());
    archive.finalize();
  });
}