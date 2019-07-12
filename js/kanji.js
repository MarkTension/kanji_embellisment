$(document).ready(function() {
  paper.setup("myCanvas");
  with (paper) {
    var global_item_var = null;

    var all_symbols = new Array();

    // import svg
    // var url = "http://localhost:3000/3.svg";

    // url to kanjivg DB
    const KanjiVG_url =
      "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/";
    // get random kanji name
    const random_kanji =
      KanjiArray[Math.floor(Math.random() * KanjiArray.length)];
    // make path to random kanji in DB
    const url = KanjiVG_url + random_kanji;

    var itemer = project.importSVG(url, {
      expandShapes: true,
      onLoad: function(item) {
        console.log("imported SVG!");

        const center_w = paper.view.bounds.width / 2;
        const center_h = paper.view.bounds.height / 2;

        // place in middle of canvas
        item.translate(center_w - 50, center_h - 50);

        item.scale(1.5);

        // Get all imported paths.
        var paths = project.getItems({
          class: Path
        });

        // remove stroke numbers
        // get ID
        let filename = Object.keys(item._namedChildren)[1];
        var numbering = project.getItem({
          name: filename
        });
        numbering.opacity = 0.0;

        var angles = new Array();
        var corrections = new Array();

        // change paths initially
        for (var i = 0; i < paths.length; i++) {
          paths[i].strokeColor = Color.random();
          paths[i].strokeWidth = 1.5;
          paths[i].simplify(0);

          let start = paths[i].segments[0].point;

          let end = paths[i].segments[paths[i].segments.length - 1].point;

          var dx = start.x - end.x;
          var dy = start.y - end.y;
          var theta = Math.atan2(-dy, -dx);
          theta *= 180 / Math.PI;
          if (theta < 0) theta += 360;
          theta = theta % 180;

          let cor = 180 - theta;

          console.log(i + 1 + " is " + theta);
          console.log("correction for " + i + 1 + " is " + cor);

          angles.push(theta);
          corrections.push(cor);
        }

        var group = new Group(paths);
        group.strokeColor = "black";

        global_item_var = group;

        // step is nr of
        n_strokes = group.children.length;
        var step = (2 * Math.PI) / n_strokes / 2;
        // n degrees per stroke is
        var deg_p_stroke = 360 / n_strokes / 2;

        var radius = 100;
        const n_symbs = 20 * n_strokes;
        const radius_incr = 4;
        let idx = 1;

        // master for loop
        for (
          var i = 0, theta = 0;
          i < n_symbs;
          i++, theta += step, radius += radius_incr + 0.2 * idx //- 0.2 * i
        ) {
          var x = center_w + radius * Math.cos(theta);
          var y = center_h - radius * Math.sin(theta);
          var red = new Path.Circle(new Point(x, y), 20);

          idx = i % (n_strokes - 1);

          var grouper = group.children[idx].clone();
          // grouper.rotate(corrections[i]);

          grouper.strokeColor = "darkred";
          grouper.opacity = 0.1 + i * 0.01;
          grouper.scale(1 + i * 0.03);

          var symbol = new Symbol(grouper);

          var placed = symbol.place(new Point(x, y));
          placed.scale(0.5);
          placed.visible = false;

          all_symbols.push(placed);
        }
      },
      onError: console.log("something went wrong importing")
    });
  }

  setTimeout(function() {
    console.log(global_item_var);

    global_item_var.strokeColor = "black";

    onFrame();
  }, 1000);

  var counter = 0;

  function onFrame() {
    // Each frame, change the fill color of the path slightly by
    // adding 1 to its hue:'

    if (counter < all_symbols.length - 1) {
      counter++;
      all_symbols[counter].visible = true;
    }
    setTimeout(onFrame, 20);
  }
});
