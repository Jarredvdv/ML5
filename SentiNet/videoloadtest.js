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
let inputImg;
let statusMsg;
let transferBtn;
let style1;
//let style2;

function setup() {

  // Transfer Button

  transferBtn = select('#transfer-button')
  transferBtn.mousePressed(transferImages);

  // Create two Style methods with different pre-trained models
  style1 = ml5.styleTransfer('models/wave');
  //style2 = ml5.styleTransfer('models/udnie', modelLoaded);

  video = createCapture(VIDEO);
  video.parent('mainCanvas');
  video.size(649, 480);
  video.position(0, 0);
  video.hide();
  canvas = createCanvas(640, 480);
  canvas.parent('mainCanvas');
  background(20);

  // video.hide();
  mobilenet = ml5.featureExtractor('MobileNet', {
    version: 1,
    alpha: 1.0,
    topk: 3,
    learningRate: 0.0001,
    hiddenUnits: 100,
    epochs: 20,
    numClasses: classes.length,
    batchSize: 0.4,
  }, () => {
    console.log('Model is ready!');
  });

  mobilenet.numClasses = classes.length;

  classifier = mobilenet.classification(video);

  trainingProgress = select('#training-progress');

  for (let i = 0; i < 4; i++) {
    predictions.push(select('#class' + (i - (-1)) + '-name'));
    probabilities.push(select('#class' + (i - (-1)) + '-probability'));
    classButtons.push(select('#class' + (i - (-1)) + 'button'));
    classButtons[i].mousePressed(function () {
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
    let progress = 0;
    classifier.train((loss) => {
      if (loss === null) {
        trainingProgress.attribute('style', 'width:100%');
        trainingProgress.html('Finished');
        console.log('Training finished!');
        classifier.classify(gotResults);
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

function draw() {
  image(video, 0, 0);
}

function gotResults(error, result) {
  if (error) {
    console.log(error);
  } else {
    // console.log(result);
    for (let i = 0; i < 4; i++) {
      predictions[i].html(classes[i]);
      probabilities[i].html((result == classes[i] ? 100 : 0) + '%');
      probabilities[i].attribute('aria-valuenow', (result == classes[i] ? 100 : 0));
      // probabilities[i].attribute('style', 'width:' + floor(results[i].probability * 100)+ '%');
      probabilities[i].attribute('style', 'width:' + (result == classes[i] ? 100 : 0) + '%');
    }
    classifier.classify(gotResults);
  }

}

// Apply the transfer to both images!
function transferImages() {

  inputImg = image(video,0,0);

  statusMsg.html('Applying Style Transfer...!');

  style1.transfer(inputImg, function(err, result) {
    createImg(result.src).parent('styleA');
  });

  statusMsg.html('Done!');
}
