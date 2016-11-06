const tinify = require('tinify');
const nconf = require('nconf');

const compressedImages = {};

const constants = nconf
  .argv()
  .file(`${__dirname}/constants.json`);

if (!nconf.get('i')) {
  throw new Error('Must specify input filename flag: -i');
}

if (!nconf.get('o')) {
  throw new Error('Must specify output filename flag: -o');
}

const inputFileName = nconf.get('i');
const outputFileName = nconf.get('o');

tinify.key = constants.get('TINY_API');

// Upload & compress
compressedImages.hires = tinify.fromFile(inputFileName);

// Resize
compressedImages.pics = compressedImages.hires.resize({
  method: 'scale',
  width: 2000
});

compressedImages.mobile = compressedImages.hires.resize({
  method: 'scale',
  width: 1000
});

compressedImages.thumb = compressedImages.hires.resize({
  method: 'scale',
  width: 300
});

Object.keys(compressedImages).map(bucket => {
  compressedImages[bucket].store({
    service: 's3',
    aws_access_key_id: constants.get('aws_access_key_id'),
    aws_secret_access_key: constants.get('aws_secret_access_key'),
    region: bucket === 'thumb'
      ? constants.get('aws_region_thumbs')
      : constants.get('aws_region'),
    path: `${bucket}.cranyons.com/${outputFileName}.jpg`
  });
});
