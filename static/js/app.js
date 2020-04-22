// url depends on where the python http.server is opened up!
let url = 'samples.json';
// adds each sample name to the drop down selection
function addUsers(){
  d3.json(url).then(function(data) {
      console.log(data)
      let users = data.names
      d3.select('#selDataset')
        .selectAll('option')
        .data(users)
        .enter()
        .append('option')
        .attr('value', function(user){
          return `${user}`
        })
        .text(function(user){
          return `${user}`
        })
    });
};
// Initializes page with ID 940
function initializePage(){
  addUsers();
  let startID = '940'
  buildBar(startID);
  buildBubble(startID);
  buildMetadata(startID);
  buildGauge(startID);
}

function optionChanged(userID){
  console.log(userID);
  buildBar(userID);
  buildBubble(userID);
  buildMetadata(userID);
  buildGauge(userID);
};

function buildBar (userID) {
  d3.json(url).then(function(data) {
    let samples = data.samples;
    let user_sample = samples.filter(each => each.id == userID);
    let userData = user_sample[0];
    console.log(userData);
    let otu_id = userData.otu_ids;
    let otu_val = userData.sample_values;
    let otu_label = userData.otu_labels;
// Creating otu_id key otu_val_pairs
    let result_pairs = otu_label.map(function(e,i){
      return [e, otu_id[i], otu_val[i]]
    });
// Sort resulting array on index 2
    result_pairs.sort(function(a,b){
      return a[2] - b[2]
    }).reverse()
// build plotly parameters
    var barTrace = {
      y: result_pairs.map(e => `OTU:${e[1]}`).slice(0,10).reverse(),
      x: result_pairs.map(e => e[2]).slice(0,10).reverse(),
      text: result_pairs.map(e => e[0]).slice(0,10).reverse(),
      type: "bar",
      orientation: 'h'
    };
    var dataBar = [barTrace];  
    var layoutBar = {
      title: `Most Common Bacteria for Test Subject ${userID}`
    };
    Plotly.newPlot("bar", dataBar, layoutBar);
  });
};

function buildBubble(userID){
  d3.json(url).then(function(data) {
    let samples = data.samples;
    let user_sample = samples.filter(each => each.id == userID);
    let userData = user_sample[0];
    //
    let otu_id = userData.otu_ids;
    let otu_val = userData.sample_values;
    let otu_label = userData.otu_labels;

    let bubbleTrace = {
      x: otu_id,
      y: otu_val,
      text: otu_label,
      mode: 'markers',
      marker: {
        size: otu_val,
        color: otu_id,
        colorscale: 'Portland',
      }
    };

    let dataBubble = [bubbleTrace];

    let layoutBubble = {
      title: 'Bacteria per Sample',
      showlegend: false,
      xaxis: {title: 'OTU ID'},
      yaxis: {title:'Number of Samples'},
      margin: { t: 30}
    };
    console.log(otu_val)
    Plotly.newPlot('bubble', dataBubble, layoutBubble)
  })
};

function toTitleCase(str) {
  return str.replace(
      /\w\S*/g,
      function(txt) {
          return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      }
  );
}

function buildMetadata(userID){
  d3.json(url).then(function(data) {
    console.log(data)
    let metaData = data.metadata;
    let userMeta = metaData.filter(each => each.id == userID)
    let userDemo = userMeta[0]
    let datatable = d3.select('#sample-metadata')
    datatable.html('')
    console.log(datatable)
    Object.entries(userDemo).forEach(function([key, value]){
      datatable.append('h6').text(`${toTitleCase(key)}: ${value}`)
    })
  });
};


function buildGauge(userID) {
    d3.json(url).then(function(data) {
      console.log(data)
      let metaData = data.metadata;
      let userMeta = metaData.filter(each => each.id == userID)
      let userDemo = userMeta[0]
    var dataGauge = [
      {
        domain: { x: [0, 9], y: [0, 1] },
        value: userDemo.wfreq,
        title: { text: "Washing Frequency" },
        type: "indicator",
        mode: "gauge+number",
        gauge: { 
          axis: { range: [null, 9] },
          steps: [
            { range: [0, 9], color: "#428bca" },
          ],
          bar: {color: 'black'}, 
        }
      }
    ];
    
    var layoutGauge = { width: 475, height: 450, margin: { t: 0, b: 0 } };
    Plotly.newPlot('gauge', dataGauge, layoutGauge);
  })
};


initializePage();