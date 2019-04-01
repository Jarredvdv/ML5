let mobilenet;
let video;
let classifier;

//Data stuctures to maintain list of predictions and probabilities for each class
let predictions = [];
let probabilities = [];
let classButtons = [];

//Elements used to initialize training
let trainButton;
let trainingProgress;
let canvas;

let classes = ['Happy', 'Sad', 'Surprised', 'Angry'];
let classesCount = [0, 0, 0, 0];

//Variables used for style transfer
let style;
let style1;
let style2;

let isTransferring = false;
let resultImg;
let sourceImg;

let curEmotion;

function setup() {
  createCanvas(640, 480).parent('mainCanvas');

  video = createCapture(VIDEO);
  video.hide();

  // The results image from the style transfer
  resultImg = createImg('');
  resultImg.hide();

  status = select('#status');
  sourceImg = select('#sourceImage');
  select('#add-samples').attribute('style', 'display: none')
  select('#pretrained').mousePressed(pretrain);
  select('#startStop').mousePressed(startStop);
  select('#add-samples').mousePressed(addSamples);

  // Create a new Style Transfer method with a defined style.
  // We give the video as the second argument
  happyStyle = ml5.styleTransfer('models/rain_princess', video, modelLoaded);
  sadStyle = ml5.styleTransfer('models/wave', video, modelLoaded);
  angryStyle = ml5.styleTransfer('models/hoangho', video, modelLoaded);
  surprisedStyle = ml5.styleTransfer('models/udnie', video, modelLoaded);
  style = happyStyle;

  background(20);

  // video.hide();
  mobilenet = ml5.featureExtractor('MobileNet', modelLoaded);
  mobilenet.numClasses = classes.length;

  classifier = mobilenet.classification(video, classifierReady);

  trainingProgress = select('#training-progress');

  for (let i = 0; i < 4; i++) {
    predictions.push(select('#class' + (i - (-1)) + '-name'));
    probabilities.push(select('#class' + (i - (-1)) + '-probability'));
    classButtons.push(select('#class' + (i - (-1)) + 'button'));
    classButtons[i].mousePressed(function () {
      select('#status').html('Adding training data...');
      // while(cut.pixels.length == 0);
      // console.log(cut);
      classifier.addImage(classes[i], () =>{
        console.log('Added!');
      });
      classButtons[i].html(classes[i] + ' (' + (++classesCount[i]) + ')');
    });
  }
  trainButton = select('#train-button');

  trainButton.mousePressed(function () {
    select('#status').html('Training emotion classification model...');
    let progress = 0;
    classifier.train((loss) => {
      if (loss === null) {
        trainingProgress.attribute('style', 'width:100%');
        trainingProgress.html('Finished');
        console.log('Training finished!');
        select('#status').html('Classification model trained! Style transfer is ready.');
        classifier.classify(gotResults);
        classifier.save();
      } else {
        progress = lerp(progress, 100, .2);
        trainingProgress.attribute('style', 'width:' + progress + '%');
        // trainingProgress.attribute('style', 'width:'+progress+'%');
        console.log(loss);
      }
    });
  });
  noStroke();
}

function addSamples(){
  showControls();
  select('#status').html('Add samples to retrain the model');
}

function hideControls(){
  select('#class1button').attribute('style', 'display: none')
  select('#class2button').attribute('style', 'display: none')
  select('#class3button').attribute('style', 'display: none')
  select('#class4button').attribute('style', 'display: none')
  select('#pretrained').attribute('style', 'display: none')
  select('#train-button').attribute('style', 'display: none')
  select('#add-samples').attribute('style', 'display: inline')
  select('#training-progress').attribute('style', 'display: none')
}

function showControls(){
  select('#class1button').attribute('style', 'display: inline')
  select('#class2button').attribute('style', 'display: inline')
  select('#class3button').attribute('style', 'display: inline')
  select('#class4button').attribute('style', 'display: inline')
  select('#pretrained').attribute('style', 'display: inline')
  select('#train-button').attribute('style', 'display: inline')
  select('#add-samples').attribute('style', 'display: none')
  select('#training-progress').attribute('style', 'display: inline')
}

function classifierReady(){
  pretrain();
}

function pretrain(){
  console.log("Pretrain model loaded");
  classifier.load('models/model.json', pretrainLoaded);
}

function pretrainLoaded(){
  hideControls();
  select('#status').html('Using pretrained model!');

  classifier.classify(gotResults);
  startStop();
}



function draw(){
  // Switch between showing the raw camera or the style
  if (isTransferring) {
    styleType = getStyle();
    image(resultImg, 0, 0, 640, 480);
  } else {
    image(video, 0, 0, 640, 480);
  }
}

function gotResults(error, result) {
  if (error) {
  } else {
    // console.log(result);
    for (let i = 0; i < 4; i++) {
      predictions[i].html(classes[i]);
      probabilities[i].html((result == classes[i] ? 100 : 0) + '%');
      probabilities[i].attribute('aria-valuenow', (result == classes[i] ? 100 : 0));
      probabilities[i].attribute('style', 'width:' + (result == classes[i] ? 100 : 0) + '%');
    }
    classifier.classify(gotResults);
    curEmotion = result;
  }

}

// A function to call when the model has been loaded.
function modelLoaded() {
  select('#status').html('Style transfer models loaded');
}

// Start and stop the transfer process
function startStop() {
  if (isTransferring) {
    select('#startStop').html('Start');
    select('#status').html('Style transfer ready');
    sourceImg.attribute('src', "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs%3D");
  } else {
    styleType = getStyle();
    select('#startStop').html('Stop');
    select('#status').html('Updating portrait...');
    // Make a transfer using the video
    style.transfer(gotResult);
  }
  isTransferring = !isTransferring;
}



function getStyle(){
  if(curEmotion == 'Happy'){
    style = happyStyle;
    sourceImg.attribute('src', "images/rain_princess.jpg");
  }
  else if (curEmotion == 'Sad'){
    style = sadStyle;
    sourceImg.attribute('src', "images/wave.jpg");
  }
  else if (curEmotion == 'Surprised'){
    style = surprisedStyle;
    sourceImg.attribute('src', "images/udnie.jpg");
  }
  else if (curEmotion == 'Angry'){
    style = angryStyle;
    sourceImg.attribute('src', "images/hoangho.jpg");
  }
}


// When we get the results, update the result image src
function gotResult(err, img) {
  resultImg.attribute('src', img.src);
  if (isTransferring) {
    style.transfer(gotResult);
  }
}
