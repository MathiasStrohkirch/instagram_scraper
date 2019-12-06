const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');

let myArgs = process.argv.slice(2);
let data = myArgs[0];

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  // fs.mkdir('images', { recursive: true }, (err) => {
  //   if (err) throw err;
  // });
  let array = await csvToArray(data);
  let outputArray = await csvToOutputArray(data);

  let startDate = new Date();
  let startTime = startDate.getTime();

  outputArray[0].push('images');
  outputArray[0].push('videos');

  for(let j = 0; j < array.length; j++) {
    outputArray[j + 1].push(0);
    outputArray[j + 1].push(0);

    let numSpaces = (array.length + '').length - ((j + 1) + '').length;
    let spaces = '';
    for(let i = 0; i < numSpaces; i++) {
      spaces += ' ';
    }

    if(j === 0) {
      console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length);
    }
    else {
      let newDate = new Date();
      let newTime = newDate.getTime();
      let elapsedTime = newTime - startTime;
      let seconds = Math.round((elapsedTime / j) * (array.length - j) / 1000)
      let minutes = Math.floor(seconds / 60);
      seconds = seconds % 60;

      if(minutes > 0) {
        if(minutes === 1) {
          if(seconds > 0) {
            if(seconds === 1) {
              console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length + '     Estimated time remaining: 1 minute 1 second');
            }
            else {
              console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length + '     Estimated time remaining: 1 minute ' + seconds + ' seconds');
            }
          }
        }
        else {
          if(seconds > 0) {
            if(seconds === 1) {
              console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length + '     Estimated time remaining: ' + minutes + ' minutes 1 second');
            }
            else {
              console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length + '     Estimated time remaining: ' + minutes + ' minutes ' + seconds + ' seconds');
            }
          }
        }
      }
      else {
        if(seconds > 0) {
          if(seconds === 1) {
            console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length + '     Estimated time remaining: 1 second');
          }
          else {
            console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length + '     Estimated time remaining: ' + seconds + ' seconds');
          }
        }
        else {
          console.log('Downloading images from post ' + spaces + (j+1) + '/' + array.length);
        }
      }
    }
    try {
      await page.goto(array[j][5]);
      var profileImage = await getProfileImage(page);
      var postImages = await getFirstTwoPostImages(page);

      let click = await clickButton(page);

      while(true) {
        let image = await getNextPostImage(page);
        if(image == null) {
          break;
        }
        postImages.push(image);
        click = await clickButton(page);
      }

      let downloadProfilePicture = false;

      let suffix = 1;

      for(let i = 0; i < postImages.length; i++) {
        if(postImages[i] !== 'video') {
          outputArray[j + 1][6]++;
          if(array[j][4] === 'image') {
            download(postImages[i], '../../Box Sync/images/' + array[j][1]);
          }
          else {
            download(postImages[i], '../../Box Sync/images/' + array[j][1] + '_' + suffix);
            suffix++;
          }
          downloadProfilePicture = true;
        }
        else {
          outputArray[j + 1][7]++;
        }
      }

      if(downloadProfilePicture) {
        download(profileImage, '../../Box Sync/images/' + array[j][1] + '_profile');
      }
    }
    catch(error) {

    }
  }

  outputArrayToCsv(outputArray, '../../Box Sync/images/output_csv.csv')

  await browser.close();
})();

async function clickButton(page) {
  try {
    await page.evaluate( () => {
      const button = document.querySelector('._6CZji');
      button.click();
    })
    await page.waitFor(1000);
    return true;
  }
  catch(error) {
    return false;
  }
}

async function getProfileImage(page) {
  let result = await page.evaluate(() => {
    let profileImage = document.querySelector('img');

    return profileImage.src;
  });
  return result;
}

async function getFirstTwoPostImages(page) {
  let result = await page.evaluate(() => {
    let images = document.querySelectorAll('img');
    images = Array.from(images);

    images.pop(images.length - 1);

    let firstTwoImages = [];

    for(const image of images) {
      if(image.alt.substr(image.alt.length - 15) !== 'profile picture') {
        let parent = image.parentElement;
        let isVideo = false;
        for(const child of parent.children) {
          if(child.tagName === 'VIDEO') {
            isVideo = true;
            break;
          }
        }

        if(isVideo) {
          firstTwoImages.push('video');
        }
        else {
          firstTwoImages.push(image.src);
        }
      }
    }
    return firstTwoImages;
  });
  return result;
}

async function getNextPostImage(page) {
  let result = await page.evaluate(() => {
    let images = document.querySelectorAll('img');
    images = Array.from(images);

    images.pop(images.length - 1);

    let index = 0;

    for(const image of images) {
      if(image.alt.substr(image.alt.length - 15) !== 'profile picture') {
        if(index === 2) {
          let parent = image.parentElement;
          let isVideo = false;
          for(const child of parent.children) {
            if(child.tagName === 'VIDEO') {
              isVideo = true;
              return 'video';
            }
          }
          return image.src;
        }
        else {
          index++;
        }
      }
    }
    return null;
  });
  return result;
}

function download(uri, filename) {
  request.head(uri, function(err, res, body) {
    request(uri)
    .pipe(fs.createWriteStream(filename + '.png'))
 });
}

async function csvToArray(file) {
  let data = await fs.readFileSync(file, 'utf8');

  let lines = data.split('\n');
  lines.shift();
  lines.pop();

  let array = [];

  for(const line of lines) {
    let lineArray = line.split(',');
    // lineArray[0] = lineArray[0].substring(1, lineArray[0].length - 1);
    lineArray[5] = lineArray[5].substring(0, lineArray[5].length - 1);
    array.push(lineArray);
  }
  return array;
}

async function csvToOutputArray(file) {
  let data = await fs.readFileSync(file, 'utf8');

  let lines = data.split('\n');
  lines.pop();

  let array = [];

  for(const line of lines) {
    let lineArray = line.split(',');
    lineArray[5] = lineArray[5].substring(0, lineArray[5].length - 1);
    array.push(lineArray);
  }
  return array;
}

async function outputArrayToCsv(array, file) {
  console.log(array);
  let data = '';
  for(let i = 0; i < array.length; i++) {
    for(let j = 0; j < array[i].length; j++) {
      data += array[i][j];
      if(j < array[i].length - 1) {
        data += ','
      }
    }
    if(i < array.length - 1) {
      data += '\n'
    }
  }
  await fs.writeFile(file, data, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('It\'s saved!');
    }
  });
}
