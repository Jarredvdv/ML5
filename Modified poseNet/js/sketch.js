let video;
let poseNet;
let poses;

let rectX;
let rectY;
let rectSize;
let rectFill;
let gameScore;
let bodyPart;


function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();
  gameScore = 0;

  rectMode(CENTER);
  rectX = 200;
  rectY = 200;
  rectSize = 50;
  rectFill = color(255,0,0);

  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on('pose', function (results) {
    poses = results;
  });

}


function draw() {
  background(0);
  image(video,0,0);


  fill(rectFill);
  rect(rectX, rectY, rectSize, rectSize);

  fill(0,0,0);
  textSize(40);

  textAlign(CENTER, CENTER);
  text("👃", rectX, rectY);

  fill(255,255,255);
  text(gameScore, 100,100);

  textSize(10);
  if (poses != undefined ) {
    for (let i = 0; i < poses.length; i++) {
      // console.log( poses[i].pose.keypoints ); // take a look at this first

      for (let j=0; j< poses[i].pose.keypoints.length; j++) {

        // console.log( poses[i].pose.keypoints[j] );
        let partname = poses[i].pose.keypoints[j].part;
        let score = poses[i].pose.keypoints[j].score;
        let x = poses[i].pose.keypoints[j].position.x;
        let y = poses[i].pose.keypoints[j].position.y;


        if (partname == "nose") {
          noStroke();
          fill(0,255,0);
          ellipse(x,y,5,5);

          // text(partname, x + 10, y + 10);
          // text(nf(score, 0, 2), x + 10, y + 30);
          // text(nf(x, 0, 0), x + 10, y + 50);
          // text(nf(y, 0, 0), x + 40, y + 50);

          checkHit(x,y);
        }
      }
    }
  }
}


function checkHit(x,y){
  if(int(x) > (rectX - (rectSize/2)) && int(x) < (rectX + (rectSize/2))){
    if(int(y) > (rectY - (rectSize/2)) && int(y) < (rectX + (rectSize/2))){
      rectX = int(random(200, width-200));
      rectY = int(random(200, height-200));
      rectSize = int(random(50,100));
      rectFill = color(random(0,360), random(0,360), random(0,360))
      gameScore += 1;

      console.log("Hit: " + str(rectSize));
    }
  }
}


function modelReady() {
  console.log("Model Ready!");
}
