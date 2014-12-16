var gdp = getCountryGDP(),
    codes= getCountryCodes(),
    codeNumToA3 = {},
    data = {};

/* data */

/* events */

/* gdb map */
var svg = d3.select("svg#gdpMap"),
    json = "world-topo-110m.json",
    proj = d3.geo.mercator().center([0, 42]).scale(180),
    path = d3.geo.path().projection(proj)
    color = d3.scale.quantize().range(["orange", "yellow", "lightyellow"]);

d3.json(json, function(err, map) {
  if (err) { return console.log(error); }
  /* draw path */  
  svg.selectAll("path")
     .data(topojson.feature(map, map.objects.countries).features)
     .enter()
     .append("path")
     .attr("id", function(d) {
       var a3Code = "NAC"; // NAC = not a code

       /* data */
       // create a country code mapping: id (number) to a3 code 
       codes.forEach(function(code) {
         if (d.id === parseInt(code.num)) {
           codeNumToA3[d.id] = a3Code = code.a3;
           return;
         }
       });
       // create a data table: id to gdp data
       gdp.forEach(function(gdp) {
         if (gdp.countryCode === codeNumToA3[d.id]) {
           data[d.id] = {"a3"  : codeNumToA3[d.id]};
           data[d.id] = {"num" : gdp.countryCode};
           data[d.id] = {"name": gdp.countryName};
           data[d.id] = {"gdp" : gdp.millionUSD};
           return;
         }
       });
       delete codes, gdp;       
       
       return "p" + a3Code;
     })
     .attr("d", path)
     .style("fill", function(d) {
       //var value = d.id;
       //if (value) {return color(value);}
       //else {return "lightgrey";}
     });

  /* draw text */
  svg.selectAll("text")
     .data(topojson.feature(map, map.objects.countries).features)
     .enter()
     .append("text")
     .attr("transform", function(d) {
       return "translate(" + path.centroid(d) + ")"; 
     })
     .attr("class", function(d) {
       /* events */
       onPinEvent(this, d, "mouseover", "mouseout");
       onPinEvent(this, d, "click");
       return "pin"; 
     })
     .attr("data-code", function(d) {return codeNumToA3[d.id];})
     .attr("dy", "1em")
     .text(function(d) {
       var marker = d.properties.name;
       // use country names base on the gdp table
       if (data[d.id] && data[d.id].name) { marker = data[d.id].name; } 
       //else { console.log(marker); }
       return marker;
     });
  //console.log(data); 
});

var onPinEvent = function(that, d, eventType1, eventType2) {
  var pathNode,
      eventType;
          
  that.addEventListener(eventType1, function() {
    /* highlight the pin with its land */ 
    pathNode = document.getElementById("p" + codeNumToA3[d.id]);
    if (pathNode !== null) {
      pathNode.classList.add("fill-black"); 
    } else {
      //console.log(d.properties.name+"["+d.id+"]:" + "no num to a3 mapping!");
    }
    /* display data */
    if (data[d.id]) { console.log(data[d.id].gdp); }    
  }, false);

  that.addEventListener(eventType2, function(e){
    pathNode = document.getElementById("p"+e.target.dataset.code);
    if (pathNode !== null) {
      pathNode.classList.remove("fill-black");
    }
  }, false);
}

/* gdp table */
var tBody = document.getElementById("gdpTableBody");  
gdp.forEach(function(c) {
  var tr, td;
  tr = document.createElement("tr");
  td = document.createElement("td");
  td.textContent = c.countryName;  
  tr.appendChild(td);  
  td = document.createElement("td");
  td.textContent = c.millionUSD;
  tr.appendChild(td);  
  tBody.appendChild(tr);  
});
