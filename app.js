var gdp = getJsonGDP(),
    codes= getCountryCodes(),
    tBody = document.getElementById("gdpTableBody");  

/* gdb map */
var svg = d3.select("svg#gdpMap"),
    json = "world-topo-110m.json",
    proj = d3.geo.mercator().center([0, 60]).scale(130),
    path = d3.geo.path().projection(proj);

d3.json(json, function(err, map) {
  if (err) { return console.log(error); }
    var codeNumToA3 = {};
    svg.selectAll("path")
       .data(topojson.feature(map, map.objects.countries).features)
       .enter()
       .append("path")
       .attr("d", path)
       .attr("class", function(d) {
         var a3Code = "NAC"; // NAC = not a code
         codes.forEach(function(code) {
           if (d.id === parseInt(code.num)) {
             codeNumToA3[code.num] = a3Code = code.a3;
             return;
           }
         });
         return "code" + a3Code;
       });
       
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
           gdp.forEach(function(gdp) {
             if (gdp.countryCode === codeNumToA3[d.id]) {
               console.log("map: " + d.properties.name + "[" + d.id + "]"); 
               console.log("gdp: " + gdp.countryName + "[" + gdp.countryCode + "], " + gdp.millionUSD);
             }
           });
         }, false);
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
