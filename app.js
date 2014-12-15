var gdp = getJsonGDP(),
tBody = document.getElementById("gdpTableBody");  

/* gdb map */
var svg = d3.select("svg#gdpMap"),
    json = "world-topo-110m.json",
    proj = d3.geo.mercator().center([0, 0]).scale(125),
    path = d3.geo.path().projection(proj);

d3.json(json, function(err, map) {
  if (err) { return console.log(error); }

    svg.selectAll("path")
       .data(topojson.feature(map, map.objects.countries).features)
       .enter()
       .append("path")
       .attr("d", path);
       
    svg.selectAll("text")
       .data(topojson.feature(map, map.objects.countries).features)
       .enter()
       .append("text")
       .attr("transform", function(d) {
         return "translate(" + path.centroid(d) + ")"; 
       })
       .attr("class", function(d) { 
         /* click event */
         this.addEventListener("click", function(){ 
           console.log(d.properties.name); 
           gdp.forEach(function(c) {
             if (c.countryName.slice(0,5) === d.properties.name.slice(0,5)) {
               console.log(c.countryName + ": " + c.millionUSD);
             }
           });
         }, false);
         return "pin"; 
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
