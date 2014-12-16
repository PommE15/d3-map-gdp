var gdp = getCountryGDP(),
    codes= getCountryCodes(),
    tBody = document.getElementById("gdpTableBody");  

/* gdb map */
var svg = d3.select("svg#gdpMap"),
    json = "world-topo-110m.json",
    proj = d3.geo.mercator().center([0, 42]).scale(180),
    path = d3.geo.path().projection(proj)
    color = d3.scale.quantize().range(["orange", "yellow", "lightyellow"]);

d3.json(json, function(err, map) {
  if (err) { return console.log(error); }
    var codeNumToA3 = {};
    svg.selectAll("path")
       .data(topojson.feature(map, map.objects.countries).features)
       .enter()
       .append("path")
       .attr("id", function(d) {
         var a3Code = "NAC"; // NAC = not a code
         codes.forEach(function(code) {
           if (d.id === parseInt(code.num)) {
             codeNumToA3[d.id] = a3Code = code.a3;
             return;
           }
         });
         return a3Code;
       })
       .attr("d", path)
       .style("fill", function(d) {
         //var value = d.id;
         //if (value) {return color(value);}
         //else {return "lightgrey";}
       });
    
    svg.selectAll("text")
       .data(topojson.feature(map, map.objects.countries).features)
       .enter()
       .append("text")
       .attr("transform", function(d) {
         return "translate(" + path.centroid(d) + ")"; 
       })
       .attr("class", function(d) { 
         var country = {},
             pathNode;
         /* events */
         this.addEventListener("mouseout", function(){
           if (pathNode !== null) {
             pathNode.classList.remove("fill-black");
           }
         }, false);
         this.addEventListener("mouseover", function() {
           //var pathNode;
           country.id = d.id;
           country.a3 = codeNumToA3[d.id];
           gdp.forEach(function(gdp) {
           if (gdp.countryCode === codeNumToA3[d.id]) {
             country.name = gdp.countryName;
             country.gdp = gdp.millionUSD;
             //console.log("map: " + d.properties.name + "[" + d.id + "]"); 
             //console.log("gdp: " + gdp.countryName + "[" + gdp.countryCode + "], " + gdp.millionUSD);
           }
           }); 
           pathNode = document.getElementById(country.a3);
           if (pathNode !== null) {
             console.log(country);
             pathNode.classList.add("fill-black"); 
           } else {
             console.log(d.properties.name+"["+d.id+"]:" + "no num to a3 mapping!");
           }
         });
         return "pin code" + codeNumToA3[d.id]; 
       })
       .attr("dy", "1em")
       .text(function(d) {
         return d.properties.name;
       });
});

/* gdp table */
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
