var gdp = getCountryGDP(),
    codes= getCountryCodes(),
    codeNumToA3 = {},
    data = {};

/* gdb map */
var svg = d3.select("svg#gdpMap"),
    json = "world-topo-110m.json",
    proj = d3.geo.mercator().center([0, 55]).scale(180),
    path = d3.geo.path().projection(proj);

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
           data[d.id] = {"a3": codeNumToA3[d.id]};
           data[d.id].num = gdp.countryCode;
           data[d.id].name = gdp.countryName;
           data[d.id].rank = gdp.ranking;
           data[d.id].gdp = gdp.millionUSD;
           return;
         }
       });
       delete codes, gdp;       
       
       return "p" + a3Code;
     })
     .attr("d", path)
     .style("fill", function(d) {
       var r = 225,
           g = 225,
           b = 225;
       if (data[d.id]) {
         var rank = data[d.id].rank; 
         r = 255 - rank;
         g = 255 - rank;
         b = 150;
       }
       return "rgb("+ r + "," + g + "," + b + ")";
     });

  /* draw text */
  //TEST: algin text
  var eu = ["ALB","AND","BLR","BIH","BGR","HRV","CYP","CZE","EST","FRO","GIB","HUN","LUA","SRB","SRV","SVK","VAT","RSB","XKX","MNE","BEL"]; 
      //= ["AUT","BEL","DNK","GRC","LIE","LUX","PRT"];
  svg.selectAll("text")
     .data(topojson.feature(map, map.objects.countries).features)
     .enter()
     .append("text")
     .attr("transform", function(d) {
       var center = path.centroid(d),
           flag = false;
       //TEST1       
       /*if (data[d.id]) {
         flag = eu.filter(function(e) { return e === data[d.id].a3;});
         if (flag.length>0) { center = [350, center[1]]; }
       }*/
       return "translate(" + center + ")"; 
     })
     .attr("class", function(d) {
       
       /* events */
       onPinEvent(this, d, "mouseover", "mouseout");
       onPinEvent(this, d, "click");
       
       return "pin"; 
     })
     .attr("data-code", function(d) {return codeNumToA3[d.id];})
     .attr("id", function(d) {return "t" + codeNumToA3[d.id];})
     .attr("dy", "2em")
     .style("text-anchor", function(d) { 
       //TEST2
       var x = path.centroid(d)[0],
           align = ((x > 525 && x < 900) || x < 150) ? "start" : "end";
       return align;
     })
     .text(function(d) {
       var marker = d.properties.name;
       // use country names base on the gdp table
       if (data[d.id] && data[d.id].name) { marker = data[d.id].name; } 
       //else { console.log(marker); }
       return marker;
     });
     //console.log(data); 
});

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

/* events: click and hover */
var pathColor,
    pathNode = null;
var onPinEvent = function(that, d, eventType1, eventType2) {
  //var pathNode = null;
  
  that.addEventListener(eventType1, function(e) {
    var name = d.properties.name, 
        gdp = "NA",
        unit = "",
        rank = "";
 
    /* remove highlight after a period if it's click */
    if ((eventType1 === "click") && (pathNode !== null)) {
        console.log(pathNode);
        console.log(pathColor);
        pathNode.style.fill = pathColor;
    }

    /* highlight the pin with its land */ 
    pathNode = document.getElementById("p" + codeNumToA3[d.id]);
    if (pathNode !== null) {
      pathColor = pathNode.style.fill;          
      pathNode.style.fill = "dimgrey";
    } else {
      //console.log(name+"["+d.id+"]:" + "no codes!");
    }

    /* display data */
    if (data[d.id]) { 
      name = data[d.id].name;
      gdp = data[d.id].gdp;
      unit = ",000,000 USD";
      rank = data[d.id].rank + ": ";
    }
    document.getElementById("countryName").textContent = name;
    document.getElementById("countryGDP").textContent = gdp;
    document.getElementById("countryGDPUnit").textContent = unit;
    document.getElementById("countryGDPRank").textContent = rank;
  }, false);

  that.addEventListener(eventType2, function(e){
    pathNode = document.getElementById("p"+e.target.dataset.code);
    if (pathNode !== null) {
      pathNode.style.fill = pathColor;
    }
  }, false);
}
